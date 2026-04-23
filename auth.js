// Importa as funções do Firebase diretamente da web (Módulo)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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

// --- LÓGICA DA TELA DE LOGIN / CADASTRO ---
const formLogin = document.getElementById("form-login");
const msgErro = document.getElementById("mensagem-erro");
const btnSubmit = document.getElementById("btn-submit");

// Elementos novos do Primeiro Acesso
const grupoConfirma = document.getElementById("grupo-confirma");
const inputConfirma = document.getElementById("senha-confirma");
const linkModo = document.getElementById("link-modo");
const blocoEsqueciSenha = document.getElementById("bloco-esqueci-senha"); 

let modoLogin = true; // true = Modo Entrar | false = Modo Criar Conta

// Lógica de trocar a tela quando clica no link
if (linkModo) {
  linkModo.addEventListener("click", (e) => {
    e.preventDefault();
    modoLogin = !modoLogin; // Inverte o modo
    msgErro.style.display = "none";

    if (modoLogin) {
      // MODO: ENTRAR
      btnSubmit.textContent = "Acessar Plataforma";
      linkModo.textContent = "Primeiro acesso? Crie sua senha aqui.";
      grupoConfirma.style.display = "none";
      inputConfirma.removeAttribute("required");
      blocoEsqueciSenha.style.display = "block"; // <--- MOSTRA o link de esqueci a senha
    } else {
      // MODO: CRIAR CONTA
      btnSubmit.textContent = "Criar Minha Conta";
      linkModo.textContent = "Já tenho uma conta. Fazer login.";
      grupoConfirma.style.display = "block";
      inputConfirma.setAttribute("required", "true");
      blocoEsqueciSenha.style.display = "none"; // <--- ESCONDE o link de esqueci a senha
    }
  });
}

// Lógica de enviar o formulário de login ou cadastro
if (formLogin) {
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    msgErro.style.display = "none";
    btnSubmit.textContent = "Processando...";

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    // TRAVA DE SEGURANÇA CONTINUA AQUI
    if (!email.endsWith("@hortsoy.com.br")) {
      msgErro.textContent = "Acesso restrito apenas a e-mails corporativos (@hortsoy.com.br).";
      msgErro.style.display = "block";
      btnSubmit.textContent = modoLogin ? "Acessar Plataforma" : "Criar Minha Conta";
      return; 
    }

    if (modoLogin) {

      // --- EXECUTAR LOGIN ---
      signInWithEmailAndPassword(auth, email, senha)
        .then(() => { window.location.href = "index.html"; })
        .catch((error) => {
          msgErro.style.display = "block";
          btnSubmit.textContent = "Acessar Plataforma";
          if (error.code === "auth/invalid-credential") msgErro.textContent = "E-mail ou senha incorretos.";
          else if (error.code === "auth/user-not-found") msgErro.textContent = "Usuário não cadastrado.";
          else msgErro.textContent = "Erro ao fazer login. Tente novamente.";
        });

    } else {

      // --- EXECUTAR CRIAÇÃO DE CONTA ---
      const senhaConfirma = inputConfirma.value;
      if (senha !== senhaConfirma) {
        msgErro.textContent = "As senhas não são iguais.";
        msgErro.style.display = "block";
        btnSubmit.textContent = "Criar Minha Conta";
        return;
      }

      createUserWithEmailAndPassword(auth, email, senha)
        .then(() => { 

          // Conta criada com sucesso! O Firebase já loga a pessoa automaticamente.
          window.location.href = "index.html"; 
        })
        .catch((error) => {
          msgErro.style.display = "block";
          btnSubmit.textContent = "Criar Minha Conta";
          if (error.code === "auth/email-already-in-use") msgErro.textContent = "Este e-mail já possui cadastro.";
          else if (error.code === "auth/weak-password") msgErro.textContent = "A senha deve ter pelo menos 6 caracteres.";
          else msgErro.textContent = "Erro ao criar conta. Tente novamente.";
        });
    }
  });
}

// --- LÓGICA DE RECUPERAÇÃO DE SENHA ---
const linkEsqueciSenha = document.getElementById("link-esqueci-senha");

if (linkEsqueciSenha) {
  linkEsqueciSenha.addEventListener("click", (e) => {
    e.preventDefault();
    msgErro.style.display = "none";

    const email = document.getElementById("email").value;

    // 1. Verifica se o usuário digitou o e-mail antes de clicar em "Esqueci a senha"
    if (!email) {
      msgErro.style.color = "#E53935"; // Vermelho
      msgErro.textContent = "Por favor, digite seu e-mail no campo acima para recuperar a senha.";
      msgErro.style.display = "block";
      return;
    }

    // 2. Trava de segurança da HortSoy
    if (!email.endsWith("@hortsoy.com.br")) {
      msgErro.style.color = "#E53935";
      msgErro.textContent = "Apenas e-mails corporativos são válidos.";
      msgErro.style.display = "block";
      return;
    }

    btnSubmit.textContent = "Enviando e-mail...";
    btnSubmit.disabled = true; // Desativa o botão para não clicar duas vezes

    // 3. Dispara o e-mail de recuperação pelo Firebase
    sendPasswordResetEmail(auth, email)
      .then(() => {
        // Sucesso! Mostra a mensagem em verde
        msgErro.style.color = "var(--cor-verde-hortsoy)"; 
        msgErro.textContent = "E-mail de recuperação enviado! Verifique sua caixa de entrada.";
        msgErro.style.display = "block";
      })
      .catch((error) => {
        // Deu erro (ex: e-mail não existe)
        msgErro.style.color = "#E53935"; // Volta para vermelho
        if (error.code === 'auth/user-not-found') {
            msgErro.textContent = "Este e-mail não possui cadastro na plataforma.";
        } else {
            msgErro.textContent = "Erro ao enviar e-mail de recuperação. Tente novamente.";
            console.error(error);
        }
        msgErro.style.display = "block";
      })
      .finally(() => {
        // Volta o botão ao normal
        btnSubmit.textContent = modoLogin ? "Acessar Plataforma" : "Criar Minha Conta";
        btnSubmit.disabled = false;
      });
  });
}