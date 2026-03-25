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
});


// 📊 DADOS FIXOS
let totalFinanciamento = 20000;
let valorPagoBanco = 0;

let dividaTotal = 13371;
let valorPagoAcordo = 0;


// 🔄 CARREGAR
function carregarDados() {

  // 🚗 BANCO
  let restanteBanco = totalFinanciamento - valorPagoBanco;
  if (restanteBanco < 0) restanteBanco = 0;

  document.getElementById("pagoBanco").innerText =
    "Pago: €" + valorPagoBanco;

  document.getElementById("restanteBanco").innerText =
    "Falta: €" + restanteBanco;


  // 🤝 ACORDO
  let restanteAcordo = dividaTotal - valorPagoAcordo;
  if (restanteAcordo < 0) restanteAcordo = 0;

  document.getElementById("dividaTotal").innerText =
    "Dívida total: €" + dividaTotal;

  document.getElementById("pagoAcordo").innerText =
    "Pago: €" + valorPagoAcordo;

  document.getElementById("restanteAcordo").innerText =
    "Falta: €" + restanteAcordo;


  // 🔒 BLOQUEIO
  if (!isAdmin) {
    document.getElementById("btnParcela").style.display = "none";
    document.getElementById("btnAcordo").style.display = "none";
  }
}


// ➕ PAGAR FINANCIAMENTO
window.pagarParcela = function () {
  let valor = document.getElementById("inputBanco").value;

  valor = Number(valor);

  if (!valor || valor <= 0) {
    alert("Digite um valor válido");
    return;
  }

  valorPagoBanco += valor;

  document.getElementById("inputBanco").value = "";

  carregarDados();
};


// ➕ PAGAR ACORDO
window.pagarAcordo = function () {
  let valor = document.getElementById("inputAcordo").value;

  valor = Number(valor);

  if (!valor || valor <= 0) {
    alert("Digite um valor válido");
    return;
  }

  valorPagoAcordo += valor;

  document.getElementById("inputAcordo").value = "";

  carregarDados();
};
