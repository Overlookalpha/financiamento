let kmAtual = 0;
let reservaReal = 0;
let kmInicialSistema = 0;
let kmRodadoGlobal = 0;
// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDxIxFwkQb0xEoysQqTDjwK-ijERK0p67w",
  authDomain: "controle-carro-12e8d.firebaseapp.com",
  projectId: "controle-carro-12e8d",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
async function obterKmAtual() {
  let user = auth.currentUser;
  if (!user) return 0;

  let snapshot = await db.collection("abastecimentos")
    .where("uid", "==", user.uid)
    .orderBy("km", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) return 0;

  return snapshot.docs[0].data().km;
}

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

if (user) {
  const doc = await db.collection("usuarios").doc(user.uid).get();

  if (doc.exists) {
    const data = doc.data();
    reservaReal = data.reservaReal || 0;
  }
}
  
  let doc = await db.collection("admins").doc(user.uid).get();

  if (doc.exists) {
    isAdmin = true;
  }
 kmAtual = await obterKmAtual();
  let snapshotPrimeiro = await db.collection("abastecimentos")
  .where("uid", "==", user.uid)
  .orderBy("km", "asc")
  .limit(1)
  .get();

if (!snapshotPrimeiro.empty) {
  kmInicialSistema = snapshotPrimeiro.docs[0].data().km;
}

console.log("KM INICIAL:", kmInicialSistema);
  // 🔥 calcular km rodado real (último trajeto)
let snapshotKm = await db.collection("abastecimentos")
  .where("uid", "==", user.uid)
  .orderBy("km", "desc")
  .limit(2)
  .get();

let docsKm = snapshotKm.docs;

if (docsKm.length >= 2) {
  let atual = docsKm[0].data().km;
  let anterior = docsKm[1].data().km;
  kmRodadoGlobal = atual - anterior;
} else {
  kmRodadoGlobal = 0;
}

console.log("KM rodado GLOBAL:", kmRodadoGlobal);
  
  console.log("KM ATUAL:", kmAtual);

setTimeout(() => {
  atualizarReservaUI();
}, 300);

  await criarManutencoesIniciais();

// 🔥 PRIMEIRO renderiza com KM atualizado
renderizarManutencoesBase();

