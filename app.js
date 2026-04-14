// --- IMPORTAÇÕES DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// --- PROTEÇÃO DE ROTA E MENU DO USUÁRIO ---
onAuthStateChanged(auth, (user) => {
  const paginaAtual = window.location.pathname.split("/").pop();

  if (!user && paginaAtual !== "login.html" && paginaAtual !== "") {
    window.location.href = "login.html";
  }

  if (user && paginaAtual === "login.html") {
    window.location.href = "index.html";
  }

  if (user && paginaAtual !== "login.html") {
    const email = user.email;
    // Trava de segurança: Mude para o e-mail de administrador
    const emailAdmin = "admin@hortsoy.com.br"; // E-mail do Administrador

    // Variável global para sabermos se é o admin
    window.isAdmin = email === emailAdmin;

    let nomeExibicao = user.displayName;
    if (!nomeExibicao) {
      try {
        const partesNome = email.split("@")[0].split(".");
        const nome =
          partesNome[0].charAt(0).toUpperCase() + partesNome[0].slice(1);
        const sobrenome =
          partesNome.length > 1
            ? partesNome[1].charAt(0).toUpperCase() + partesNome[1].slice(1)
            : "";
        nomeExibicao = `${nome} ${sobrenome}`.trim();
      } catch (e) {
        nomeExibicao = "Colaborador";
      }
    }

    document.getElementById("nome-usuario").textContent = nomeExibicao;
    document.getElementById("email-usuario").textContent = email;

    const inicial = nomeExibicao.charAt(0).toUpperCase();
    document.getElementById("avatar-mini").textContent = inicial;
    document.getElementById("avatar-grande").textContent = inicial;

    const avatarMini = document.getElementById("avatar-mini");
    const dropdownPerfil = document.getElementById("dropdown-perfil");
    const btnSair = document.getElementById("btn-sair");
    const btnAdmin = document.getElementById("btn-admin");

    if (btnAdmin && email === emailAdmin) {
      btnAdmin.style.display = "inline-block";
      btnAdmin.addEventListener("click", () => {
        window.location.href = "admin.html";
      });

      // Mostra o botão In-Place se for o Admin
      const btnAddCursoSetor = document.getElementById("btn-add-curso-setor");
      if (btnAddCursoSetor) btnAddCursoSetor.style.display = "inline-block";
    }

    avatarMini.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownPerfil.classList.toggle("mostrar");
    });

    document.addEventListener("click", (e) => {
      if (!dropdownPerfil.contains(e.target)) {
        dropdownPerfil.classList.remove("mostrar");
      }
    });

    btnSair.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "login.html";
      });
    });
  }
});

// --- LÓGICA DO MODO ESCURO ---
const btnTema = document.getElementById("btn-tema");
const body = document.body;
const logoHortsoy = document.getElementById("logo-hortsoy");

if (localStorage.getItem("tema") === "escuro") {
  body.classList.add("modo-escuro");
  if (logoHortsoy) logoHortsoy.src = "assets/logos/jee-branco.png";
  if (btnTema) btnTema.textContent = "☀️";
}

if (btnTema) {
  btnTema.addEventListener("click", () => {
    body.classList.toggle("modo-escuro");

    if (body.classList.contains("modo-escuro")) {
      if (logoHortsoy) logoHortsoy.src = "assets/logos/jee-branco.png";
      btnTema.textContent = "☀️";
      localStorage.setItem("tema", "escuro");
    } else {
      if (logoHortsoy) logoHortsoy.src = "assets/logos/jee-preto.png";
      btnTema.textContent = "🌙";
      localStorage.setItem("tema", "claro");
    }
  });
}

// --- CABEÇALHO FIXO ---
const cabecalhoGeral = document.querySelector(".cabecalho");
const cabecalhoCursos = document.querySelector(".cabecalho-cursos");

function aplicarEfeitoScroll(cabecalho) {
  if (cabecalho) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        cabecalho.classList.add("efeito-rolagem");
      } else {
        cabecalho.classList.remove("efeito-rolagem");
      }
    });
  }
}
aplicarEfeitoScroll(cabecalhoGeral);
aplicarEfeitoScroll(cabecalhoCursos);

// --- RENDERIZAÇÃO DOS SETORES (HOME) VIA FIRESTORE ---
const gridSetores = document.getElementById("grid-setores");
if (gridSetores) {
  async function carregarSetores() {
    try {
      const querySnapshot = await getDocs(collection(db, "setores"));
      gridSetores.innerHTML = ""; // Limpa os cards de marcação do HTML

      querySnapshot.forEach((documento) => {
        const setor = documento.data();
        const cardHTML = `
            <a href="cursos.html?setor=${setor.id}" class="card-setor">
                <div class="card-icone">${setor.icone}</div>
                <h2>${setor.nome}</h2>
                <p>${setor.descricao}</p>
            </a>
        `;
        gridSetores.innerHTML += cardHTML;
      });
    } catch (erro) {
      console.error("Erro ao carregar do Firestore:", erro);
    }
  }
  carregarSetores();

  const inputPesquisa = document.getElementById("input-pesquisa");
  if (inputPesquisa) {
    inputPesquisa.addEventListener("input", (evento) => {
      const termoPesquisado = evento.target.value.toLowerCase();
      const cards = document.querySelectorAll(".card-setor");
      cards.forEach((card) => {
        const textoDoCard = card.innerText.toLowerCase();
        card.style.display = textoDoCard.includes(termoPesquisado)
          ? "flex"
          : "none";
      });
    });
  }
}

