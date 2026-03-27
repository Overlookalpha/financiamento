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
  { categoria: "Motor", item: "Óleo do motor", kmTroca: 10000, diasTroca: 180, custoMedio: 70 },
  { categoria: "Motor", item: "Filtro de óleo", kmTroca: 10000, diasTroca: 180, custoMedio: 20 },
  { categoria: "Motor", item: "Filtro de ar", kmTroca: 15000, diasTroca: 365, custoMedio: 20 },
  { categoria: "Motor", item: "Filtro combustível", kmTroca: 20000, diasTroca: 365, custoMedio: 40 },
  { categoria: "Motor", item: "Velas", kmTroca: 30000, diasTroca: 730, custoMedio: 60 },
  { categoria: "Motor", item: "Correia dentada", kmTroca: 80000, diasTroca: 1825, custoMedio: 400 },
  { categoria: "Motor", item: "Bomba de água", kmTroca: 80000, diasTroca: 1825, custoMedio: 250 },

  { categoria: "Freios", item: "Pastilhas de freio", kmTroca: 20000, diasTroca: 365, custoMedio: 120 },
  { categoria: "Freios", item: "Discos de freio", kmTroca: 40000, diasTroca: 730, custoMedio: 250 },
  { categoria: "Freios", item: "Fluido de freio", kmTroca: 30000, diasTroca: 365, custoMedio: 60 },

  { categoria: "Pneus", item: "Pneus", kmTroca: 40000, diasTroca: 730, custoMedio: 280 },
  { categoria: "Pneus", item: "Alinhamento", kmTroca: 10000, diasTroca: 180, custoMedio: 40 },
  { categoria: "Pneus", item: "Balanceamento", kmTroca: 10000, diasTroca: 180, custoMedio: 30 },

  { categoria: "Suspensão", item: "Amortecedores", kmTroca: 60000, diasTroca: 1460, custoMedio: 300 },
  { categoria: "Suspensão", item: "Molas", kmTroca: 80000, diasTroca: 1825, custoMedio: 200 },

  { categoria: "Elétrica", item: "Bateria", kmTroca: 0, diasTroca: 730, custoMedio: 120 },
  { categoria: "Elétrica", item: "Alternador", kmTroca: 100000, diasTroca: 1825, custoMedio: 350 },

  { categoria: "Arrefecimento", item: "Radiador", kmTroca: 100000, diasTroca: 1825, custoMedio: 250 },
  { categoria: "Arrefecimento", item: "Líquido de arrefecimento", kmTroca: 30000, diasTroca: 365, custoMedio: 50 },

  { categoria: "Ar", item: "Recarga de gás", kmTroca: 30000, diasTroca: 365, custoMedio: 80 },
  { categoria: "Ar", item: "Compressor", kmTroca: 100000, diasTroca: 1825, custoMedio: 400 }
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

  carregarDados();
  carregarManutencoes();
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

  document.getElementById("historico").innerHTML = html;

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
    km: 152000,
    data: new Date().toISOString(),
    observacao: "teste app"
  });

  alert("Manutenção salva 🚗");
  carregarManutencoes();
};
async function carregarManutencoes() {
    let user = auth.currentUser;

    if (!user) return;

    const snapshot = await db.collection("manutencoes")
        .where("uid", "==", user.uid)
        .orderBy("data", "desc")
        .get();

    const historico = document.getElementById("historico");
    historico.innerHTML = "";

    const kmAtual = 152000;

snapshot.forEach(doc => {
    const m = doc.data();

    const base = manutencoesBase.find(b => 
        b.item === m.item && b.categoria === m.categoria
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
function calcularStatusManutencao(base, ultimaManutencao, kmAtual) {

  // 📏 KM
  let kmRestante = null;

  if (base.kmTroca > 0 && ultimaManutencao?.km) {
    let kmRodado = kmAtual - ultimaManutencao.km;
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
