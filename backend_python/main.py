from fastapi import FastAPI, HTTPException, status, Depends
from pydantic import BaseModel,Field,EmailStr
import phonenumbers
import datetime
import re 
from .models import LoginData, ResultadoQuestionario
from .auth import create_access_token,decode_access_token
import backend_python.sheets_service as sheets_service
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login") 
PENDING_DATA_TO_SHEET = [] 

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Raiz do backend para verificação rápida
@app.get("/")
def read_root(): 
    return {"status": "Backend FastAPI rodando", "endpoint_login": "/api/login"} 

@app.post("/api/login")
def login_user(data: LoginData): 
    telefone_busca_limpo = re.sub(r'[^\d]', '', data.telefone.strip())
    nome_busca_lower = data.nome.strip().lower()
    email_busca_lower = data.email.strip().lower()
    print(f"--> Requisição de LOGIN recebida. Nome: {data.nome}, Telefone: {data.telefone}, email {data.email}. Telefone limpo: {telefone_busca_limpo}") 

    try:
        # Validação de formato com phonenumbers 
        parsed_num = phonenumbers.parse(data.telefone.strip(), "BR") 
        
        if not phonenumbers.is_possible_number(parsed_num): 
            raise ValueError("O telefone fornecido não é um número possível.")
        if phonenumbers.number_type(parsed_num) != phonenumbers.PhoneNumberType.MOBILE: 
            raise ValueError("O telefone não parece ser um número de celular válido no Brasil.")

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Número de telefone inválido: {str(e)}"
        )
    # Criação do Token 
    token_data = {
        "sub": data.telefone.strip(), 
        "nome": data.nome.strip().lower(),
        "email": data.email.strip()
    }
    access_token = create_access_token(data=token_data)
    
    #2. BUSCA NA BASE DE DADOS 
    if sheets_service.STUDENTS_DATABASE is None or sheets_service.STUDENTS_DATABASE.empty:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Base de dados de alunos não disponível no momento. Tente novamente mais tarde."
        )
    telefones_planilha_limpos = sheets_service.STUDENTS_DATABASE['TELEFONE'].astype(str).str.replace(r'[^\d]', '', regex=True)
    aluno_db_match = sheets_service.STUDENTS_DATABASE[telefones_planilha_limpos == telefone_busca_limpo] 
    
    if aluno_db_match.empty:
        email_check = sheets_service.STUDENTS_DATABASE[
        sheets_service.STUDENTS_DATABASE["EMAIL"].astype(str).str.strip().str.lower() == email_busca_lower
        ]
        if not email_check.empty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O email forncecido já está vinculado a outro ID de telefone. Por favor, verifique seus dados ou use o telefone cadastrado."
                )
        
        # Se for um novo cadastro, retorna sucesso e token (sem curso)
        return {
            "status": "success",
            "message": "Cadastro inicial realizado. Prossiga para o questionário.",
            "access_token": access_token,      
            "token_type": "bearer",
            "curso": None
        } 
        
    # **FLUXO DE LOGIN EXISTENTE (Telefone encontrado)**
    aluno_data = aluno_db_match.iloc[0].to_dict()
    nome_correto_na_planilha = aluno_data.get('NOME', '').strip().lower()
    email_correto_na_planilha = aluno_data.get('EMAIL', '').strip().lower()

    # 3. VALIDAÇÃO: Confirma se o Nome confere (SENHA LÓGICA)
    if nome_busca_lower != nome_correto_na_planilha:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas. Nome de usuário incorreto."
        ) 
        
    # 4. VALIDAÇÃO: Confirma se o Email confere (SE o email já existir na planilha)
    if email_correto_na_planilha and (email_busca_lower != email_correto_na_planilha):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas. O e-mail não corresponde ao registro existente para este telefone."
        )
    # 5. ATUALIZAÇÃO DE E-MAIL (Se o campo estava vazio na planilha, aceita o novo e-mail)
    if not email_correto_na_planilha:
        print("INFO: Adicionando E-mail ao registro existente (campo estava vazio).")

    # 6. RETORNO DO STATUS DO QUESTIONÁRIO (Lógica corrigida)
    resultado_questionario = aluno_data.get('CURSO_REALIZADO', '').strip() 
    if resultado_questionario:
        # Se encontrou o curso, informa que o questionário foi realizado
        return {
            "status": "success",
            "message": f"Login realizado. Questionário já realizado! Seu curso é: {resultado_questionario.upper()}",
            "access_token": access_token,
            "token_type": "bearer",
            "curso": resultado_questionario
        } 
    else:
        # Se não encontrou o curso, é um login de um aluno existente que ainda não fez o questionário
        return {
            "status": "success",
            "message": "Login realizado. Prossiga para o questionário.",
            "access_token": access_token,
            "token_type": "bearer",
            "curso": None
        } 

@app.post("/api/submit_results")
def submit_results(data: ResultadoQuestionario, token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token) 
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    telefone_do_token = payload.get("sub") 
    email_do_token = payload.get("email","")
    nome_do_token = payload.get("nome","")

    if telefone_do_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token malformado: ID do usuário (sub) ausente.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    telefone_token_limpo = re.sub(r'[^\d]', '', telefone_do_token.strip())
    telefone_data_limpo = re.sub(r'[^\d]', '', data.telefone.strip())
    
    if telefone_token_limpo != telefone_data_limpo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inconsistência de usuário. O telefone do token não corresponde ao telefone dos dados."
        )
    if email_do_token.strip().lower() != data.email.strip().lower():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inconsistência de email. O email do token não corresponde ao email dos dados."
        )
    
    if nome_do_token.lower() != data.nome.strip().lower():
        raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Inconsistência de nome. O nome do token não corresponde ao nome dos dados."
        )
        
    telefone_busca = telefone_do_token 
    
    registro = {
        "nome": data.nome.strip(),
        "telefone_id": telefone_busca,
        "email": data.email.strip(),
        "curso_identificado": data.area_final.strip(),
        "timestamp": datetime.datetime.now().isoformat()
    } 
    PENDING_DATA_TO_SHEET.append(registro)

    return {
        "status": "success",
        "message": "Resultado do questionário armazenado com sucesso, aguardando coleta da Automação.",
        "data_received": registro
    }

@app.get("/api/coletar_dados_para_planilha")
def collect_and_clear_data():
    
    global PENDING_DATA_TO_SHEET
    data_to_send = list(PENDING_DATA_TO_SHEET) 
    PENDING_DATA_TO_SHEET = [] 
    
    print(f"INFO: {len(data_to_send)} registros coletados e a lista PENDING_DATA_TO_SHEET foi limpa.") 
    
    return {
        "status": "success",
        "count": len(data_to_send),
        "data": data_to_send
    }