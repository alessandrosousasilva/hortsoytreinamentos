import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  updateDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// COLOQUE SUAS CHAVES AQUI (IGUAIS AO APP.JS)
const firebaseConfig = {
  apiKey: "AIzaSyD020dSaYAKlmmq8ce2oDqRJyAMzOHL90I",
  authDomain: "hortsoy-treinamentos-847e2.firebaseapp.com",
  projectId: "hortsoy-treinamentos-847e2",
  storageBucket: "hortsoy-treinamentos-847e2.firebasestorage.app",
  messagingSenderId: "247605921968",
  appId: "1:247605921968:web:307eef1017e68b398e9375",
  measurementId: "G-FMH3R3NPGM",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Trava de segurança
const emailAdmin = "admin@hortsoy.com.br"; // E-mail do Administrador

onAuthStateChanged(auth, async (user) => {
  if (!user || user.email !== emailAdmin) {
    alert("Acesso Negado. Você não é o administrador.");
    window.location.href = "index.html";
    return;
  }

  // Se passou, carrega as opções de setores no campo Select
  const selectSetor = document.getElementById("select-setor");
  const querySnapshot = await getDocs(collection(db, "setores"));

  // Se o banco estiver vazio, avisa para migrar os dados
  if (querySnapshot.empty) {
    selectSetor.innerHTML =
      '<option value="">O banco está vazio. Clique em Importar Dados Antigos acima!</option>';
  } else {
    selectSetor.innerHTML = '<option value="">-- Selecione o Setor --</option>';
    querySnapshot.forEach((doc) => {
      selectSetor.innerHTML += `<option value="${doc.id}">${doc.data().nome}</option>`;
    });
  }
});

// --- LÓGICA DE SALVAR NOVO CURSO ---
document
  .getElementById("form-novo-curso")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const btnSalvar = document.getElementById("btn-submit-curso");
    btnSalvar.textContent = "Salvando...";

    const setorId = document.getElementById("select-setor").value;
    const tituloCurso = document.getElementById("titulo-curso").value;
    const tituloVideo = document.getElementById("titulo-video").value;
    const urlVideo = document.getElementById("url-video").value;
    const tituloPdf = document.getElementById("titulo-pdf").value;
    const urlPdf = document.getElementById("url-pdf").value;

    // Monta o objeto do curso igualzinho era no seu JSON
    const novoCurso = {
      titulo: tituloCurso,
      videos: urlVideo ? [{ titulo: tituloVideo, url: urlVideo }] : [],
      pdfs: urlPdf ? [{ titulo: tituloPdf, url: urlPdf }] : [],
    };

    try {
      // Pega o documento do setor escolhido e adiciona o curso na lista (arrayUnion)
      const setorRef = doc(db, "setores", setorId);
      await updateDoc(setorRef, {
        cursos: arrayUnion(novoCurso),
      });
      alert("Curso adicionado com sucesso!");
      document.getElementById("form-novo-curso").reset(); // Limpa o formulário
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar. Verifique o console.");
    } finally {
      btnSalvar.textContent = "Salvar Curso no Banco de Dados";
    }
  });

// --- BOTÃO MÁGICO DE MIGRAÇÃO (JSON -> FIRESTORE) ---
document.getElementById("btn-migrar").addEventListener("click", async () => {
  const confirmacao = confirm(
    "Isso vai copiar todos os dados do cursos.json para o banco de dados. Tem certeza?",
  );
  if (!confirmacao) return;

  try {
    document.getElementById("btn-migrar").textContent = "Importando...";
    const resposta = await fetch("data/cursos.json");
    const setoresJSON = await resposta.json();

    // Para cada setor no JSON, cria um documento no Firestore
    for (const setor of setoresJSON) {
      await setDoc(doc(db, "setores", setor.id), setor);
    }

    alert("🎉 Migração concluída com sucesso! Atualize a página.");
    window.location.reload();
  } catch (error) {
    alert("Erro na migração: " + error.message);
  }
});