// --- RENDERIZAÇÃO DOS CURSOS (INTERNA) VIA FIRESTORE ---
const listaCursos = document.getElementById("lista-cursos");
if (listaCursos) {
  window.carregarDetalhesSetor = async function () {
    const parametrosDaURL = new URLSearchParams(window.location.search);
    const setorId = parametrosDaURL.get("setor");

    try {
      const docRef = doc(db, "setores", setorId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const setorEncontrado = docSnap.data();

        document.getElementById("titulo-setor").textContent =
          setorEncontrado.nome;
        document.getElementById("descricao-setor").textContent =
          setorEncontrado.descricao;
        // --- NOVA LÓGICA DO E-MAIL ---
        const caixaEmail = document.getElementById("caixa-email-setor");
        const linkEmail = document.getElementById("link-email-setor");

        if (setorEncontrado.emailResponsavel) {
          // Se o setor tem um e-mail cadastrado, mostra a caixa e configura o link
          linkEmail.textContent = setorEncontrado.emailResponsavel;
          linkEmail.href = `mailto:${setorEncontrado.emailResponsavel}`; // Abre o e-mail do usuário ao clicar
          caixaEmail.style.display = "inline-flex";
        } else {
          // Se não tem, esconde a caixa
          caixaEmail.style.display = "none";
        }
        // --- FIM DA LÓGICA DO E-MAIL ---

        listaCursos.innerHTML = "";
        if (!setorEncontrado.cursos || setorEncontrado.cursos.length === 0) {
          listaCursos.innerHTML =
            "<p>Nenhum treinamento cadastrado para este setor ainda.</p>";
        } else {
          setorEncontrado.cursos.forEach((curso, index) => {
            let listaVideosHTML = "";
            if (curso.videos && curso.videos.length > 0) {
              curso.videos.forEach((video) => {
                const videoId = obterIdYoutube(video.url);
                const urlCapa = videoId
                  ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                  : "";

                listaVideosHTML += `
                    <div class="item-video">
                        <h4>🎥 ${video.titulo}</h4>
                        <div class="video-container lazy-video" data-url="${video.url}" onclick="carregarVideo(this)" title="Clique para reproduzir">
                            <img src="${urlCapa}" alt="Capa do vídeo">
                            <div class="btn-play">▶</div>
                        </div>
                    </div>
                `;
              });
            }

            let listaPdfsHTML = "";
            if (curso.pdfs && curso.pdfs.length > 0) {
              curso.pdfs.forEach((pdf) => {
                listaPdfsHTML += `<a href="${pdf.url}" target="_blank" class="btn-pdf">📄 ${pdf.titulo}</a>`;
              });
            }

            // Só cria o HTML do botão de excluir SE o usuário for o Administrador
            const btnExcluirHTML = window.isAdmin
              ? `<button class="btn-excluir" onclick="deletarCurso(event, '${setorId}', ${index})" title="Excluir Treinamento">🗑️</button>`
              : "";

            const cursoHTML = `
                <div class="curso-bloco" id="curso-${index}">
                    <div class="curso-cabecalho" onclick="alternarCurso('curso-${index}')" tabindex="0">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <h3>📚 ${curso.titulo}</h3>
                            ${btnExcluirHTML}
                        </div>
                        <span class="icone-expansao">▼</span>
                    </div>
                    <div class="curso-conteudo">
                        <div class="area-videos">${listaVideosHTML}</div>
                        <div class="acoes-curso">${listaPdfsHTML}</div>
                    </div>
                </div>
            `;
            listaCursos.innerHTML += cursoHTML;
          });
        }
      } else {
        document.getElementById("titulo-setor").textContent =
          "Setor não encontrado";
      }
    } catch (erro) {
      console.error("Erro ao carregar os cursos:", erro);
    }
  };
  window.carregarDetalhesSetor();

  // --- LÓGICA DO MODAL DE NOVO CURSO (ADMIN) ---
  const btnAddCursoSetor = document.getElementById("btn-add-curso-setor");
  const modalNovoCurso = document.getElementById("modal-novo-curso");
  const btnFecharModal = document.getElementById("btn-fechar-modal");
  const formCursoLocal = document.getElementById("form-curso-local");

  if (btnAddCursoSetor && modalNovoCurso) {
    // Abre o Modal
    btnAddCursoSetor.addEventListener("click", () => {
      modalNovoCurso.style.display = "flex";
    });

    // Fecha o Modal no "X"
    btnFecharModal.addEventListener("click", () => {
      modalNovoCurso.style.display = "none";
    });

    // Fecha clicando fora da caixa preta
    modalNovoCurso.addEventListener("click", (e) => {
      if (e.target === modalNovoCurso) modalNovoCurso.style.display = "none";
    });

    // SALVAR NO BANCO DE DADOS
    formCursoLocal.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btnSalvar = document.getElementById("btn-salvar-modal");
      btnSalvar.textContent = "Salvando...";

      // Pega o ID do setor direto da URL onde o Admin está
      const parametrosDaURL = new URLSearchParams(window.location.search);
      const setorId = parametrosDaURL.get("setor");

      const titulo = document.getElementById("modal-titulo").value;
      const videoNome = document.getElementById("modal-video-nome").value;
      const videoUrl = document.getElementById("modal-video-url").value;
      const pdfNome = document.getElementById("modal-pdf-nome").value;
      const pdfUrl = document.getElementById("modal-pdf-url").value;

      // Monta o objeto com cuidado para não gerar listas vazias que quebram o código
      const novoCurso = {
        titulo: titulo,
        videos: videoUrl
          ? [{ titulo: videoNome || "Vídeo da Aula", url: videoUrl }]
          : [],
        pdfs: pdfUrl
          ? [{ titulo: pdfNome || "Material em PDF", url: pdfUrl }]
          : [],
      };

      try {
        // Envia direto para o setor atual
        const setorRef = doc(db, "setores", setorId);
        await updateDoc(setorRef, { cursos: arrayUnion(novoCurso) });

        alert("Treinamento adicionado com sucesso!");
        modalNovoCurso.style.display = "none";
        formCursoLocal.reset(); // Limpa o formulário

        // RECARREGA A LISTA NA MESMA HORA SEM PRECISAR DAR F5!
        carregarDetalhesSetor();
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao salvar o curso. Verifique sua conexão ou permissões.");
      } finally {
        btnSalvar.textContent = "Salvar Treinamento";
      }
    });
  }

  const inputPesquisaCurso = document.getElementById("input-pesquisa-curso");
  if (inputPesquisaCurso) {
    inputPesquisaCurso.addEventListener("input", (evento) => {
      const termoPesquisado = evento.target.value.toLowerCase();
      const blocosDeCursos = document.querySelectorAll(".curso-bloco");

      blocosDeCursos.forEach((bloco) => {
        const textoDoBloco = bloco.innerText.toLowerCase();
        bloco.style.display = textoDoBloco.includes(termoPesquisado)
          ? "block"
          : "none";
      });
    });
  }
}

