let kmAtualReal = 152000;
let modoTeste = true;
let kmTeste = 300000;

let kmAtual = modoTeste ? kmTeste : kmAtualReal;
// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDxIxFwkQb0xEoysQqTDjwK-ijERK0p67w",
  authDomain: "controle-carro-12e8d.firebaseapp.com",
  projectId: "controle-carro-12e8d",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let isAdmin = false;
// 👇 PRIMEIRA COISA DO ARQUIVO

 const manutencoesBase = [

  { categoria: "🛢 Motor", item: "Óleo do motor", kmTroca: 10000, diasTroca: 180, custoMedio: 70 },
  { categoria: "🛢 Motor", item: "Filtro de óleo", kmTroca: 10000, diasTroca: 180, custoMedio: 20 },
  { categoria: "🛢 Motor", item: "Filtro de ar", kmTroca: 15000, diasTroca: 365, custoMedio: 20 },
  { categoria: "🛢 Motor", item: "Filtro combustível", kmTroca: 20000, diasTroca: 365, custoMedio: 40 },
  { categoria: "🛢 Motor", item: "Velas", kmTroca: 30000, diasTroca: 730, custoMedio: 60 },
  { categoria: "🛢 Motor", item: "Correia dentada", kmTroca: 80000, diasTroca: 1825, custoMedio: 400 },
  { categoria: "🛢 Motor", item: "Bomba de água", kmTroca: 80000, diasTroca: 1825, custoMedio: 250 },

  { categoria: "🛑 Freios", item: "Pastilhas de freio", kmTroca: 20000, diasTroca: 365, custoMedio: 120 },
  { categoria: "🛑 Freios", item: "Discos de freio", kmTroca: 40000, diasTroca: 730, custoMedio: 250 },
  { categoria: "🛑 Freios", item: "Fluido de freio", kmTroca: 30000, diasTroca: 365, custoMedio: 60 },

  { categoria: "🛞 Pneus", item: "Pneus", kmTroca: 40000, diasTroca: 730, custoMedio: 280 },
  { categoria: "🛞 Pneus", item: "Alinhamento", kmTroca: 10000, diasTroca: 180, custoMedio: 40 },
  { categoria: "🛞 Pneus", item: "Balanceamento", kmTroca: 10000, diasTroca: 180, custoMedio: 30 },

  { categoria: "🚗 Suspensão", item: "Amortecedores", kmTroca: 60000, diasTroca: 1460, custoMedio: 300 },
  { categoria: "🚗 Suspensão", item: "Molas", kmTroca: 80000, diasTroca: 1825, custoMedio: 200 },

  { categoria: "🔋 Elétrica", item: "Bateria", kmTroca: 0, diasTroca: 730, custoMedio: 120 },
  { categoria: "🔋 Elétrica", item: "Alternador", kmTroca: 100000, diasTroca: 1825, custoMedio: 350 },

  { categoria: "❄️ Arrefecimento", item: "Radiador", kmTroca: 100000, diasTroca: 1825, custoMedio: 250 },
  { categoria: "❄️ Arrefecimento", item: "Líquido de arrefecimento", kmTroca: 30000, diasTroca: 365, custoMedio: 50 },

  { categoria: "🌬️ Ar-condicionado", item: "Recarga de gás", kmTroca: 30000, diasTroca: 365, custoMedio: 80 },
  { categoria: "🌬️ Ar-condicionado", item: "Compressor", kmTroca: 100000, diasTroca: 1825, custoMedio: 400 },

  // ⚠️ VERIFICAÇÕES IMPORTANTES
  { categoria: "⚠️ Verificações", item: "Nível do óleo do motor", kmTroca: null, diasTroca: 7, custoMedio: 0 },
  { categoria: "⚠️ Verificações", item: "Água do radiador", kmTroca: null, diasTroca: 7, custoMedio: 0 },
  { categoria: "⚠️ Verificações", item: "Pressão dos pneus", kmTroca: null, diasTroca: 7, custoMedio: 0 },
  { categoria: "⚠️ Verificações", item: "Reservatório limpa-vidros", kmTroca: null, diasTroca: 7, custoMedio: 0 },
  { categoria: "⚠️ Verificações", item: "Luzes do veículo", kmTroca: null, diasTroca: 15, custoMedio: 0 },
  { categoria: "⚠️ Verificações", item: "Palhetas do limpa-vidros", kmTroca: null, diasTroca: 15, custoMedio: 0 },
  { categoria: "⚠️ Verificações", item: "Estado dos pneus", kmTroca: null, diasTroca: 30, custoMedio: 0 },
  { categoria: "⚠️ Verificações", item: "Bateria (verificação)", kmTroca: null, diasTroca: 30, custoMedio: 0 }

];

