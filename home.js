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

  document.getElementById("historicoManutencao").innerHTML = html;

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
    observacao: "teste app"
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

  if (base.diasTroca > 0 && ultimaManutencao?.data) {
    let hoje = new Date();
    let dataUltima = new Date(ultimaManutencao.data);

    let diasPassados = Math.floor((hoje - dataUltima) / (1000 * 60 * 60 * 24));
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

function renderizarManutencoesBase() {
  const container = document.getElementById("listaManutencao");

  if (!container) return;

  container.innerHTML = "";

  manutencoesBase.forEach(item => {

    let status = "🟢";
    let textoStatus = "OK";

    if (item.kmTroca && kmAtual >= item.kmTroca) {
      status = "🔴";
      textoStatus = "Troca atrasada!";
    } else if (item.kmTroca && kmAtual >= item.kmTroca * 0.8) {
      status = "🟡";
      textoStatus = "Próximo da troca";
    }

    // 🔹 CARD PRINCIPAL
    const card = document.createElement("div");
    card.style.margin = "12px";
    card.style.padding = "14px";
    card.style.background = "linear-gradient(135deg, #1e293b, #0f172a)";
    card.style.borderRadius = "12px";
    card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
    card.style.color = "white";

    // 🔹 CATEGORIA
    const categoria = document.createElement("div");
    categoria.style.fontSize = "16px";
    categoria.style.fontWeight = "bold";
    categoria.style.marginBottom = "6px";
    categoria.innerText = "🔧 " + status + " " + item.categoria;

    // 🔹 ITEM
    const itemDiv = document.createElement("div");
    itemDiv.style.fontSize = "15px";
    itemDiv.style.marginBottom = "6px";
    itemDiv.innerText = item.item;

    // 🔹 CUSTO
    const custo = document.createElement("div");
    custo.style.fontSize = "14px";
    custo.style.opacity = "0.8";
    custo.innerText = "💰 Custo médio: €" + item.custoMedio;

    // 🔹 TROCA
    const troca = document.createElement("div");
    troca.style.fontSize = "14px";
    troca.style.marginTop = "6px";
    troca.innerText =
      "⏱ Troca a cada: " +
      (item.kmTroca ? item.kmTroca + " km" : "") +
      (item.diasTroca ? " / " + item.diasTroca + " dias" : "");

    // 🔹 STATUS TEXTO
    const statusDiv = document.createElement("div");
    statusDiv.style.marginTop = "6px";
    statusDiv.style.fontSize = "13px";
    statusDiv.innerText = textoStatus;

    // 🔗 MONTA
    card.appendChild(categoria);
    card.appendChild(itemDiv);
    card.appendChild(custo);
    card.appendChild(troca);
    card.appendChild(statusDiv);

    container.appendChild(card);
  });
}

// 👉 CHAMA FORA
renderizarManutencoesBase();
async function carregarAlertasHome() {
  let user = auth.currentUser;
  if (!user) return;

  const snapshot = await db.collection("manutencoes")
    .where("uid", "==", user.uid)
    .get();

  console.log("Manutenções encontradas:", snapshot.size);

  const alertasDiv = document.getElementById("alertasHome");
  let alertas = [];


  // 🔥 transforma snapshot em array
  let historico = [];
  snapshot.forEach(doc => historico.push(doc.data()));

  // 🔥 função pra comparar texto
  const normalizar = (texto) =>
    texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 🔥 percorre TODA a base
  manutencoesBase.forEach(base => {

    // 🔎 procura no histórico
    let manutencoesFiltradas = historico.filter(m => {
  return normalizar(m.item).includes(normalizar(base.item)) ||
         normalizar(base.item).includes(normalizar(m.item));
});

// 👉 pega a mais recente de verdade
let ultima = null;

if (manutencoesFiltradas.length > 0) {
  manutencoesFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));
  ultima = manutencoesFiltradas[0];
}

    // 🧠 calcula mesmo sem histórico
    const status = calcularStatusManutencao(base, ultima, kmAtual);
    // 🚨 se não tem histórico válido → considera atrasado
if (!ultima) {
  alertas.push("🔴 " + base.item + " sem registro");
  return;
}
    console.log(base.item, status);

    if (status.status === "vermelho") {
      alertas.push("🔴 " + base.item + " atrasado");
    } else if (status.status === "amarelo") {
      alertas.push("🟡 " + base.item + " próximo");
    }

  });

  if (alertas.length === 0) {
    alertasDiv.innerText = "✅ Tudo em dia";
  } else {
    alertasDiv.innerHTML = alertas.join("<br>");
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
