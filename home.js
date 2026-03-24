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

  document.getElementById("parcelas").innerText =
    parcelasPagas + " / " + totalParcelas;

  document.getElementById("acordo").innerText =
    "Pago: €" + (mesesPagos * 100) +
    " | Falta: €" + (dividaTotal - (mesesPagos * 100));


  // 🔒 BLOQUEAR SE NÃO FOR ADMIN
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
