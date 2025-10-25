# sheets_service.py
import gspread
from gspread.utils import ValueInputOption
import pandas as pd
import os


SERVICE_ACCOUNT_FILE = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "service_account.json")
SPREADSHEET_ID = "1Ig1s1KnuOvIJKrEY9EgXzXDZhDwP1NPfVHFJejLxL8Q"   # Nome exato da planilha
STUDENTS_DATABASE = None


def load_spreadsheet_data():
    """Autentica com o Google Sheets e carrega a primeira aba como um DataFrame."""
    global STUDENTS_DATABASE
    print("INFO: Tentando carregar a planilha...")
    
    # Verifica se o arquivo de credenciais existe antes de tentar autenticar
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"ERRO: Arquivo de credenciais não encontrado: {SERVICE_ACCOUNT_FILE}")
        STUDENTS_DATABASE = pd.DataFrame()
        return

    try:
        gc = gspread.service_account(filename=SERVICE_ACCOUNT_FILE)
        try:
            spreadsheet = gc.open_by_key(SPREADSHEET_ID)  # Abre pela NOME da planilha
        except gspread.exceptions.SpreadsheetNotFound:
            print(f"ERRO: Planilha '{SPREADSHEET_ID}' não encontrada. Verifique nome exato e compartilhamento com a service account.")
            STUDENTS_DATABASE = pd.DataFrame()
            return

        worksheet = spreadsheet.sheet1
        
        # 4. Obter todos os dados e converter para DataFrame
        data = worksheet.get_all_records()
        df = pd.DataFrame(data)
        
        # --- LIMPEZA DE DADOS CRÍTICOS (Melhor Prática) ---
        if 'TELEFONE' in df.columns:
            df['TELEFONE'] = df['TELEFONE'].astype(str).str.replace(r'[^\d]', '', regex=True)
            
        if 'NOME' in df.columns:
            df['NOME'] = df['NOME'].astype(str).str.strip()
        # ----------------------------------------------------
            
        STUDENTS_DATABASE = df
        print("INFO: Planilha carregada com sucesso!")
        
    except gspread.exceptions.APIError as e:
        print(f"ERRO DE CONEXÃO: Falha ao acessar o Google Sheets. Verifique as credenciais ou permissões (Erro 403, etc.). Detalhe: {e}")
        STUDENTS_DATABASE = pd.DataFrame() 
        
    except Exception as e:
        print(f"ERRO DESCONHECIDO ao carregar a planilha: {e}")
        STUDENTS_DATABASE = pd.DataFrame()

# Carrega os dados assim que o módulo é importado pelo main.py
load_spreadsheet_data()