// --- FUNÇÕES GLOBAIS ---
window.alternarCurso = function (idCurso) {
  const blocoClicado = document.getElementById(idCurso);
  const jaEstavaAberto = blocoClicado.classList.contains("aberto");
  const todosBlocos = document.querySelectorAll(".curso-bloco");

  if (jaEstavaAberto) {
    blocoClicado.classList.remove("aberto");
    todosBlocos.forEach((bloco) => {
      bloco.style.display = "block";
    });
  } else {
    todosBlocos.forEach((bloco) => {
      bloco.classList.remove("aberto");
      if (bloco.id === idCurso) {
        bloco.classList.add("aberto");
        bloco.style.display = "block";
      } else {
        bloco.style.display = "none";
      }
    });
  }
};

function obterIdYoutube(url) {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  return match ? match[1] : null;
}

window.carregarVideo = function (elementoHtml) {
  const urlOriginal = elementoHtml.getAttribute("data-url");
  elementoHtml.innerHTML = `<iframe src="${urlOriginal}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  elementoHtml.onclick = null;
  elementoHtml.style.cursor = "default";
};

// --- FUNÇÃO PARA EXCLUIR UM CURSO ---
window.deletarCurso = async function(evento, setorId, indexDoCurso) {
    // Impede que o clique na lixeira abra o sanfona do curso
    evento.stopPropagation(); 

    const confirmacao = confirm("Tem certeza que deseja excluir este treinamento? Esta ação apagará o módulo permanentemente.");
    if (!confirmacao) return;

    try {
        const docRef = doc(db, "setores", setorId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const setor = docSnap.data();
            let listaCursos = setor.cursos || [];

            // Remove 1 item da lista exatamente na posição (index) que o usuário clicou
            listaCursos.splice(indexDoCurso, 1);

            // Salva a nova lista (sem o curso apagado) de volta no Firebase
            await updateDoc(docRef, { cursos: listaCursos });

            alert("Treinamento excluído com sucesso!");
            
            // Recarrega a tela imediatamente para o curso sumir
            carregarDetalhesSetor(); 
        }
    } catch(error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir. Verifique sua conexão e tente novamente.");
    }
};