carregarDados();
carregarManutencoes();
carregarAlertasHome();
carregarHistoricoFinanceiro();
carregarHistoricoAbastecimento();
calcularMediaGeral();
gerarAlertasManutencao();
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
 if (m.tipo && m.tipo !== "realizada") {
  return;
}
  function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const base = manutencoesBase.find(b =>
  normalizar(b.categoria) === normalizar(m.categoria) &&
  normalizar(b.item) === normalizar(m.item)
);
   let kmTexto = m.km ? "KM: " + m.km : "";
   let dataTexto = m.data ? new Date(m.data).toLocaleDateString() : "";

    let cor = "🟢";

    historico.innerHTML += `
<div style="margin:10px; padding:10px; background:#1e293b; border-radius:10px;">
<strong>${cor} ${m.categoria}</strong><br>
${m.item}<br>
€${m.valor}<br>
${kmTexto}<br>
${dataTexto}
</div>
`;
});
}
function calcularStatusManutencao(base, ultimaManutencao, kmAtualParam) {
 
  // 📏 KM
let kmRestante = null;

if (base.kmTroca && base.kmTroca > 0) {
  let kmRodadoTotal = kmAtualParam - kmInicialSistema;

  kmRestante = base.kmTroca - kmRodadoTotal;
}
   
  // ⏱️ TEMPO
  let diasRestantes = null;
if (base.diasTroca > 0) {

  let dataBase;

  // 🔥 pega SEMPRE a data da manutenção (base ou realizada)
  let dataBase = null;

// 🔥 PRIORIDADE: manutenção realizada
if (ultimaManutencao && ultimaManutencao.data) {
  dataBase = new Date(ultimaManutencao.data);
} else {
  // 🔥 SENÃO: usa a base criada no Firebase
  let baseDoc = historico.find(m =>
    m.tipo === "base" &&
    m.item === base.item
  );

  if (baseDoc && baseDoc.data) {
    dataBase = new Date(baseDoc.data);
  }
}

// 🚨 se não tiver nenhuma data
if (!dataBase) {
  return {
    kmRestante,
    diasRestantes: base.diasTroca,
    status: "amarelo"
  };
}

  let hoje = new Date();

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
  document.querySelectorAll(".aba").forEach(el => {
    el.style.display = "none";
  });

  const aba = document.getElementById("aba-" + nome);

  if (aba) {
    aba.style.display = "flex"; // 🔥 TROCA AQUI
  }
}

async function renderizarManutencoesBase() {
  const container = document.getElementById("listaManutencao");
  if (!container) return;

  container.innerHTML = "";

  let user = auth.currentUser;
  if (!user) return;
  kmAtual = await obterKmAtual();

  const snapshot = await db.collection("manutencoes")
    .where("uid", "==", user.uid)
    .get();

  let historico = [];
  snapshot.forEach(doc => {
    const m = doc.data();

    if (m.tipo === "realizada" || m.tipo === "base") {
  historico.push(m);
}
  });

  const normalizar = (texto) =>
    texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const getUltima = (item) => {
    let filtradas = historico.filter(m =>
  m.tipo === "realizada" &&
  normalizar(m.item).includes(normalizar(item.item))
);

    if (filtradas.length === 0) return null;

    filtradas.sort((x, y) => new Date(y.data) - new Date(x.data));

    // 🔥 só manutenção válida
    let valida = filtradas.find(m =>
      m.tipo === "realizada" &&
      typeof m.km === "number"
    );

    return valida || null;
  };

  const listaOrdenada = [...manutencoesBase].sort((a, b) => {

    const ultimaA = getUltima(a);
    const ultimaB = getUltima(b);

    const statusA = calcularStatusManutencao(a, ultimaA, kmAtual).status;
    const statusB = calcularStatusManutencao(b, ultimaB, kmAtual).status;

    const ordem = { vermelho: 0, amarelo: 1, verde: 2 };

    return ordem[statusA] - ordem[statusB];
  });

  listaOrdenada.forEach(item => {
    if (alertasIgnorados.includes(item.item)) return;

    let ultima = getUltima(item);

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

    let detalhe = "";

    if (statusInfo.kmRestante !== null) {
  if (statusInfo.kmRestante <= 0) {
    detalhe += "🚨 Atrasado em " + Math.abs(statusInfo.kmRestante) + " km";
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
let textoTempo = "";

// 🔥 KM (se existir)
if (item.kmTroca && statusInfo.kmRestante !== null) {
  textoTempo += statusInfo.kmRestante + " / " + item.kmTroca + " km";
}

// 🔥 DIAS (se existir)
if (item.diasTroca && statusInfo.diasRestantes !== null) {

  // quebra linha se já tem KM
  if (textoTempo !== "") {
    textoTempo += " | ";
  }

  textoTempo += statusInfo.diasRestantes + " / " + item.diasTroca + " dias";
}

// fallback
if (textoTempo === "") {
  textoTempo = "Sem dados";
}

troca.innerText = "⏱ " + textoTempo;

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
  const alertasDiv = document.getElementById("alertasHome");
  alertasDiv.innerHTML = "";
  let user = auth.currentUser;
  if (!user) return;

  const snapshot = await db.collection("manutencoes")
    .where("uid", "==", user.uid)
    .get();

  console.log("Manutenções encontradas:", snapshot.size);

  
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

alertas.forEach(item => {
// 💰 ALERTA DE PAGAMENTO (TRATAMENTO ESPECIAL)
if (item.tipo === "pagamento") {

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
  if (item.statusInfo.kmRestante <= 0) {
    html += '<span style="font-size:15px;">🚨 Atrasado em ' + Math.abs(item.statusInfo.kmRestante) + ' km</span><br>';
  } else {
    html += '<span style="font-size:15px;">📏 Faltam ' + item.statusInfo.kmRestante + ' km</span><br>';
  }
}

if (item.statusInfo.diasRestantes !== null) {
  if (item.statusInfo.diasRestantes <= 0) {
    html += '<span style="font-size:15px;">🚨 Atrasado em ' + Math.abs(item.statusInfo.diasRestantes) + ' dias</span>';
  } else {
    html += '<span style="font-size:15px;">⏰ Faltam ' + item.statusInfo.diasRestantes + ' dias</span>';
  }
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
      km: 0,
      data: new Date().toISOString(),
      observacao: "criado automático",
      tipo: "base" // 👈 ESSENCIAL
    });
  }

  console.log("Manutenções iniciais criadas 🚗");
}
window.confirmarAlerta = async function(nomeItem) {

  let user = auth.currentUser;
  if (!user) return;

 let base = manutencoesBase.find(b => 
  b.item.toLowerCase().trim() === nomeItem.toLowerCase().trim()
);
console.log("Clicou:", nomeItem);
console.log("Base encontrada:", base);
  if (!base) return;
  
 // 💰 DAR BAIXA NA RESERVA
reservaReal -= base.custoMedio;
await db.collection("usuarios").doc(user.uid).set({
  reservaReal: reservaReal
}, { merge: true });

// evitar negativo (opcional)
if (reservaReal < 0) reservaReal = 0;
  
  await db.collection("manutencoes").add({
  uid: user.uid,
  categoria: base.categoria,
  item: base.item,
  valor: base.custoMedio,
  km: kmAtual,
  data: new Date().toISOString(),
  observacao: "feito pelo alerta",
  tipo: "realizada" // 🔥 ADICIONA ISSO
});
  alertasIgnorados.push(nomeItem);
  alert("✅ Manutenção registrada!");

 carregarManutencoes();
carregarAlertasHome();

atualizarReservaUI();
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
  } else if (diff <= 10) {
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
window.salvarAbastecimento = async function () {

  let km = parseFloat(document.getElementById("kmAtual").value);
  let litros = parseFloat(document.getElementById("litrosAbastecidos").value);

  if (!km || !litros) {
    alert("Preenche os dados direito 😅");
    return;
  }

  let user = auth.currentUser;
  if (!user) return;

 let kmAtualFirebase = await obterKmAtual();

if (!kmAtualFirebase) {
  document.getElementById("statusAbastecimento").innerText =
    "Primeiro abastecimento registrado ✅";
  return;
}

if (km <= kmAtualFirebase) {
  alert("KM não pode ser menor ou igual ao último 🚫");
  return;
}

let kmRodado = km - kmAtualFirebase;

  let media = kmRodado / litros;

  // 🔥 SALVAR NO FIREBASE
  await db.collection("abastecimentos").add({
    uid: user.uid,
    km: km,
    litros: litros,
    media: media,
    data: new Date().toISOString()
  });
 kmAtual = km;
  // 🔥 COMPARAÇÃO
  let mediaAntiga = localStorage.getItem("mediaConsumo");

  let mensagem = "Média: " + media.toFixed(2) + " km/l";

  if (mediaAntiga) {
    mediaAntiga = parseFloat(mediaAntiga);

    let diferenca = ((media - mediaAntiga) / mediaAntiga) * 100;

    if (diferenca < -20) {
      mensagem += `

⚠️ Consumo piorou muito!

Possíveis causas:
* Pneus descalibrados
* Filtro de ar sujo
* Velas desgastadas
* Combustível ruim
* Problema no motor
`;
    } else {
      mensagem += "\nConsumo normal 👍";
    }
  }

  localStorage.setItem("mediaConsumo", media);

  document.getElementById("statusAbastecimento").innerText = mensagem;

  // 🔥 NOVO (AQUI É O PONTO CERTO)
  calcularMediaGeral();

  carregarHistoricoAbastecimento(); // 🔥 ATUALIZA NA HORA
   atualizarReservaUI();
  // 💰 ATUALIZAR RESERVA AUTOMATICAMENTE
};
async function carregarHistoricoAbastecimento() {

  let user = auth.currentUser;
  if (!user) return;

  const snapshot = await db.collection("abastecimentos")
    .where("uid", "==", user.uid)
    .orderBy("data", "desc")
    .get();

  const container = document.getElementById("historicoAbastecimento");
  if (!container) return;

  container.innerHTML = "";

  snapshot.forEach(doc => {
    const a = doc.data();

    container.innerHTML += `
      <div style="margin:10px; padding:10px; background:#1e293b; border-radius:10px;">
        📏 KM: ${a.km}<br>
        ⛽ Litros: ${a.litros}<br>
        📊 Média: ${a.media.toFixed(2)} km/l<br>
        📅 ${new Date(a.data).toLocaleDateString()}
      </div>
    `;
  });

}
async function calcularMediaGeral() {

  let user = firebase.auth().currentUser;
  if (!user) return;

  let snapshot = await db.collection("abastecimentos")
    .where("uid", "==", user.uid)
    .orderBy("km", "asc")
    .get();

  let docs = snapshot.docs;

  if (docs.length < 2) {
    console.log("Poucos dados");
    return;
  }

  let totalKm = 0;
  let totalLitros = 0;

  for (let i = 1; i < docs.length; i++) {
    let atual = docs[i].data();
    let anterior = docs[i - 1].data();

    let distancia = atual.km - anterior.km;

    totalKm += distancia;
    totalLitros += atual.litros;
  }

  let mediaGeral = totalKm / totalLitros;

// 🔥 MOSTRAR NA TELA
document.getElementById("mediaGeralTexto").innerText =
  "Média do carro: " + mediaGeral.toFixed(2) + " km/L";

// 🔥 COMPARAÇÃO INTELIGENTE
let mediaAtual = parseFloat(localStorage.getItem("mediaConsumo"));

if (mediaAtual) {

  let diferenca = ((mediaAtual - mediaGeral) / mediaGeral) * 100;

  let alerta = "";

  if (diferenca < -15) {
    alerta = "⚠️ Consumo pior que o normal!";
  } else if (diferenca > 15) {
    alerta = "🔥 Consumo melhor que o normal!";
  } else {
    alerta = "👍 Consumo dentro do padrão";
  }

  document.getElementById("mediaGeralTexto").innerText += "\n" + alerta;
}
}
window.onload = function () {
  abrirAba("home");

  // 🔥 Atualiza na hora ao abrir
  atualizarTempoManutencao();

  // 🔁 Depois agenda meia-noite
  iniciarAtualizacaoMeiaNoite();
};
async function gerarAlertasManutencao() {
  const container = document.getElementById("alertasManutencao");
  if (!container) return;

  container.innerHTML = "";

  let user = auth.currentUser;
  if (!user) return;

  const snapshot = await db.collection("manutencoes")
    .where("uid", "==", user.uid)
    .get();

  let historico = [];
  snapshot.forEach(doc => {
    const m = doc.data();
    if (m.tipo === "realizada") {
      historico.push(m);
    }
  });

  const normalizar = (texto) =>
    texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const getUltima = (item) => {
    let filtradas = historico.filter(m =>
      normalizar(m.item).includes(normalizar(item.item))
    );

    if (filtradas.length === 0) return null;

    filtradas.sort((a, b) => new Date(b.data) - new Date(a.data));
    return filtradas[0];
  };

  let html = "";

  manutencoesBase.forEach(item => {
    let ultima = getUltima(item);

    const status = calcularStatusManutencao(item, ultima, kmAtual);

    if (status.status === "vermelho" || status.status === "amarelo") {

      let cor = status.status === "vermelho" ? "🔴" : "🟡";

      html += `
        <div style="margin:8px; padding:10px; background:#1e293b; border-radius:10px;">
          <strong>${cor} ${item.item}</strong><br>
          ${status.kmRestante !== null ? "KM restante: " + status.kmRestante + "<br>" : ""}
          ${status.diasRestantes !== null ? "Dias restantes: " + status.diasRestantes : ""}
        </div>
      `;
    }
  });

  if (html === "") {
    html = "✅ Tudo em dia";
  }

  container.innerHTML = html;
}
function calcularCustoPorKmTotal() {

  let totalPorKm = 0;

  manutencoesBase.forEach(item => {

    if (!item.kmTroca || item.kmTroca === 0) return;

    let custoPorKm = item.custoMedio / item.kmTroca;

    totalPorKm += custoPorKm;

  });

  console.log("CUSTO POR KM:", totalPorKm);

  return totalPorKm;
}
function calcularReservaManutencao() {

  let custoPorKm = calcularCustoPorKmTotal();

  let kmRodadoTotal = kmAtual - kmInicialSistema;

  let reserva = kmRodadoTotal * custoPorKm;

  console.log("RESERVA:", reserva);

  return reserva;
}
function atualizarReservaUI() {
  if (!kmAtual || !kmInicialSistema) {
  console.log("KM ainda não carregado");
  return;
}

  let reserva = reservaReal + calcularReservaManutencao();
  let custoKm = calcularCustoPorKmTotal();
 let kmRodado = Math.max(0, kmAtual - kmInicialSistema);

  document.getElementById("reservaCarro").innerText =
    "€" + reserva.toFixed(2);

  document.getElementById("custoKm").innerText =
    "📊 €" + custoKm.toFixed(3) + "/km";

  document.getElementById("kmRodadoInfo").innerText =
    "🚗 " + kmRodado + " km rodados";
}
function atualizarTempoManutencao() {
  renderizarManutencoesBase();
  carregarAlertasHome();
  gerarAlertasManutencao();
}
function iniciarAtualizacaoMeiaNoite() {
  const agora = new Date();

  const meiaNoite = new Date();
  meiaNoite.setHours(24, 0, 0, 0); // próxima meia-noite

  const tempoRestante = meiaNoite - agora;

  // ⏳ espera até meia-noite
  setTimeout(() => {

    atualizarTempoManutencao();

    // 🔁 depois disso, roda todo dia
    setInterval(() => {
      atualizarTempoManutencao();
    }, 1000 * 60 * 60 * 24);

  }, tempoRestante);
}
