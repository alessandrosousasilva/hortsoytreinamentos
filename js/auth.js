// Importa as funções do Firebase diretamente da web (Módulo)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
// IMPORTAÇÕES DA BASE DE DADOS (Faltavam no seu ficheiro)
import {
  getFirestore,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// SUAS CONFIGURAÇÕES
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
const db = getFirestore(app); // Inicializa a base de dados

// --- LÓGICA DA TELA DE LOGIN / REGISTO ---
const formLogin = document.getElementById("form-login");
const msgErro = document.getElementById("mensagem-erro");
const btnSubmit = document.getElementById("btn-submit");

// Elementos novos
const grupoConfirma = document.getElementById("grupo-confirma");
const inputConfirma = document.getElementById("senha-confirma");
const linkModo = document.getElementById("link-modo");
const blocoEsqueciSenha = document.getElementById("bloco-esqueci-senha");
const grupoSetor = document.getElementById("grupo-setor");
const inputSetor = document.getElementById("setor-usuario");

let modoLogin = true; // true = Entrar | false = Criar Conta

// Trocar a tela (Login <-> Registo)
if (linkModo) {
  linkModo.addEventListener("click", (e) => {
    e.preventDefault();
    modoLogin = !modoLogin;
    msgErro.style.display = "none";

    if (modoLogin) {
      // MODO: ENTRAR
      btnSubmit.textContent = "Acessar Plataforma";
      linkModo.textContent = "Primeiro acesso? Crie a sua senha aqui.";
      grupoConfirma.style.display = "none";
      grupoSetor.style.display = "none";
      inputConfirma.removeAttribute("required");
      inputSetor.removeAttribute("required");
      blocoEsqueciSenha.style.display = "block";
    } else {
      // MODO: CRIAR CONTA
      btnSubmit.textContent = "Criar Minha Conta";
      linkModo.textContent = "Já tenho uma conta. Fazer login.";
      grupoConfirma.style.display = "block";
      grupoSetor.style.display = "block";
      inputConfirma.setAttribute("required", "true");
      inputSetor.setAttribute("required", "true");
      blocoEsqueciSenha.style.display = "none";
    }
  });
}

// Enviar o formulário
if (formLogin) {
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    msgErro.style.display = "none";
    btnSubmit.textContent = "Processando...";

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!email.endsWith("@hortsoy.com.br")) {
      msgErro.textContent =
        "Acesso restrito apenas a e-mails corporativos (@hortsoy.com.br).";
      msgErro.style.display = "block";
      btnSubmit.textContent = modoLogin
        ? "Acessar Plataforma"
        : "Criar Minha Conta";
      return;
    }

    if (modoLogin) {
      // --- LOGIN ---
      signInWithEmailAndPassword(auth, email, senha)
        .then(() => {
          window.location.href = "/index.html";
        })
        .catch((error) => {
          msgErro.style.display = "block";
          btnSubmit.textContent = "Acessar Plataforma";
          if (error.code === "auth/invalid-credential")
            msgErro.textContent = "E-mail ou senha incorretos.";
          else if (error.code === "auth/user-not-found")
            msgErro.textContent = "Utilizador não registado.";
          else msgErro.textContent = "Erro ao fazer login. Tente novamente.";
        });
    } else {
      // --- CRIAR CONTA ---
      const senhaConfirma = inputConfirma.value;
      const setorSelecionado = inputSetor.value;

      if (senha !== senhaConfirma) {
        msgErro.textContent = "As palavras-passe não são iguais.";
        msgErro.style.display = "block";
        btnSubmit.textContent = "Criar Minha Conta";
        return;
      }

      if (!setorSelecionado) {
        msgErro.textContent = "Por favor, selecione o seu setor.";
        msgErro.style.display = "block";
        btnSubmit.textContent = "Criar Minha Conta";
        return;
      }

      createUserWithEmailAndPassword(auth, email, senha)
        .then(async (userCredential) => {
          // Salva o setor no Firestore
          await setDoc(doc(db, "usuarios", email), {
            setor: setorSelecionado,
            dataCadastro: new Date().toISOString(),
          });
          window.location.href = "/index.html";
        })
        .catch((error) => {
          msgErro.style.display = "block";
          btnSubmit.textContent = "Criar Minha Conta";
          if (error.code === "auth/email-already-in-use")
            msgErro.textContent = "Este e-mail já possui registo.";
          else if (error.code === "auth/weak-password")
            msgErro.textContent =
              "A palavra-passe deve ter pelo menos 6 caracteres.";
          else msgErro.textContent = "Erro ao criar conta. Tente novamente.";
        });
    }
  });
}

// --- RECUPERAÇÃO DE PALAVRA-PASSE ---
const linkEsqueciSenha = document.getElementById("link-esqueci-senha");

if (linkEsqueciSenha) {
  linkEsqueciSenha.addEventListener("click", (e) => {
    e.preventDefault();
    msgErro.style.display = "none";
    const email = document.getElementById("email").value;

    if (!email) {
      msgErro.style.color = "#E53935";
      msgErro.textContent =
        "Por favor, introduza o seu e-mail no campo acima para recuperar a senha.";
      msgErro.style.display = "block";
      return;
    }

    if (!email.endsWith("@hortsoy.com.br")) {
      msgErro.style.color = "#E53935";
      msgErro.textContent = "Apenas e-mails corporativos são válidos.";
      msgErro.style.display = "block";
      return;
    }

    btnSubmit.textContent = "Enviando e-mail...";
    btnSubmit.disabled = true;

    sendPasswordResetEmail(auth, email)
      .then(() => {
        msgErro.style.color = "var(--cor-verde-hortsoy)";
        msgErro.textContent =
          "E-mail de recuperação enviado! Verifique a sua caixa de entrada.";
        msgErro.style.display = "block";
      })
      .catch((error) => {
        msgErro.style.color = "#E53935";
        if (error.code === "auth/user-not-found")
          msgErro.textContent = "Este e-mail não possui registo na plataforma.";
        else msgErro.textContent = "Erro ao enviar e-mail. Tente novamente.";
      })
      .finally(() => {
        btnSubmit.textContent = modoLogin
          ? "Acessar Plataforma"
          : "Criar Minha Conta";
        btnSubmit.disabled = false;
      });
  });
}