// 👇 DEPOIS continua teu código normal


// 🔐 VERIFICAR USUÁRIO
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  let doc = await db.collection("admins").doc(user.uid).get();

  if (doc.exists) {
    isAdmin = true;
  }
  
 await criarManutencoesIniciais();

carregarDados();
carregarManutencoes();
carregarAlertasHome();
carregarHistoricoFinanceiro(); // 🔥 AQUI

// 🔥 AQUI DENTRO
renderizarManutencoesBase();
});
 

// 📊 DADOS FIXOS
let totalFinanciamento = 20000;
let valorPagoBanco = 0;

let dividaTotal = 13371;
let valorPagoAcordo = 0;


// 🔄 CARREGAR
async function carregarDados() {

  let user = auth.currentUser;

  let snapshot = await db.collection("pagamentos")
    .where("uid", "==", user.uid)
    .get();

  let html = "";

  let totalBanco = 0;
  let totalAcordo = 0;

  snapshot.forEach(doc => {
    let p = doc.data();

    html += `
      <p>
        ${p.tipo === "financiamento" ? "💳 Financiamento" : "🤝 Acordo"} <br>
        €${p.valor} <br>
        ${new Date(p.data).toLocaleDateString()}
      </p>
    `;

    if (p.tipo === "financiamento") {
      totalBanco += p.valor;
    }

    if (p.tipo === "acordo") {
      totalAcordo += p.valor;
    }
  });

  valorPagoBanco = totalBanco;
  valorPagoAcordo = totalAcordo;
  // 🔥 BUSCAR VALORES DO FIREBASE

let financiamentoFalta = 0;

try {
  let docControle = await db.collection("controle").doc("carro").get();

  if (docControle.exists) {
    let dados = docControle.data();

    totalFinanciamento = dados.financiamento_total;
  
    dividaTotal = dados.acordo_total;
  }
} catch (e) {
  console.log("Erro Firebase:", e);
}

  let restanteBanco = totalFinanciamento - valorPagoBanco;
  if (restanteBanco < 0) restanteBanco = 0;

  let restanteAcordo = dividaTotal - valorPagoAcordo;
  if (restanteAcordo < 0) restanteAcordo = 0;

document.getElementById("totalBanco").innerText =
  "Dívida total: €" + totalFinanciamento;
  
  document.getElementById("pagoBanco").innerText =
    "Pago: €" + valorPagoBanco;

  document.getElementById("restanteBanco").innerText =
    "Falta: €" + restanteBanco;

  document.getElementById("dividaTotal").innerText =
    "Dívida total: €" + dividaTotal;

  document.getElementById("pagoAcordo").innerText =
    "Pago: €" + valorPagoAcordo;

  document.getElementById("restanteAcordo").innerText =
    "Falta: €" + restanteAcordo;
  const pagamento = calcularProximoPagamento();

document.getElementById("proximoBanco").innerText =
  "📅 Próximo pagamento: " + pagamento.data.toLocaleDateString();

document.getElementById("dataBanco").innerText =
  pagamento.texto || "Pagamento em dia";

}

// ➕ PAGAR FINANCIAMENTO
window.pagarParcela = async function () {
  let valor = Number(document.getElementById("inputBanco").value);
  if (!valor || valor <= 0) return alert("Valor inválido");

  let user = auth.currentUser;

  let data = new Date().toISOString();

  await db.collection("pagamentos").add({
    uid: user.uid,
    tipo: "financiamento",
    valor: valor,
    data: data
  });

  document.getElementById("inputBanco").value = "";

  carregarDados();
};


// ➕ PAGAR ACORDO
window.pagarAcordo = async function () {
  let valor = Number(document.getElementById("inputAcordo").value);
  if (!valor || valor <= 0) return alert("Valor inválido");

  let user = auth.currentUser;

  let data = new Date().toISOString();

  await db.collection("pagamentos").add({
    uid: user.uid,
    tipo: "acordo",
    valor: valor,
    data: data
  });

  document.getElementById("inputAcordo").value = "";

  carregarDados();
};


