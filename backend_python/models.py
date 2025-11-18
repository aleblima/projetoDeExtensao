# backend_python/models.py

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
class LoginData(BaseModel):
    nome: str = Field(alias="name")
    telefone: str = Field(alias="phone")
    email: EmailStr

class ResultadoQuestionario(BaseModel):
    nome: str
    telefone: str
    email: EmailStr
    area_final: str = Field(alias="recommendedArea")
    class Config:
        populate_by_name = True