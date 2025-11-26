# backend_python/sheets_service.py
from dotenv import load_dotenv
load_dotenv()
import os
import json
import base64
import re
import pandas as pd
import gspread
from gspread.utils import ValueInputOption
from dotenv import load_dotenv

# Configs
SERVICE_ACCOUNT_FILE = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", None)
GOOGLE_CREDENTIALS = os.environ.get("GOOGLE_CREDENTIALS", None)
GOOGLE_CREDENTIALS_B64 = os.environ.get("GOOGLE_CREDENTIALS_B64", None)

SPREADSHEET_ID = "1Ig1s1KnuOvIJKrEY9EgXzXDZhDwP1NPfVHFJejLxL8Q"
STUDENTS_DATABASE = None


def _get_gspread_client():
   
    # 1) arquivo no disco
    if SERVICE_ACCOUNT_FILE and os.path.exists(SERVICE_ACCOUNT_FILE):
        return gspread.service_account(filename=SERVICE_ACCOUNT_FILE)

    # 2) JSON direto
    if GOOGLE_CREDENTIALS:
        creds_dict = json.loads(GOOGLE_CREDENTIALS)
        # gspread helper
        return gspread.service_account_from_dict(creds_dict)

    # 3) JSON base64
    if GOOGLE_CREDENTIALS_B64:
        creds_json = base64.b64decode(GOOGLE_CREDENTIALS_B64).decode("utf-8")
        creds_dict = json.loads(creds_json)
        return gspread.service_account_from_dict(creds_dict)

    raise RuntimeError(
        "Nenhuma credencial do Google configurada. Defina GOOGLE_APPLICATION_CREDENTIALS "
        "ou GOOGLE_CREDENTIALS (JSON) ou GOOGLE_CREDENTIALS_B64 (base64)."
    )


def load_spreadsheet_data():
    """Autentica com o Google Sheets e carrega a primeira aba como um DataFrame."""
    global STUDENTS_DATABASE
    print("INFO: Tentando carregar a planilha...")

    try:
        gc = _get_gspread_client()
    except Exception as e:
        print(f"ERRO: Não foi possível autenticar com Google Sheets: {e}")
        STUDENTS_DATABASE = pd.DataFrame()
        return

    try:
        spreadsheet = gc.open_by_key(SPREADSHEET_ID)
        worksheet = spreadsheet.sheet1

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
        print("INFO: Planilha carregada com sucesso! Linhas:", len(df))

    except Exception as e:
        # captura APIError e outros
        print(f"ERRO ao carregar planilha: {e}")
        STUDENTS_DATABASE = pd.DataFrame()


def _find_row_by_telefone(worksheet, telefone_limpo):
    """
    Procura o telefone na coluna A (1). Retorna número da linha (1-based) ou None.
    Usa comparação por telefones limpos (apenas dígitos).
    """
    try:
        col_vals = worksheet.col_values(1)  # coluna A
    except Exception as e:
        # se não for possível ler a coluna, lançamos para o caller tratar
        raise RuntimeError(f"Falha ao ler coluna A: {e}")

    for idx, val in enumerate(col_vals, start=1):
        val_limpo = re.sub(r'[^\d]', '', str(val))
        if val_limpo == telefone_limpo:
            return idx
    return None


def write_result_to_sheet(nome: str, telefone: str, email: str, curso: str):
    """
    Escreve ou atualiza o resultado do teste vocacional na planilha.
    Se o telefone já existir, atualiza a linha. Caso contrário, adiciona nova linha.
    """
    global STUDENTS_DATABASE

    # prepara credenciais/client
    try:
        gc = _get_gspread_client()
    except Exception as e:
        print(f"ERRO: Não foi possível autenticar com Google Sheets: {e}")
        return False

    try:
        spreadsheet = gc.open_by_key(SPREADSHEET_ID)
        worksheet = spreadsheet.sheet1

        # Limpa o telefone: só dígitos
        telefone_limpo = re.sub(r'[^\d]', '', str(telefone))

        # Busca a linha com o telefone (coluna A)
        row_number = _find_row_by_telefone(worksheet, telefone_limpo)

        if row_number:
            # Atualiza a linha existente (colunas A:D)
            values = [[telefone_limpo, nome.strip(), email.strip().lower(), curso.strip().upper()]]
            range_a1 = f"A{row_number}:D{row_number}"
            worksheet.update(range_a1, values, value_input_option=ValueInputOption.user_entered) # type: ignore
            print(f"INFO: Linha {row_number} atualizada com sucesso para {nome}")

            # Atualiza o cache local
            if STUDENTS_DATABASE is not None and not STUDENTS_DATABASE.empty:
                mask = STUDENTS_DATABASE['TELEFONE'] == telefone_limpo
                if mask.any():
                    STUDENTS_DATABASE.loc[mask, 'NOME'] = nome.strip()
                    STUDENTS_DATABASE.loc[mask, 'EMAIL'] = email.strip().lower()
                    STUDENTS_DATABASE.loc[mask, 'CURSO_REALIZADO'] = curso.strip().upper()

            return True

        # Se não existe, adiciona nova linha
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