// 🧠 TESTE BOTÃO SCORE
window.abrirScore = function () {
  alert("Score abrindo...");
};
window.salvarManutencao = async function () {
  let user = auth.currentUser;

  if (!user) {
    alert("Usuário não autenticado");
    return;
  }

 await db.collection("manutencoes").add({
  uid: user.uid,
  categoria: "Freios",
  item: "Pastilhas de freio",
  valor: 120,
  km: kmAtual,
  data: new Date().toISOString(),
  observacao: "teste app",
  tipo: "realizada" // 🔥 ESSENCIAL
});

  alert("Manutenção salva 🚗");
carregarManutencoes();
carregarAlertasHome();
};

async function carregarManutencoes() {
    let user = auth.currentUser;

    if (!user) return;

    const snapshot = await db.collection("manutencoes")
        .where("uid", "==", user.uid)
        .orderBy("data", "desc")
        .get();

    const historico = document.getElementById("historicoManutencao");
    historico.innerHTML = "";
  const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

snapshot.forEach(doc => {
    const m = doc.data();
  if (m.tipo !== "realizada") return;

  function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const base = manutencoesBase.find(b =>
  normalizar(b.categoria) === normalizar(m.categoria) &&
  (
    normalizar(b.item).includes(normalizar(m.item)) ||
    normalizar(m.item).includes(normalizar(b.item))
  )
);
    let statusInfo = null;

    if (base) {
        statusInfo = calcularStatusManutencao(base, m, kmAtual);
    }

    let cor = "🟢";
    if (statusInfo?.status === "amarelo") cor = "🟡";
    if (statusInfo?.status === "vermelho") cor = "🔴";

    historico.innerHTML += `
<div style="margin:10px; padding:10px; background:#1e293b; border-radius:10px;">
<strong>${cor} ${m.categoria}</strong><br>
${m.item}<br>
€${m.valor}<br>
${statusInfo && statusInfo.kmRestante !== null ? "KM: " + statusInfo.kmRestante : ""}<br>
${statusInfo && statusInfo.diasRestantes !== null ? "Dias: " + statusInfo.diasRestantes : ""}<br>
</div>
`;
});
}
function calcularStatusManutencao(base, ultimaManutencao, kmAtualParam) {

  // 📏 KM
  let kmRestante = null;

 if (base.kmTroca > 0) {
  let kmBase = ultimaManutencao?.km || 0;
  let kmRodado = kmAtualParam - kmBase;
  kmRestante = base.kmTroca - kmRodado;
}

  // ⏱️ TEMPO
  let diasRestantes = null;

 if (base.diasTroca > 0) {
  let dataBase = ultimaManutencao?.data 
    ? new Date(ultimaManutencao.data)
    : new Date(0); // 1970 (nunca feito)

 let hoje = new Date();

// 🔥 CORREÇÃO
hoje.setHours(0,0,0,0);
dataBase.setHours(0,0,0,0);

let diasPassados = Math.floor((hoje - dataBase) / (1000 * 60 * 60 * 24));
diasRestantes = base.diasTroca - diasPassados;
}

  // 🎯 STATUS (quem vencer primeiro manda)
  let status = "verde";

  if (
    (kmRestante !== null && kmRestante <= 0) ||
    (diasRestantes !== null && diasRestantes <= 0)
  ) {
    status = "vermelho";
  } else if (
    (kmRestante !== null && kmRestante <= 1000) ||
    (diasRestantes !== null && diasRestantes <= 3)
  ) {
    status = "amarelo";
  }

  return {
    kmRestante,
    diasRestantes,
    status
  };
}
function abrirAba(nome) {
  document.getElementById("aba-home").style.display = "none";
  document.getElementById("aba-financeiro").style.display = "none";
  document.getElementById("aba-manutencao").style.display = "none";

  document.getElementById("aba-" + nome).style.display = "block";
}
abrirAba("home");

