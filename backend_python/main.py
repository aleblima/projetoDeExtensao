import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from supabase import create_client, Client
from pydantic import BaseModel
from typing import Dict, Any
from models import LoginData, ResultadoQuestionario
from auth import create_access_token, decode_access_token
import re
from typing import Optional,Dict,Any
import phonenumbers
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int (os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES",60))
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

app = FastAPI()

#rotas e caminhos que o backend pode aceitar 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://projeto-extensao-pi.vercel.app","http://192.168.0.12:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "OK", "message": "Backend rodando com Supabase"}

@app.post("/api/login")
def login(data: LoginData):
    
    telefone = re.sub(r"[^\d]", "", data.telefone)

    # 1. Busca o aluno no Supabase
    resp = supabase.table("banco_de_alunos").select("*").eq("telefone", telefone).execute()

    if len(resp.data) == 0:
        # cadastro novo
        novo = supabase.table("banco_de_alunos").insert({
            "telefone": telefone,
            "nome": data.nome.strip(),
            "email": data.email.strip(),
            "curso_realizado": None
        }).execute()

        token = create_access_token({"sub": telefone})
        return {
            "status": "novo",
            "message": "Cadastro criado. Prossiga para o questionário.",
            "hasResult": False,
            "token": token
        }
    # aluno EXISTE
    aluno: Optional[Dict[str, Any]] = None
    if resp.data and isinstance(resp.data[0], dict):
        aluno = resp.data[0]

    if aluno is None:
        raise HTTPException(500, "Erro interno inesperado: aluno não encontrado após consulta.")

    token = create_access_token({"sub": telefone})

    return {
        "status": "ok",
        "nome": aluno.get("nome"),
        "telefone": aluno.get("telefone"),
        "email": aluno.get("email"),
        "hasResult": aluno.get("curso_realizado") is not None,
        "curso": aluno.get("curso_realizado"),
        "token": token
    }

@app.post("/api/submit_results")
def submit_results(data: ResultadoQuestionario, token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(401, "Token inválido")

    telefone_token = payload.get("sub")
    telefone_limpo = re.sub(r"[^\d]", "", data.telefone)

    if telefone_limpo != telefone_token:
        raise HTTPException(401, "Token não corresponde ao telefone enviado")

    # Verifica se o aluno existe
    resp = supabase.table("banco_de_alunos").select("*").eq("telefone", telefone_token).execute()
    if not resp.data:
        raise HTTPException(404, "Aluno não encontrado")

    aluno = resp.data[0] if isinstance(resp.data[0], dict) else None
    if aluno is None:
        raise HTTPException(500, "Erro interno inesperado: aluno não encontrado após consulta.")

    # Atualiza com o resultado e a área recomendada
    update_resp = supabase.table("banco_de_alunos") \
        .update({"curso_realizado": data.curso, "area_recomendada": data.area_final}) \
        .eq("telefone", telefone_token) \
        .execute()

    if update_resp.status_code != 200:
        raise HTTPException(500, "Erro ao atualizar os dados no banco de dados.")

    return {
        "status": "success",
        "message": "Resultado salvo com sucesso",
        "curso": data.curso,
        "area": data.area_final
    }
#se pode fazer o teste)
@app.get("/api/test_access")
def test_access(telefone: str):

    telefone_limpo = re.sub(r"[^\d]", "", telefone)

    resp = supabase.table("banco_de_alunos").select("*").eq("telefone", telefone_limpo).execute()
    if len(resp.data) == 0:
        return {"canProceed": True, "curso": None}

    aluno:Optional[ Dict[str, Any]] = None
    if resp.data and isinstance (resp.data[0], dict):
        aluno = resp.data[0]

        if aluno["curso_realizado"] is None:
            return {"canProceed": True, "curso": None}
        else:
            return {"canProceed": False, "curso": aluno["curso_realizado"]}
