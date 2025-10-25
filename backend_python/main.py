# main.py
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel,Field
import phonenumbers
import datetime
from .models import LoginData, ResultadoQuestionario

import backend_python.sheets_service as sheets_service

PENDING_DATA_TO_SHEET = [] #


app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware
origins = ["*"] # Permite qualquer origem para desenvolvimento
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    
    return {"status": "Backend FastAPI rodando", "endpoint_login": "/login"} #

@app.post("/login")
def login_user(data: LoginData): #
    # Limpa e normaliza os dados de entrada
    telefone_busca = data.telefone.strip()
    nome_busca_lower = data.nome.strip().lower()

    print(f"--> Requisição de LOGIN recebida. Nome: {data.nome}, Telefone: {data.telefone}") #

    # --- 1. VALIDAÇÃO DE TELEFONE ---
    try:
        # Tenta analisar o número como sendo do Brasil (BR)
        parsed_num = phonenumbers.parse(telefone_busca, "BR") #
        
        # 1.1. Verifica se o número é possível
        if not phonenumbers.is_possible_number(parsed_num): #
            raise ValueError("O telefone fornecido não é um número possível.")

        # 1.2. Verifica se é um número de celular válido para o Brasil
        if phonenumbers.number_type(parsed_num) != phonenumbers.PhoneNumberType.MOBILE: #
             raise ValueError("O telefone não parece ser um número de celular válido no Brasil.")

    except Exception as e:
        # Captura erros de validação (ValueError) e formata como HTTP 400
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Número de telefone inválido: {str(e)}"
        )
    
    # --- 2. BUSCA NA BASE DE DADOS ---
    # Verifica se a base está carregada e tem dados
    if sheets_service.STUDENTS_DATABASE is None or sheets_service.STUDENTS_DATABASE.empty:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Base de dados de alunos não disponível no momento. Tente novamente mais tarde."
        )
    aluno_db_match = sheets_service.STUDENTS_DATABASE[
        sheets_service.STUDENTS_DATABASE['TELEFONE'].astype(str) == telefone_busca
    ] #
    
    if aluno_db_match.empty:
        # #2. SE NÃO ENCONTROU: O telefone não existe na base.
        # Assumimos que é um novo cadastro inicial.
        return {
            "status": "success",
            "message": "Cadastro inicial realizado. Prossiga para o questionário.",
            "aluno_id": telefone_busca,
            "curso": None
        } #
    
    # --- 3. TELEFONE ENCONTRADO ---
    aluno_data = aluno_db_match.iloc[0].to_dict()
    nome_correto_na_planilha = aluno_data.get('NOME', '').strip().lower()

    # #4. VERIFICAÇÃO SECUNDÁRIA: Checa se o nome enviado bate com o nome na planilha.
    if nome_busca_lower != nome_correto_na_planilha:
        # #5. FALHA: Telefone existe, mas o nome não corresponde.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas. Nome de usuário incorreto."
        ) #

    # #6. SUCESSO: Telefone e nome batem. Pega o resultado do curso.
    resultado_questionario = aluno_data.get('CURSO_REALIZADO', '').strip() #

    if resultado_questionario:
        # #7. Retorna o resultado salvo (Aluno JÁ CADASTRADO com Resultado).
        return {
            "status": "success",
            "message": "Login realizado e resultado encontrado!",
            "aluno_id": telefone_busca,
            "curso": resultado_questionario
        } #
    else:
        # #8. Retorna para cadastro (Aluno CADASTRADO SEM RESULTADO, ou resultado vazio).
        return {
            "status": "success",
            "message": "Cadastro inicial realizado. Prossiga para o questionário.",
            "aluno_id": telefone_busca,
            "curso": None
        } #


@app.post("/submit_results")
def submit_results(data: ResultadoQuestionario):
    """Armazena o resultado do questionário na lista PENDING_DATA_TO_SHEET."""
    telefone_busca = data.telefone.strip() #
    
    registro = {
        "nome": data.nome.strip(),
        "telefone_id": telefone_busca,
        "curso_identificado": data.area_final.strip(),
        "timestamp": datetime.datetime.now().isoformat()
    } #
    PENDING_DATA_TO_SHEET.append(registro) #

    return {
        "status": "success",
        "message": "Resultado do questionário armazenado com sucesso, aguardando coleta da Automação.",
        "data_received": registro
    } #

@app.get("/coletar_dados_para_planilha")
def collect_and_clear_data():
    
    global PENDING_DATA_TO_SHEET
    
    data_to_send = list(PENDING_DATA_TO_SHEET) #
    
    # Limpa a lista global para evitar duplicação na próxima coleta
    PENDING_DATA_TO_SHEET = [] #
    
    print(f"INFO: {len(data_to_send)} registros coletados e a lista PENDING_DATA_TO_SHEET foi limpa.") #
    
    return {
        "status": "success",
        "count": len(data_to_send),
        "data": data_to_send
    } 