async function renderizarManutencoesBase() {
  const container = document.getElementById("listaManutencao");
  if (!container) return;

  container.innerHTML = "";

  let user = auth.currentUser;
  if (!user) return;

  const snapshot = await db.collection("manutencoes")
    .where("uid", "==", user.uid)
    .get();

  let historico = [];
  snapshot.forEach(doc => historico.push(doc.data()));

  const normalizar = (texto) =>
    texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
 const listaOrdenada = [...manutencoesBase].sort((a, b) => {

  const getUltima = (item) => {
    let filtradas = historico.filter(m =>
      normalizar(m.item).includes(normalizar(item.item)) ||
      normalizar(item.item).includes(normalizar(m.item))
    );

    if (filtradas.length === 0) return null;

    filtradas.sort((x, y) => new Date(y.data) - new Date(x.data));
    return filtradas[0];
  };

  const ultimaA = getUltima(a);
  const ultimaB = getUltima(b);

  const statusA = calcularStatusManutencao(a, ultimaA, kmAtual).status;
  const statusB = calcularStatusManutencao(b, ultimaB, kmAtual).status;

  const ordem = { vermelho: 0, amarelo: 1, verde: 2 };

  return ordem[statusA] - ordem[statusB];
});
listaOrdenada.forEach(item => {
    if (alertasIgnorados.includes(item.item)) return;

    // 🔎 pega última manutenção real
    let filtradas = historico.filter(m =>
      normalizar(m.item).includes(normalizar(item.item)) ||
      normalizar(item.item).includes(normalizar(m.item))
    );

    let ultima = null;

    if (filtradas.length > 0) {
      filtradas.sort((a, b) => new Date(b.data) - new Date(a.data));
      ultima = filtradas[0];
    }

    const statusInfo = calcularStatusManutencao(item, ultima, kmAtual);
    let status = "🟢";
    let textoStatus = "OK";

    if (statusInfo.status === "vermelho") {
      status = "🔴";
      textoStatus = "Troca atrasada!";
    } else if (statusInfo.status === "amarelo") {
      status = "🟡";
      textoStatus = "Próximo da troca";
    }

    // 🔥 TEXTO INTELIGENTE (igual tu pediu)
    let detalhe = "";

    if (statusInfo.kmRestante !== null) {
      if (statusInfo.kmRestante <= 0) {
        detalhe += "🚨 Atrasado em " + Math.abs(statusInfo.kmRestante) + " km\n";
      } else {
        detalhe += "📏 Faltam " + statusInfo.kmRestante + " km\n";
      }
    }

    if (statusInfo.diasRestantes !== null) {
      if (statusInfo.diasRestantes <= 0) {
        detalhe += "⏰ Atrasado em " + Math.abs(statusInfo.diasRestantes) + " dias";
      } else {
        detalhe += "📅 Faltam " + statusInfo.diasRestantes + " dias";
      }
    }

    // 🔹 CARD
    const card = document.createElement("div");
    card.style.margin = "12px";
    card.style.padding = "14px";
    card.style.background = "linear-gradient(135deg, #1e293b, #0f172a)";
    card.style.borderRadius = "12px";
    card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
    card.style.color = "white";

    const categoria = document.createElement("div");
    categoria.style.fontSize = "16px";
    categoria.style.fontWeight = "bold";
    categoria.style.marginBottom = "6px";
    categoria.innerText = "🔧 " + status + " " + item.categoria;

    const itemDiv = document.createElement("div");
    itemDiv.style.fontSize = "15px";
    itemDiv.style.marginBottom = "6px";
    itemDiv.innerText = item.item;

    const custo = document.createElement("div");
    custo.style.fontSize = "14px";
    custo.style.opacity = "0.8";
    custo.innerText = "💰 Custo médio: €" + item.custoMedio;

    const troca = document.createElement("div");
    troca.style.fontSize = "14px";
    troca.style.marginTop = "6px";
    troca.innerText =
      "⏱ " +
      (item.kmTroca ? item.kmTroca + " km" : "") +
      (item.diasTroca ? " / " + item.diasTroca + " dias" : "");

    const detalheDiv = document.createElement("div");
    detalheDiv.style.marginTop = "6px";
    detalheDiv.style.fontSize = "13px";
    detalheDiv.innerText = detalhe;

    const statusDiv = document.createElement("div");
    statusDiv.style.marginTop = "6px";
    statusDiv.style.fontSize = "13px";
    statusDiv.innerText = textoStatus;

    card.appendChild(categoria);
    card.appendChild(itemDiv);
    card.appendChild(custo);
    card.appendChild(troca);
    card.appendChild(detalheDiv);
    card.appendChild(statusDiv);

    container.appendChild(card);
  });
}
// 👉 CHAMA FORA
async function carregarAlertasHome() {
  let user = auth.currentUser;
  if (!user) return;

  const snapshot = await db.collection("manutencoes")
    .where("uid", "==", user.uid)
    .get();

  console.log("Manutenções encontradas:", snapshot.size);

  const alertasDiv = document.getElementById("alertasHome");
  let alertas = [];
  // 💰 ALERTA DE PAGAMENTO
const pagamento = calcularProximoPagamento();

if (pagamento.status !== "verde") {

  alertas.push({
    tipo: "pagamento",
    statusInfo: pagamento
  });

}

  // 🔥 transforma snapshot em array
  let historico = [];
  snapshot.forEach(doc => historico.push(doc.data()));

  // 🔥 função pra comparar texto
  const normalizar = (texto) =>
    texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 🔥 percorre TODA a base
  manutencoesBase.forEach(base => {

    let manutencoesFiltradas = historico.filter(m => {
      return normalizar(m.item).includes(normalizar(base.item)) ||
             normalizar(base.item).includes(normalizar(m.item));
    });

    let ultima = null;

    if (manutencoesFiltradas.length > 0) {
      manutencoesFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));
      ultima = manutencoesFiltradas[0];
    }

    const status = calcularStatusManutencao(base, ultima, kmAtual);

    console.log(base.item, status);

    if (status.status === "vermelho" || status.status === "amarelo") {

      alertas.push({
        ...base,
        statusInfo: status
      });

    }

  });

  if (alertas.length === 0) {
    alertasDiv.innerText = "✅ Tudo em dia";
  } else {

    let html = "";
// 🔥 ALERTA FINANCEIRO
let hoje = new Date();
let diaPagamento = 4;

let proximo = new Date(hoje.getFullYear(), hoje.getMonth(), diaPagamento);

if (hoje.getDate() > diaPagamento) {
  proximo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, diaPagamento);
}

