// ─── CONFIGURAÇÃO DO EMAILJS ──────────────────────────────────────────────────
// 1. Conta grátis em: https://www.emailjs.com
// 2. Email Service (Gmail/Outlook/etc.) → copie o Service ID
// 3. Email Template com as variáveis abaixo → copie o Template ID
// 4. Account > API Keys → copie a Public Key
//
// Variáveis para usar no template EmailJS:
//   {{nome}} {{email}} {{linkedin}} {{decisores}}
//   {{frequencia}} {{consultoria}} {{motivacao}} {{data}}
// ─────────────────────────────────────────────────────────────────────────────

const EMAILJS_SERVICE_ID  = 'SEU_SERVICE_ID';   // ex: 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'SEU_TEMPLATE_ID';  // ex: 'template_xyz789'
const EMAILJS_PUBLIC_KEY  = 'SUA_PUBLIC_KEY';   // ex: 'aBcDeFgHiJkLmNoP'

// Modo teste: true = mostra dados no console, não envia email
// Mude para false quando configurar o EmailJS
const CHAT_TEST_MODE = false;
