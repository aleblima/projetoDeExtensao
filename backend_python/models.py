# backend_python/models.py

from pydantic import BaseModel, Field
from typing import Optional
class LoginData(BaseModel):
    nome: str
    telefone: str
    email: Optional[str] = None

class ResultadoQuestionario(BaseModel):
    nome: str
    telefone: str
    email: str
    area_final: str = Field(alias="recommendedArea")
    class Config:
        populate_by_name = True