let diff = Math.ceil((proximo - hoje) / (1000 * 60 * 60 * 24));

if (diff <= 5) { // 👈 botei 5 pra testar melhor

  let cor = diff <= 0 ? "🔴" : "🟡";
  let texto = diff <= 0 ? "Pagamento vencido" : "Faltam " + diff + " dias";

  html += `
  <div style="margin:8px; padding:10px; background:#1e293b; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
    
    <div>
      <strong>${cor} Pagamento do financiamento</strong><br>
      <span>${texto}</span>
    </div>

    <div style="margin-left:10px;">
      <button onclick="fecharAlertaFinanceiro()" style="width:35px; height:35px; font-size:16px;">
        ❌
      </button>
    </div>

  </div>
  `;
}

alertas.forEach(item => {
 // 🔥 ALERTA DE PAGAMENTO (TRATAMENTO ESPECIAL)
  if (false && item.tipo === "pagamento") {

  let cor = item.statusInfo.status === "vermelho" ? "🔴" : "🟡";

  html += '<div style="margin:8px; padding:10px; background:#1e293b; border-radius:10px;">';

  html += '<strong style="font-size:18px;">' + cor + ' Pagamento do financiamento</strong><br>';

  html += '<span style="font-size:15px;">' + item.statusInfo.texto + '</span>';

  html += '</div>';

  return;
}
  let cor = "🟢";
  if (item.statusInfo.status === "amarelo") cor = "🟡";
  if (item.statusInfo.status === "vermelho") cor = "🔴";

  html += '<div style="margin:8px; padding:10px; background:#1e293b; border-radius:10px; display:flex; justify-content:space-between; align-items:flex-start;">';

// 🔹 BLOCO DO TEXTO
html += '<div style="padding-right:10px;">';

html += '<strong style="font-size:18px; letter-spacing:0.5px; line-height:1.2;">' + cor + ' ' + item.item + '</strong><br>';
html += '<span style="font-size:16px;">💰 €' + item.custoMedio + '</span><br>';

if (item.statusInfo.kmRestante !== null) {
  html += '<span style="font-size:15px; opacity:0.9;">KM: ' + item.statusInfo.kmRestante + '</span><br>';
}

if (item.statusInfo.diasRestantes !== null) {
  html += '<span style="font-size:15px; opacity:0.9;">Dias: ' + item.statusInfo.diasRestantes + '</span>';
}

html += '</div>';

// 🔹 BLOCO DOS BOTÕES
html += '<div style="display:flex; gap:5px; align-items:flex-start;">';

html += '<button onclick="ignorarAlerta(\'' + item.item + '\')" style="width:32px; height:32px; padding:0; font-size:16px;">❌</button>';

html += '<button onclick="confirmarAlerta(\'' + item.item + '\')" style="width:32px; height:32px; padding:0; font-size:16px; background:green;">✔️</button>';

html += '</div>';

html += '</div>';
});

