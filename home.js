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

  // verificar admin
  let doc = await db.collection("admins").doc(user.uid).get();

  if (doc.exists) {
    isAdmin = true;
  }

  carregarDados();
});


// 📊 DADOS FIXOS (por enquanto)
let parcelasPagas = 33;
let totalParcelas = 96;

let mesesPagos = 33;
let dividaTotal = 13371;


// 🔄 CARREGAR
function carregarDados() {

  // 🚗 BANCO
  let valorParcela = 405;

  let totalPagoBanco = parcelasPagas * valorParcela;
  let restanteBanco = (totalParcelas - parcelasPagas) * valorParcela;

  document.getElementById("parcelas").innerText =
    "Parcelas: " + parcelasPagas + " / " + totalParcelas;

  document.getElementById("pagoBanco").innerText =
    "Pago: €" + totalPagoBanco;

  document.getElementById("restanteBanco").innerText =
    "Falta: €" + restanteBanco;


  // 🤝 ACORDO
  let valorMensal = 100;

  let pagoAcordo = mesesPagos * valorMensal;
  let restanteAcordo = dividaTotal - pagoAcordo;

  if (restanteAcordo < 0) restanteAcordo = 0;

  document.getElementById("dividaTotal").innerText =
    "Dívida total: €" + dividaTotal;

  document.getElementById("pagoAcordo").innerText =
    "Pago: €" + pagoAcordo;

  document.getElementById("restanteAcordo").innerText =
    "Falta: €" + restanteAcordo;

  document.getElementById("meses").innerText =
    "Meses pagos: " + mesesPagos;


  // 🔒 BLOQUEIO
  if (!isAdmin) {
    document.getElementById("btnParcela").style.display = "none";
    document.getElementById("btnAcordo").style.display = "none";
  }
}

// ➕ PAGAR PARCELA
function pagarParcela() {
  parcelasPagas++;
  carregarDados();
}

// ➕ PAGAR ACORDO
function pagarAcordo() {
  mesesPagos++;
  carregarDados();
}
