// Importa as funções do Firebase diretamente da web (Módulo)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// COLOQUE AQUI AS SUAS CONFIGURAÇÕES DO PASSO 1
const firebaseConfig = {
  apiKey: "AIzaSyD020dSaYAKlmmq8ce2oDqRJyAMzOHL90I",
  authDomain: "hortsoy-treinamentos-847e2.firebaseapp.com",
  projectId: "hortsoy-treinamentos-847e2",
  storageBucket: "hortsoy-treinamentos-847e2.firebasestorage.app",
  messagingSenderId: "247605921968",
  appId: "1:247605921968:web:307eef1017e68b398e9375",
  measurementId: "G-FMH3R3NPGM",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Lógica de Login
const formLogin = document.getElementById("form-login");
const msgErro = document.getElementById("mensagem-erro");
const btnSubmit = document.getElementById("btn-submit");

if (formLogin) {
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault(); // Evita recarregar a página
    msgErro.style.display = "none";
    btnSubmit.textContent = "Verificando...";

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    // 1. TRAVA DE SEGURANÇA: Verifica se é e-mail da HortSoy
    if (!email.endsWith("@hortsoy.com.br")) {
      msgErro.textContent =
        "Acesso restrito apenas a e-mails corporativos (@hortsoy.com.br).";
      msgErro.style.display = "block";
      btnSubmit.textContent = "Acessar Plataforma";
      return; // Interrompe o processo aqui
    }

    // 2. Faz o login no Firebase
    signInWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        // Sucesso! Redireciona para a página inicial
        window.location.href = "index.html";
      })
      .catch((error) => {
        console.error(error.code);
        msgErro.style.display = "block";
        btnSubmit.textContent = "Acessar Plataforma";

        if (error.code === "auth/invalid-credential") {
          msgErro.textContent = "E-mail ou senha incorretos.";
        } else if (error.code === "auth/user-not-found") {
          msgErro.textContent = "Usuário não cadastrado.";
        } else {
          msgErro.textContent = "Erro ao fazer login. Tente novamente.";
        }
      });
  });
}