alertasDiv.innerHTML = html;
  }
}
async function criarManutencoesIniciais() {
  let user = auth.currentUser;
  if (!user) return;

  const snapshot = await db.collection("manutencoes")
    .where("uid", "==", user.uid)
    .get();

  if (!snapshot.empty) return;

  for (let item of manutencoesBase) {
    await db.collection("manutencoes").add({
      uid: user.uid,
      categoria: item.categoria,
      item: item.item,
      valor: item.custoMedio,
      km: 100000,
      data: new Date(2020, 0, 1).toISOString(),
      observacao: "criado automático"
    });
  }

  console.log("Manutenções iniciais criadas 🚗");
}
window.confirmarAlerta = async function(nomeItem) {

  let user = auth.currentUser;
  if (!user) return;

  let base = manutencoesBase.find(b => b.item === nomeItem);
  if (!base) return;

  await db.collection("manutencoes").add({
    uid: user.uid,
    categoria: base.categoria,
    item: base.item,
    valor: base.custoMedio,
    km: kmAtual,
    data: new Date().toISOString(),
    observacao: "feito pelo alerta"
  });

  alert("✅ Manutenção registrada!");

  carregarManutencoes();
  carregarAlertasHome();
};
let alertasIgnorados = [];

window.ignorarAlerta = function(nomeItem) {
  alertasIgnorados.push(nomeItem);
  carregarAlertasHome();
};
function calcularProximoPagamento() {
  const hoje = new Date();
  hoje.setHours(0,0,0,0);

  let ano = hoje.getFullYear();
  let mes = hoje.getMonth();

  let vencimento = new Date(ano, mes, 4);
  vencimento.setHours(0,0,0,0);

  if (hoje > vencimento) {
    vencimento = new Date(ano, mes + 1, 4);
    vencimento.setHours(0,0,0,0);
  }

  const diff = Math.floor((vencimento - hoje) / (1000 * 60 * 60 * 24));

  let status = "verde";
  let texto = "";

  if (diff === 0) {
    status = "vermelho";
    texto = "Hoje é o pagamento";
  } else if (diff < 0) {
    status = "vermelho";
    texto = "Atrasado há " + Math.abs(diff) + " dias";
  } else if (diff <= 4) {
    status = "amarelo";
    texto = "Faltam " + diff + " dias";
  }

  return {
    data: vencimento,
    diasRestantes: diff,
    status,
    texto
  };
}
async function carregarHistoricoFinanceiro() {

  let user = auth.currentUser;
  if (!user) return;

  const snapshot = await db.collection("pagamentos")
    .where("uid", "==", user.uid)
    .orderBy("data", "desc")
    .get();

  const container = document.getElementById("historicoFinanceiro");
  if (!container) return;

  container.innerHTML = "";

  snapshot.forEach(doc => {
    const p = doc.data();

    container.innerHTML += `
      <div style="margin:10px; padding:10px; background:#1e293b; border-radius:10px;">
        <strong>${p.tipo === "financiamento" ? "💰 Financiamento" : "🤝 Acordo"}</strong><br>
        €${p.valor}<br>
        ${new Date(p.data).toLocaleDateString()}
      </div>
    `;
  });

}
window.fecharAlertaFinanceiro = function () {
  const alertasDiv = document.getElementById("alertasHome");
  if (!alertasDiv) return;

  // remove só o alerta financeiro
  const itens = alertasDiv.children;

  for (let i = 0; i < itens.length; i++) {
    if (itens[i].innerText.includes("Pagamento do financiamento")) {
      itens[i].remove();
      break;
    }
  }
};
