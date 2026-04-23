// ─── NAV SCROLL STATE ────────────────────────────────────────────────────────
const navEl = document.querySelector('nav');
const aboutEl = document.querySelector('.about');

function updateNavState() {
  const aboutTop = aboutEl.getBoundingClientRect().top;
  navEl.classList.toggle('scrolled', aboutTop <= navEl.offsetHeight + 20);
}

window.addEventListener('scroll', updateNavState, { passive: true });
updateNavState();

// ─── SCROLL ANIMATIONS ───────────────────────────────────────────────────────
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

// ─── CHATBOT POPUP ───────────────────────────────────────────────────────────
function openChat() {
  const popup = document.getElementById('chatPopup');
  const btn = document.getElementById('chatbotBtn');
  popup.classList.add('open');
  btn.setAttribute('aria-expanded', 'true');
  if (!chatStarted) {
    chatStarted = true;
    chatInit();
  }
  setTimeout(() => {
    const input = document.getElementById('chatInput');
    if (input && !input.disabled) input.focus();
  }, 350);
}

function closeChat() {
  const popup = document.getElementById('chatPopup');
  const btn = document.getElementById('chatbotBtn');
  popup.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
}

function toggleChat() {
  document.getElementById('chatPopup').classList.contains('open') ? closeChat() : openChat();
}

setTimeout(() => {
  const t = document.getElementById('chatTooltip');
  if (t) {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.5s';
    setTimeout(() => t.style.display = 'none', 500);
  }
}, 6000);

// ─── CHATBOT SCRIPTED Q&A ─────────────────────────────────────────────────────
const STEPS = [
  {
    id: 'nome',
    ask: 'Olá! Sou o assistente do **VM Partners**. Para começar, qual é o seu **nome completo**?',
    validate: v => v.trim().split(/\s+/).length >= 2,
    errorMsg: 'Informe nome e sobrenome, por favor.'
  },
  {
    id: 'email',
    ask: data => `Obrigado, ${data.nome.split(' ')[0]}! Qual é o seu **e-mail corporativo**?`,
    validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    errorMsg: 'E-mail inválido. Tente novamente.'
  },
  {
    id: 'linkedin',
    ask: 'Qual é a **URL do seu perfil no LinkedIn**?',
    validate: v => v.trim().length > 5,
    errorMsg: 'Informe a URL do seu perfil.'
  },
  {
    id: 'decisores',
    ask: 'Quantos decisores **C-Level** você acessa regularmente em empresas de médio/grande porte?',
    options: ['Menos de 5', 'Entre 5 e 15', 'Entre 15 e 30', 'Mais de 30']
  },
  {
    id: 'frequencia',
    ask: 'Com que frequência você identifica empresas com **desafios comerciais** que precisam de consultoria?',
    options: ['Semanalmente', 'Mensalmente', 'Ocasionalmente']
  },
  {
    id: 'consultoria',
    ask: 'Você já atua ou atuou com **consultoria, mentoria ou aconselhamento estratégico**?',
    options: ['Sim', 'Não']
  },
  {
    id: 'motivacao',
    ask: 'Última pergunta: **por que você acredita** que esta parceria é estratégica para o seu portfólio agora?',
    validate: v => v.trim().length >= 20,
    errorMsg: 'Conta um pouco mais (mínimo 20 caracteres).'
  }
];

const ACKS = {
  nome:        data => `Prazer, ${data.nome.split(' ')[0]}! 👋`,
  email:       ()   => 'Perfeito.',
  linkedin:    ()   => 'Anotado.',
  decisores:   ()   => 'Entendido.',
  frequencia:  ()   => 'Ótimo.',
  consultoria: data => data.consultoria === 'Sim' ? 'Experiência valiosa!' : 'Sem problema, não é requisito.'
};

let currentStep = 0;
let chatData = {};
let chatDone = false;
let chatStarted = false;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function formatMsg(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function scrollChat() {
  const el = document.getElementById('chatMessages');
  if (el) el.scrollTop = el.scrollHeight;
}

function addBotMessage(text, options = []) {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.innerHTML = `
    <div class="chat-avatar">VM</div>
    <div class="chat-bubble">${formatMsg(text)}</div>
  `;
  msgs.appendChild(div);

  const qr = document.getElementById('chatQuickReplies');
  qr.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quick-reply';
    btn.textContent = opt;
    btn.onclick = () => handleQuickReply(opt);
    qr.appendChild(btn);
  });

  scrollChat();
}

