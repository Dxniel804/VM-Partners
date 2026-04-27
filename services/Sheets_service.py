import gspread
import os
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

SCOPE = [
    'https://spreadsheets.google.com/feeds',
    'https://www.googleapis.com/auth/drive'
]


def adicionar_linha(dados: dict):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    creds_path = os.path.join(base_dir, 'credentials.json')

    creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, SCOPE)
    client = gspread.authorize(creds)

    spreadsheet_id = os.getenv('SPREADSHEET_ID')

    sheet = client.open_by_key(spreadsheet_id).get_worksheet(0)

    row = [
        dados.get('nome', ''),
        dados.get('email', ''),
        dados.get('estado', ''),
        dados.get('linkedin', ''),
        dados.get('empresa', ''),
        dados.get('cargo', ''),
        dados.get('whatsapp', ''),
        dados.get('perfil_empresa', ''),
        dados.get('acesso_Recorrente', ''),
        dados.get('tipo_oportunidades', ''),
        dados.get('acesso_e_nivel_relacionamento', ''),
        dados.get('data', datetime.now().strftime('%d/%m/%Y %H:%M'))
    ]

    sheet.append_row(row)
    return True
