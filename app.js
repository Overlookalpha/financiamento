// CONFIG DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDxIxFwkQb0xEoysQqTDjwK-ijERK0p67w",
  authDomain: "controle-carro-12e8d.firebaseapp.com",
  projectId: "controle-carro-12e8d",
  storageBucket: "controle-carro-12e8d.firebasestorage.app",
  messagingSenderId: "344842938479",
  appId: "1:344842938479:web:2bb65bd0fb42f7bfe8859a"
};

// INICIAR FIREBASE
firebase.initializeApp(firebaseConfig);

// SERVIÇOS
const auth = firebase.auth();


// 🔐 LOGIN
function login() {
  let email = document.getElementById("email").value;
  let senha = document.getElementById("senha").value;

  auth.signInWithEmailAndPassword(email, senha)
    .then(() => {
      alert("Login feito com sucesso!");
      window.location.href = "home.html";
    })
    .catch((error) => {
      alert(error.message);
    });
}