function addUserMessage(text) {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg user';
  div.innerHTML = `<div class="chat-bubble">${formatMsg(text)}</div>`;
  msgs.appendChild(div);
  document.getElementById('chatQuickReplies').innerHTML = '';
  scrollChat();
}

function showTyping() {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.id = 'typingIndicator';
  div.innerHTML = `
    <div class="chat-avatar">VM</div>
    <div class="chat-bubble typing-dots"><span></span><span></span><span></span></div>
  `;
  msgs.appendChild(div);
  scrollChat();
}

function hideTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

function setInputForStep(step) {
  const input = document.getElementById('chatInput');
  if (step && step.options) {
    input.disabled = true;
    input.placeholder = 'Selecione uma opção acima...';
  } else {
    input.disabled = false;
    input.placeholder = 'Digite sua resposta...';
    input.focus();
  }
}

// ─── FLOW ─────────────────────────────────────────────────────────────────────
function processAnswer(text) {
  const step = STEPS[currentStep];

  if (step.validate && !step.validate(text)) {
    showTyping();
    setTimeout(() => { hideTyping(); addBotMessage(step.errorMsg); }, 500);
    return;
  }

  chatData[step.id] = text;
  currentStep++;

  const ackFn = ACKS[step.id];
  const ack = ackFn ? ackFn(chatData) : '';

  showTyping();
  setTimeout(() => {
    hideTyping();

    if (currentStep >= STEPS.length) {
      if (ack) addBotMessage(ack);
      setTimeout(submitData, ack ? 600 : 0);
      return;
    }

    const next = STEPS[currentStep];
    const question = typeof next.ask === 'function' ? next.ask(chatData) : next.ask;
    const combined = ack ? `${ack}\n\n${question}` : question;
    addBotMessage(combined, next.options || []);
    setInputForStep(next);
  }, 700);
}

function chatSendMessage() {
  if (chatDone) return;
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addUserMessage(text);
  processAnswer(text);
}

function handleQuickReply(text) {
  if (chatDone) return;
  addUserMessage(text);
  processAnswer(text);
}

// ─── SUBMIT ───────────────────────────────────────────────────────────────────
async function submitData() {
  chatDone = true;
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  input.disabled = true;
  input.placeholder = 'Enviando...';
  sendBtn.disabled = true;

  showTyping();

  try {
    const payload = {
      nome:        chatData.nome,
      email:       chatData.email,
      linkedin:    chatData.linkedin,
      decisores:   chatData.decisores,
      frequencia:  chatData.frequencia,
      consultoria: chatData.consultoria,
      motivacao:   chatData.motivacao,
      data:        new Date().toLocaleString('pt-BR')
    };

    if (CHAT_TEST_MODE) {
      console.log('%c[VM Partners] Dados coletados (modo teste):', 'color:#FC552D;font-weight:bold', payload);
      await new Promise(r => setTimeout(r, 800));
    } else {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload);
    }

    hideTyping();
    addBotMessage(
      `Obrigado, **${chatData.nome.split(' ')[0]}**! 🎉\n\n` +
      `Candidatura registrada com sucesso. Nossa equipe vai analisar seu perfil e entrar em contato em até **2 dias úteis** no e-mail **${chatData.email}**.`
    );
    input.placeholder = 'Candidatura enviada — obrigado!';

  } catch (e) {
    hideTyping();
    addBotMessage(
      'Tive um problema ao enviar seus dados.\n\n' +
      'Verifique as configurações do EmailJS em **config.js** ou recarregue a página e tente novamente.'
    );
    input.placeholder = 'Erro ao enviar';
    console.error('EmailJS error:', e);
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
function chatInit() {
  if (!CHAT_TEST_MODE && (!EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY === 'SUA_PUBLIC_KEY')) {
    addBotMessage(
      '⚙️ Para ativar o assistente, configure o EmailJS no arquivo **config.js**.\n\n' +
      'Crie conta grátis em emailjs.com e preencha as 3 credenciais.'
    );
    document.getElementById('chatInput').disabled = true;
    document.getElementById('chatSend').disabled = true;
    return;
  }

  if (!CHAT_TEST_MODE) emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  showTyping();
  setTimeout(() => {
    hideTyping();
    const first = STEPS[0];
    const question = typeof first.ask === 'function' ? first.ask(chatData) : first.ask;
    addBotMessage(question, first.options || []);
    setInputForStep(first);
  }, 800);
}

const chatInputEl = document.getElementById('chatInput');
if (chatInputEl) {
  chatInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatSendMessage();
    }
  });
  chatInputEl.addEventListener('focus', () => {
    setTimeout(() => chatInputEl.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
  });
}
