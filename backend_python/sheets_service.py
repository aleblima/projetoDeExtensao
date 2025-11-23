import gspread
from gspread.utils import ValueInputOption
import pandas as pd
import os
from gspread import client, exceptions


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
        if 'EMAIL' in df.columns:
            df['EMAIL'] = df['EMAIL'].astype(str).str.strip().str.lower()
        # ----------------------------------------------------
            
        STUDENTS_DATABASE = df
        print("INFO: Planilha carregada com sucesso!")
        
    except gspread.exceptions.APIError as e:
        print(f"ERRO DE CONEXÃO: Falha ao acessar o Google Sheets. Verifique as credenciais ou permissões (Erro 403, etc.). Detalhe: {e}")
        STUDENTS_DATABASE = pd.DataFrame() 
        
    except Exception as e:
        print(f"ERRO DESCONHECIDO ao carregar a planilha: {e}")
        STUDENTS_DATABASE = pd.DataFrame()
        

def write_result_to_sheet(nome: str, telefone: str, email: str, curso: str):
    """
    Escreve ou atualiza o resultado do teste vocacional na planilha.
    Se o telefone já existir, atualiza a linha. Caso contrário, adiciona nova linha.
    """
    global STUDENTS_DATABASE
    
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"ERRO: Arquivo de credenciais não encontrado: {SERVICE_ACCOUNT_FILE}")
        return False
    
    try:
        # Autentica e abre a planilha
        gc = gspread.service_account(filename=SERVICE_ACCOUNT_FILE)
        spreadsheet = gc.open_by_key(SPREADSHEET_ID)
        worksheet = spreadsheet.sheet1
        
        # Limpa os dados para busca
        telefone_limpo = telefone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
        telefone_limpo = ''.join(filter(str.isdigit, telefone_limpo))
        
        # Busca se o telefone já existe na planilha
        try:
            cell = worksheet.find(telefone_limpo, in_column=1)  # Assumindo que TELEFONE está na coluna 1
            
            if cell:
                # Atualiza a linha existente
                row_number = cell.row
                worksheet.update(f'A{row_number}:D{row_number}', 
                               [[telefone_limpo, nome.strip(), email.strip().lower(), curso.strip().upper()]],
                               value_input_option=ValueInputOption.user_entered)
                print(f"INFO: Linha {row_number} atualizada com sucesso para {nome}")
                
                # Atualiza o cache local
                if STUDENTS_DATABASE is not None and not STUDENTS_DATABASE.empty:
                    mask = STUDENTS_DATABASE['TELEFONE'] == telefone_limpo
                    if mask.any():
                        STUDENTS_DATABASE.loc[mask, 'NOME'] = nome.strip()
                        STUDENTS_DATABASE.loc[mask, 'EMAIL'] = email.strip().lower()
                        STUDENTS_DATABASE.loc[mask, 'CURSO_REALIZADO'] = curso.strip().upper()
                
                return True
                
        except gspread.exceptions.CellNotFound:
            # Telefone não encontrado, adiciona nova linha
            pass
        
        # Adiciona nova linha ao final da planilha
        new_row = [telefone_limpo, nome.strip(), email.strip().lower(), curso.strip().upper()]
        worksheet.append_row(new_row, value_input_option=ValueInputOption.user_entered)
        print(f"INFO: Nova linha adicionada com sucesso para {nome}")
        
        # Atualiza o cache local adicionando o novo registro
        if STUDENTS_DATABASE is not None:
            new_record = pd.DataFrame([{
                'TELEFONE': telefone_limpo,
                'NOME': nome.strip(),
                'EMAIL': email.strip().lower(),
                'CURSO_REALIZADO': curso.strip().upper()
            }])
            STUDENTS_DATABASE = pd.concat([STUDENTS_DATABASE, new_record], ignore_index=True)
        
        return True
        
    except gspread.exceptions.APIError as e:
        print(f"ERRO DE API ao escrever na planilha: {e}")
        return False
        
    except Exception as e:
        print(f"ERRO DESCONHECIDO ao escrever na planilha: {e}")
        return False


# Carrega os dados assim que o módulo é importado pelo main.py
load_spreadsheet_data()