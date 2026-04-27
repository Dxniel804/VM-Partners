import resend
import os
from dotenv import load_dotenv

load_dotenv()


def enviar_email_avaliacao(dados: dict):
    resend.api_key = os.getenv('RESEND_API_KEY')

    recipient = os.getenv('RECIPIENT_EMAIL', 'dani.guto911@gmail.com')

    html_body = f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    body {{
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #f4f4f7;
      margin: 0;
      padding: 0;
    }}
    .container {{
      max-width: 600px;
      margin: 32px auto;
      background: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }}
    .header {{
      background: #0a0a0a;
      padding: 28px 36px;
      text-align: center;
    }}
    .header h1 {{
      color: #ffffff;
      font-size: 20px;
      margin: 0;
      letter-spacing: 0.5px;
    }}
    .header span {{
      color: #FC552D;
    }}
    .body {{
      padding: 32px 36px;
    }}
    .section-title {{
      font-size: 11px;
      font-weight: 700;
      color: #FC552D;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 8px;
    }}
    .field {{
      margin-bottom: 14px;
    }}
    .field label {{
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }}
    .field p {{
      margin: 0;
      font-size: 15px;
      color: #1a1a1a;
    }}
    .motivacao-box {{
      background: #f8f8fb;
      border-left: 3px solid #FC552D;
      border-radius: 4px;
      padding: 14px 16px;
      font-size: 15px;
      color: #1a1a1a;
      margin-top: 4px;
      line-height: 1.6;
    }}
    .footer {{
      background: #f8f8fb;
      padding: 18px 36px;
      text-align: center;
      font-size: 12px;
      color: #aaa;
      border-top: 1px solid #ececec;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>VM Partners · <span>Nova Avaliação</span></h1>
    </div>
    <div class="body">
      <div class="section-title">Dados de Contato</div>
      <div class="field">
        <label>Nome</label>
        <p>{dados.get('nome', '—')}</p>
      </div>
      <div class="field">
        <label>E-mail</label>
        <p>{dados.get('email', '—')}</p>
      </div>
      <div class="field">
        <label>Empresa</label>
        <p>{dados.get('empresa', '—')}</p>
      </div>

      <div class="section-title" style="margin-top:24px;">Qualificação</div>
      <div class="field">
        <label>Estado</label>
        <p>{dados.get('estado', '—')}</p>
      </div>
      <div class="field">
        <label>LinkedIn</label>
        <p>{dados.get('linkedin', '—')}</p>
      </div>
      <div class="field">
        <label>Cargo</label>
        <p>{dados.get('cargo', '—')}</p>
      </div>
      <div class="field">
        <label>WhatsApp</label>
        <p>{dados.get('whatsapp', '—')}</p>
      </div>
      <div class="field">
        <label>Perfil da Empresa</label>
        <p>{dados.get('perfil_empresa', '—')}</p>
      </div>
      <div class="field">
        <label>Acesso Recorrente a Decisores</label>
        <p>{dados.get('acesso_Recorrente', '—')}</p>
      </div>
      <div class="field">
        <label>Tipo de Oportunidades</label>
        <div class="motivacao-box">{dados.get('tipo_oportunidades', '—')}</div>
      </div>
      <div class="field">
        <label>Acesso e Nível de Relacionamento</label>
        <div class="motivacao-box">{dados.get('acesso_e_nivel_relacionamento', '—')}</div>
      </div>

      <div class="field" style="margin-top:24px;">
        <label>Recebido em</label>
        <p>{dados.get('data', '—')}</p>
      </div>
    </div>
    <div class="footer">VM Partners · VendaMais — Este e-mail foi gerado automaticamente.</div>
  </div>
</body>
</html>
"""

    params = {
        "from": "onboarding@resend.dev",
        "to": [recipient],
        "subject": f"🚀 Nova Avaliação — {dados.get('nome', 'Candidato')} ({dados.get('empresa', '')})",
        "html": html_body,
    }

    email = resend.Emails.send(params)
    return email
