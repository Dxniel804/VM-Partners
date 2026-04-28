// ─── NAV SCROLL STATE ────────────────────────────────────────────────────────
const navEl = document.querySelector('nav');
const aboutEl = document.querySelector('.about');

function updateNavState() {
  navEl.classList.toggle('scrolled', window.scrollY > 50);
}

window.addEventListener('scroll', updateNavState, { passive: true });
updateNavState();

// ─── COUNTER ANIMATION ───────────────────────────────────────────────────────
const counterEl = document.getElementById('counter-clientes');
if (counterEl) {
  const target = 2000;
  const duration = 1800;
  let started = false;

  function formatBR(n) {
    return n >= 1000
      ? Math.floor(n / 1000) + '.' + String(n % 1000).padStart(3, '0')
      : String(n);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !started) {
        started = true;
        const startTime = performance.now();
        function tick(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          counterEl.textContent = formatBR(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counterObserver.observe(counterEl);
}

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
    id: 'estado',
    ask: 'Em qual estado brasileiro você atua principalmente?',
    options: ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'Outros']
  },
  {
    id: 'linkedin',
    ask: data => `Ótimo! Se quiser, pode compartilhar o link do seu **perfil LinkedIn** para facilitar nossa análise (opcional).`,
    validate: v => !v.trim() || /^https?:\/\/(www\.)?linkedin\.com\/.+$/.test(v.trim()),
    errorMsg: 'URL inválida. Deve ser um perfil LinkedIn ou deixe em branco.'
  },
  {
    id: 'empresa',
    ask: 'Qual é o **nome da sua empresa** ou organização atual?',
    validate: v => v.trim().length >= 2,
    errorMsg: 'Informe o nome da empresa, por favor.'
  },
  {
    id: 'cargo',
    ask: data => `E qual é o seu **cargo ou função** atual na ${data.empresa}?`,
    validate: v => v.trim().length >= 2,
    errorMsg: 'Informe seu cargo ou função, por favor.'
  },
  {
    id: 'whatsapp',
    ask: 'Se preferir, pode compartilhar seu número de WhatsApp para contato (opcional).',
    validate: v => !v.trim() || /^\+?\d{7,15}$/.test(v.trim()),
    errorMsg: 'Número inválido. Informe no formato internacional, ex: +5511999998888, ou deixe em branco.'
  },
  {
    id: 'perfil_empresa',
    ask: 'Como você descreveria o perfil da sua empresa? (ex: porte, faturamento, tipo de empresa)',
    validate: v => v.trim().length >= 10,
    errorMsg: 'Conte um pouco mais sobre sua empresa (mínimo 10 caracteres).'
  },
  {
    id: 'acesso_Recorrente',
    ask: 'Você possui acesso direto e recorrente a decisores (sócios, diretores ou C-Level)?',
    options: ['Sim', 'Não']
  },
  {
    id: 'tipo_oportunidades',
    ask: 'Quando você identifica esse tipo de oportunidade, o que normalmente acontece hoje? ',
    validate: v => v.trim().length >= 10,
    errorMsg: 'Conte um pouco mais sobre as oportunidades que você costuma identificar ou participar (mínimo 10 caracteres).'
  },
  {
    id: 'acesso_e_nivel_relacionamento',
    ask: 'Como acontece o seu acesso a essas empresas e qual é o seu nível de relacionamento com os decisores? ',
    validate: v => v.trim().length >= 10,
    errorMsg: 'Conte um pouco mais sobre seu relacionamento com esses decisores (mínimo 10 caracteres).'
  },
];

const ACKS = {
  nome:        data => `Prazer, ${data.nome.split(' ')[0]}! 👋`,
  email:       ()   => 'Perfeito.',
  empresa:     ()   => 'Anotado.',
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
    <img src="imgs/fabiano_logo.jpeg" alt="" class="chat-avatar">
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
    <img src="imgs/fabiano_logo.jpeg" alt="" class="chat-avatar">
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
      nome:                          chatData.nome,
      email:                         chatData.email,
      estado:                        chatData.estado,
      linkedin:                      chatData.linkedin,
      empresa:                       chatData.empresa,
      cargo:                         chatData.cargo,
      whatsapp:                      chatData.whatsapp,
      perfil_empresa:                chatData.perfil_empresa,
      acesso_Recorrente:             chatData.acesso_Recorrente,
      tipo_oportunidades:            chatData.tipo_oportunidades,
      acesso_e_nivel_relacionamento: chatData.acesso_e_nivel_relacionamento,
      data:                          new Date().toLocaleString('pt-BR')
    };

    if (CHAT_TEST_MODE) {
      console.log('%c[VM Partners] Dados coletados (modo teste):', 'color:#FC552D;font-weight:bold', payload);
      await new Promise(r => setTimeout(r, 800));
    } else {
      const res = await fetch('/api/finalizar-avaliacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
      'Recarregue a página e tente novamente ou entre em contato diretamente com a equipe.'
    );
    input.placeholder = 'Erro ao enviar';
    console.error('[VM Partners] Erro ao enviar:', e);
  }
}

// ─── STEPS HOVER (howworks) ──────────────────────────────────────────────────
(function () {
  const band = document.getElementById('howworksBand');
  if (!band) return;

  const nums  = Array.from(band.querySelectorAll('.hw-step-num'));
  const cards = Array.from(band.querySelectorAll('.hw-card'));
  let maxIdx = -1;
  let allPermanent = false;

  function activateAll() {
    allPermanent = true;
    maxIdx = nums.length - 1;
    nums.forEach(n  => n.classList.add('active'));
    cards.forEach(c => c.classList.add('active'));
  }

  // Activate all cards when Block 3 (about) scrolls into view
  const aboutSection = document.querySelector('.about');
  if (aboutSection) {
    const aboutObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          activateAll();
          aboutObserver.disconnect();
        }
      });
    }, { threshold: 0.15 });
    aboutObserver.observe(aboutSection);
  }

  nums.forEach((num, i) => {
    num.addEventListener('mouseenter', () => {
      if (i > maxIdx) {
        maxIdx = i;
        for (let j = 0; j <= maxIdx; j++) {
          nums[j].classList.add('active');
          cards[j].classList.add('active');
        }
      }
    });
  });

  band.addEventListener('mouseleave', () => {
    if (allPermanent) return;
    maxIdx = -1;
    nums.forEach(n  => n.classList.remove('active'));
    cards.forEach(c => c.classList.remove('active'));
  });
}());

// ─── INIT ─────────────────────────────────────────────────────────────────────
function chatInit() {
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
