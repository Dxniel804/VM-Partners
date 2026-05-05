from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

from services.Email_service import enviar_email_avaliacao
from services.Sheets_service import adicionar_linha

load_dotenv()

app = Flask(__name__, static_folder='template', static_url_path='')
CORS(app)


@app.route('/')
def index():
    return app.send_static_file('index.html')


@app.route('/api/finalizar-avaliacao', methods=['POST'])
def finalizar_avaliacao():
    dados = request.get_json(force=True)
    if not dados:
        return jsonify({'erro': 'JSON inválido'}), 400

    resultado = {'email': None, 'sheets': None}

    try:
        enviar_email_avaliacao(dados)
        resultado['email'] = 'ok'
    except Exception as e:
        import traceback
        resultado['email'] = f'erro: {e}'
        print(f'[Email] Falha: {e}')
        traceback.print_exc()

    try:
        adicionar_linha(dados)
        resultado['sheets'] = 'ok'
    except Exception as e:
        import traceback
        resultado['sheets'] = f'erro: {e}'
        print(f'[Sheets] Falha: {e}')
        traceback.print_exc()

    status_code = 200 if 'ok' in resultado.values() else 500
    return jsonify(resultado), status_code


if __name__ == '__main__':
    app.run(debug=True, port=5000)
