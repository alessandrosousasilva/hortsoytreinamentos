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
  setDoc,
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

// ==========================================
// --- PROTEÇÃO DE ROTA E MENU DO UTILIZADOR ---
// ==========================================
onAuthStateChanged(auth, (user) => {
  let paginaAtual = window.location.pathname.split("/").pop();

  if (paginaAtual === "" || paginaAtual === "/") {
    paginaAtual = "index.html";
  }

  // CORREÇÃO: Redirecionamento para Login usando caminho absoluto
  if (!user && paginaAtual !== "login.html") {
    window.location.href = "/pages/login.html";
    return;
  }

  // CORREÇÃO: Redirecionamento para Home usando caminho absoluto
  if (user && paginaAtual === "login.html") {
    window.location.href = "/index.html";
    return;
  }

  if (user && paginaAtual !== "login.html") {
    const email = user.email;
    const emailAdmin = "admin@hortsoy.com.br";
    window.isAdmin = email === emailAdmin;

    window.progressoUsuario = {};

    getDoc(doc(db, "progresso", email))
      .then((snap) => {
        if (snap.exists()) {
          window.progressoUsuario = snap.data();
        }

        if (
          paginaAtual === "index.html" &&
          typeof window.carregarSetores === "function"
        )
          window.carregarSetores();
        else if (
          paginaAtual === "cursos.html" &&
          typeof window.carregarDetalhesSetor === "function"
        )
          window.carregarDetalhesSetor();
      })
      .catch((e) => {
        console.error("Erro ao ler progresso", e);
        if (
          paginaAtual === "index.html" &&
          typeof window.carregarSetores === "function"
        )
          window.carregarSetores();
        if (
          paginaAtual === "cursos.html" &&
          typeof window.carregarDetalhesSetor === "function"
        )
          window.carregarDetalhesSetor();
      });

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

    const elNomeUsuario = document.getElementById("nome-usuario");
    const elEmailUsuario = document.getElementById("email-usuario");
    if (elNomeUsuario) elNomeUsuario.textContent = nomeExibicao;
    if (elEmailUsuario) elEmailUsuario.textContent = email;

    const inicial = nomeExibicao.charAt(0).toUpperCase();
    const elAvatarMini = document.getElementById("avatar-mini");
    const elAvatarGrande = document.getElementById("avatar-grande");
    if (elAvatarMini) elAvatarMini.textContent = inicial;
    if (elAvatarGrande) elAvatarGrande.textContent = inicial;

    const dropdownPerfil = document.getElementById("dropdown-perfil");
    const btnSair = document.getElementById("btn-sair");
    const btnAdmin = document.getElementById("btn-admin");

    if (btnAdmin && window.isAdmin) {
      btnAdmin.style.display = "inline-block";
      btnAdmin.addEventListener("click", () => {
        // CORREÇÃO: Caminho para o Painel Admin
        window.location.href = "/pages/admin.html";
      });

      const btnAddCursoSetor = document.getElementById("btn-add-curso-setor");
      if (btnAddCursoSetor) btnAddCursoSetor.style.display = "inline-block";
    }

    if (elAvatarMini && dropdownPerfil) {
      elAvatarMini.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownPerfil.classList.toggle("mostrar");
      });

      document.addEventListener("click", (e) => {
        if (!dropdownPerfil.contains(e.target)) {
          dropdownPerfil.classList.remove("mostrar");
        }
      });
    }

    if (btnSair) {
      btnSair.addEventListener("click", () => {
        signOut(auth).then(() => {
          // CORREÇÃO: Redirecionamento ao Sair
          window.location.href = "/pages/login.html";
        });
      });
    }
  }
});

// ==========================================
// --- LÓGICA DO MODO ESCURO E CABEÇALHO ---
// ==========================================
const btnTema = document.getElementById("btn-tema");
const body = document.body;
const logoHortsoy = document.getElementById("logo-hortsoy");

// CORREÇÃO: Logos agora usam caminhos absolutos /assets/...
if (localStorage.getItem("tema") === "escuro") {
  body.classList.add("modo-escuro");
  if (logoHortsoy) logoHortsoy.src = "/assets/logos/jee-branco.png";
  if (btnTema) btnTema.textContent = "☀️";
}

if (btnTema) {
  btnTema.addEventListener("click", () => {
    body.classList.toggle("modo-escuro");

    if (body.classList.contains("modo-escuro")) {
      if (logoHortsoy) logoHortsoy.src = "/assets/logos/jee-branco.png";
      btnTema.textContent = "☀️";
      localStorage.setItem("tema", "escuro");
    } else {
      if (logoHortsoy) logoHortsoy.src = "/assets/logos/jee-preto.png";
      btnTema.textContent = "🌙";
      localStorage.setItem("tema", "claro");
    }
  });
}

const cabecalhoGeral = document.querySelector(".cabecalho");
const cabecalhoCursos = document.querySelector(".cabecalho-cursos");

function aplicarEfeitoScroll(cabecalho) {
  if (cabecalho) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) cabecalho.classList.add("efeito-rolagem");
      else cabecalho.classList.remove("efeito-rolagem");
    });
  }
}
aplicarEfeitoScroll(cabecalhoGeral);
aplicarEfeitoScroll(cabecalhoCursos);

// FAQ (Tira Dúvidas)
window.alternarFaq = function (elementoClicado) {
  const faqItem = elementoClicado.parentElement;
  const jaEstaAberto = faqItem.classList.contains("aberto");
  const todosFaqs = document.querySelectorAll(".faq-item");
  todosFaqs.forEach((item) => item.classList.remove("aberto"));
  if (!jaEstaAberto) {
    faqItem.classList.add("aberto");
  }
};

// ==========================================
// --- FUNÇÕES DE LINHAS DINÂMICAS DO MODAL ---
// ==========================================
window.addLinhaVideo = function (nome = "", url = "") {
  const container = document.getElementById("container-videos");
  if (!container) return;
  const idUnico = Date.now() + Math.random();

  const html = `
    <div class="form-row linha-dinamica" id="linha-${idUnico}" style="align-items: flex-start;">
      <div class="form-grupo" style="margin-bottom:0;">
        <input type="text" class="video-nome" placeholder="Nome da Aula" value="${nome}">
      </div>
      <div class="form-grupo" style="margin-bottom:0;">
        <input type="text" class="video-url" placeholder="Link YouTube ou Código SharePoint" value="${url}">
        <small style="color: var(--texto-secundario); font-size: 0.75rem; margin-top: 5px; display: block;">Entre no vídeo dentro do oneDrive, clique em <b>"Compartilhar"</b> e <b>"Código de Inserção" </b>e copie o (&lt;iframe&gt;).
        </small>
      </div>
      <button type="button" class="btn-remover-linha" onclick="removerLinha('${idUnico}')" title="Remover Vídeo" style="margin-top: 10px;">🗑️</button>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", html);
};

window.addLinhaPdf = function (nome = "", url = "") {
  const container = document.getElementById("container-pdfs");
  if (!container) return;
  const idUnico = Date.now() + Math.random();

  // Mudamos type="url" para type="text" e adicionamos o <small> com a dica de compartilhamento
  const html = `
    <div class="form-row linha-dinamica" id="linha-${idUnico}" style="align-items: flex-start;">
      <div class="form-grupo" style="margin-bottom:0;">
        <input type="text" class="pdf-nome" placeholder="Nome do PDF" value="${nome}">
      </div>
      <div class="form-grupo" style="margin-bottom:0;">
        <input type="text" class="pdf-url" placeholder="Link de Compartilhamento" value="${url}">
        <small style="color: var(--texto-secundario); font-size: 0.75rem; margin-top: 5px; display: block;">
          Clique em Compartilhar no arquivo (OneDrive/SharePoint) e cole o link direto aqui.
        </small>
      </div>
      <button type="button" class="btn-remover-linha" onclick="removerLinha('${idUnico}')" title="Remover PDF" style="margin-top: 10px;">🗑️</button>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", html);
};

window.removerLinha = function (id) {
  const elemento = document.getElementById(`linha-${id}`);
  if (elemento) elemento.remove();
};

// ==========================================
// --- RENDERIZAÇÃO DOS SETORES (HOME) ---
// ==========================================
window.carregarSetores = async function () {
  const gridSetores = document.getElementById("grid-setores");
  if (!gridSetores) return;

  try {
    const querySnapshot = await getDocs(collection(db, "setores"));
    gridSetores.innerHTML = "";

    querySnapshot.forEach((documento) => {
      const setor = documento.data();
      const cardHTML = `
          <a href="/pages/cursos.html?setor=${setor.id}" class="card-setor">
              <div class="card-icone">${setor.icone}</div>
              <h2>${setor.nome}</h2>
              <p>${setor.descricao}</p>
          </a>
      `;
      gridSetores.innerHTML += cardHTML;
    });
  } catch (erro) {
    console.error("Erro ao carregar do Firestore:", erro);
    gridSetores.innerHTML = `<p style="text-align: center; color: red;">Erro ao carregar módulos. Verifique as permissões.</p>`;
  }
};

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

// ==========================================
// --- RENDERIZAÇÃO DOS CURSOS (INTERNA) ---
// ==========================================
window.carregarDetalhesSetor = async function () {
  const listaCursos = document.getElementById("lista-cursos");
  if (!listaCursos) return;

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

      listaCursos.innerHTML = "";
      if (!setorEncontrado.cursos || setorEncontrado.cursos.length === 0) {
        listaCursos.innerHTML =
          "<p>Nenhum treinamento cadastrado para este setor ainda.</p>";
      } else {
        setorEncontrado.cursos.forEach((curso, index) => {
          const totalItens =
            (curso.videos ? curso.videos.length : 0) +
            (curso.pdfs ? curso.pdfs.length : 0);
          let itensConcluidos = 0;

          let listaVideosHTML = "";
          if (curso.videos && curso.videos.length > 0) {
            curso.videos.forEach((video, vIndex) => {
              const videoId = obterIdYoutube(video.url);
              const idUnico = `${setorId}_${index}_video_${vIndex}`;

              if (window.progressoUsuario[idUnico]) itensConcluidos++;
              const iconeStatus = window.progressoUsuario[idUnico]
                ? "✅"
                : "🎥";

              let tagCapaHTML = "";
              if (videoId) {
                const urlCapa = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                tagCapaHTML = `<img src="${urlCapa}" alt="Capa do vídeo">`;
              }

              listaVideosHTML += `
                  <div class="item-video">
                      <h4>${iconeStatus} ${video.titulo}</h4>
                      <div class="video-container lazy-video" data-url="${video.url}" data-id="${idUnico}" onclick="carregarVideoTrackeado(this)" title="Clique para reproduzir">
                          ${tagCapaHTML}
                          <div class="btn-play">▶</div>
                      </div>
                  </div>
              `;
            });
          }

          let listaPdfsHTML = "";
          if (curso.pdfs && curso.pdfs.length > 0) {
            curso.pdfs.forEach((pdf, pIndex) => {
              const idUnico = `${setorId}_${index}_pdf_${pIndex}`;
              if (window.progressoUsuario[idUnico]) itensConcluidos++;
              const iconeStatus = window.progressoUsuario[idUnico]
                ? "✅"
                : "📄";

              listaPdfsHTML += `<a href="${pdf.url}" target="_blank" class="btn-pdf" onclick="registrarProgresso('${idUnico}')">${iconeStatus} ${pdf.titulo}</a>`;
            });
          }

          const porcentagem =
            totalItens === 0
              ? 0
              : Math.round((itensConcluidos / totalItens) * 100);

          let botoesAdminHTML = "";
          if (window.isAdmin) {
            botoesAdminHTML = `
                  <div style="display: flex; gap: 8px;">
                      <button class="btn-editar" onclick="prepararEdicao(event, '${setorId}', ${index})" title="Editar Treinamento">✏️</button>
                      <button class="btn-excluir" onclick="deletarCurso(event, '${setorId}', ${index})" title="Excluir Treinamento">🗑️</button>
                  </div>
              `;
          }

          const cursoHTML = `
              <div class="curso-bloco" id="curso-${index}">
                  <div class="curso-cabecalho" onclick="alternarCurso('curso-${index}')" tabindex="0">
                      <div>
                          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                              <h3>📚 ${curso.titulo}</h3>
                              ${botoesAdminHTML}
                          </div>
                          <div class="progresso-container">
                              <div class="progresso-barra" style="width: ${porcentagem}%"></div>
                          </div>
                          <span class="progresso-texto">${porcentagem}% Concluído</span>
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

// ==========================================
// --- FUNÇÕES E EVENTOS DO MODAL (ADMIN) ---
// ==========================================
const btnAddCursoSetor = document.getElementById("btn-add-curso-setor");
const modalNovoCurso = document.getElementById("modal-novo-curso");
const btnFecharModal = document.getElementById("btn-fechar-modal");
const formCursoLocal = document.getElementById("form-curso-local");

if (btnAddCursoSetor && modalNovoCurso) {
  btnAddCursoSetor.addEventListener("click", () => {
    document.getElementById("form-curso-local").reset();
    document.getElementById("modal-edit-index").value = "-1";

    document.getElementById("container-videos").innerHTML = "";
    document.getElementById("container-pdfs").innerHTML = "";
    window.addLinhaVideo();
    window.addLinhaPdf();

    document.querySelector(".modal-header h2").textContent = "Novo Treinamento";
    modalNovoCurso.style.display = "flex";
  });

  btnFecharModal.addEventListener("click", () => {
    modalNovoCurso.style.display = "none";
  });

  modalNovoCurso.addEventListener("click", (e) => {
    if (e.target === modalNovoCurso) modalNovoCurso.style.display = "none";
  });

  formCursoLocal.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btnSalvar = document.getElementById("btn-salvar-modal");
    const editIndex = parseInt(
      document.getElementById("modal-edit-index").value,
    );
    btnSalvar.textContent = "A gravar...";
    btnSalvar.disabled = true;

    const parametrosDaURL = new URLSearchParams(window.location.search);
    const setorId = parametrosDaURL.get("setor");

    // === CAPTURA INFINITA DE VÍDEOS (COM EXTRATOR INTELIGENTE) ===
    const arrayVideos = [];
    document
      .querySelectorAll("#container-videos .linha-dinamica")
      .forEach((linha) => {
        const nome = linha.querySelector(".video-nome").value.trim();
        const urlBruta = linha.querySelector(".video-url").value.trim();
        let urlFinal = urlBruta;

        if (urlBruta) {
          // 1. EXTRATOR DE IFRAME (SharePoint / OneDrive)
          // Se o admin colar o código inteiro <iframe src="...">, pega apenas o link
          if (urlBruta.toLowerCase().includes("<iframe")) {
            const regexIframe = /src=["']([^"']+)["']/;
            const matchIframe = urlBruta.match(regexIframe);
            if (matchIframe && matchIframe[1]) {
              urlFinal = matchIframe[1]; // Pega apenas o que está dentro do src="..."
            }
          }

          // 2. CONVERSOR DO YOUTUBE
          // Se for Youtube, converte para /embed/
          const regexYT =
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
          const matchYT = urlFinal.match(regexYT);
          if (matchYT && matchYT[1]) {
            urlFinal = `https://www.youtube.com/embed/${matchYT[1]}`;
          }

          arrayVideos.push({ titulo: nome || "Aula", url: urlFinal });
        }
      });

    // === CAPTURA INFINITA DE PDFs (COM PROTEÇÃO) ===
    const arrayPdfs = [];
    document
      .querySelectorAll("#container-pdfs .linha-dinamica")
      .forEach((linha) => {
        const nome = linha.querySelector(".pdf-nome").value.trim();
        const urlBruta = linha.querySelector(".pdf-url").value.trim();
        let urlFinal = urlBruta;

        if (urlBruta) {
          // EXTRATOR: Se alguém colar o código de iframe por engano, nós salvamos o sistema recortando só o link
          if (urlBruta.toLowerCase().includes("<iframe")) {
            const regexIframe = /src=["']([^"']+)["']/;
            const matchIframe = urlBruta.match(regexIframe);
            if (matchIframe && matchIframe[1]) {
              urlFinal = matchIframe[1];
            }
          }

          arrayPdfs.push({ titulo: nome || "Arquivo PDF", url: urlFinal });
        }
      });

    const novoCurso = {
      titulo: document.getElementById("modal-titulo").value,
      videos: arrayVideos,
      pdfs: arrayPdfs,
    };

    try {
      const setorRef = doc(db, "setores", setorId);
      const docSnap = await getDoc(setorRef);
      let listaCursos = docSnap.data().cursos || [];

      if (editIndex === -1) {
        listaCursos.push(novoCurso);
      } else {
        listaCursos[editIndex] = novoCurso;
      }

      await updateDoc(setorRef, { cursos: listaCursos });

      alert(
        editIndex === -1
          ? "Treinamento adicionado com sucesso!"
          : "Treinamento atualizado com sucesso!",
      );
      modalNovoCurso.style.display = "none";
      window.carregarDetalhesSetor();
    } catch (error) {
      console.error("Erro ao guardar:", error);
      alert("Erro ao guardar o curso. Verifique as suas permissões.");
    } finally {
      btnSalvar.textContent = "Salvar Treinamento";
      btnSalvar.disabled = false;
    }
  });

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

// ==========================================
// --- FUNÇÕES GLOBAIS DA PLATAFORMA ---
// ==========================================
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

window.deletarCurso = async function (evento, setorId, indexDoCurso) {
  evento.stopPropagation();

  const confirmacao = confirm(
    "Tem certeza que deseja excluir este treinamento? Esta ação apagará o módulo permanentemente.",
  );
  if (!confirmacao) return;

  try {
    const docRef = doc(db, "setores", setorId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const setor = docSnap.data();
      let listaCursos = setor.cursos || [];

      listaCursos.splice(indexDoCurso, 1);
      await updateDoc(docRef, { cursos: listaCursos });

      alert("Treinamento excluído com sucesso!");
      window.carregarDetalhesSetor();
    }
  } catch (error) {
    console.error("Erro ao excluir:", error);
    alert("Erro ao excluir. Verifique a sua conexão e tente novamente.");
  }
};

window.prepararEdicao = async function (evento, setorId, index) {
  evento.stopPropagation();
  const docRef = doc(db, "setores", setorId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const curso = docSnap.data().cursos[index];

    document.getElementById("modal-titulo").value = curso.titulo;
    document.getElementById("modal-edit-index").value = index;

    document.getElementById("container-videos").innerHTML = "";
    document.getElementById("container-pdfs").innerHTML = "";

    if (curso.videos && curso.videos.length > 0)
      curso.videos.forEach((v) => window.addLinhaVideo(v.titulo, v.url));
    else window.addLinhaVideo();

    if (curso.pdfs && curso.pdfs.length > 0)
      curso.pdfs.forEach((p) => window.addLinhaPdf(p.titulo, p.url));
    else window.addLinhaPdf();

    document.querySelector(".modal-header h2").textContent =
      "Editar Treinamento";
    document.getElementById("modal-novo-curso").style.display = "flex";
  }
};

// ==========================================
// --- LÓGICA DE PROGRESSO DO UTILIZADOR ---
// ==========================================
const tagYoutube = document.createElement("script");
tagYoutube.src = "https://www.youtube.com/iframe_api";
const primeiraTag = document.getElementsByTagName("script")[0];
primeiraTag.parentNode.insertBefore(tagYoutube, primeiraTag);

window.registrarProgresso = async function (idUnico) {
  if (!window.progressoUsuario) window.progressoUsuario = {};
  if (window.progressoUsuario[idUnico]) return;

  window.progressoUsuario[idUnico] = true;
  const email = auth.currentUser.email;

  try {
    await setDoc(
      doc(db, "progresso", email),
      {
        [idUnico]: true,
      },
      { merge: true },
    );
    console.log("Progresso salvo com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
  }
};

window.carregarVideoTrackeado = function (elementoHtml) {
  const urlOriginal = elementoHtml.getAttribute("data-url");
  const idUnico = elementoHtml.getAttribute("data-id");
  const videoId = obterIdYoutube(urlOriginal);

  elementoHtml.onclick = null;
  elementoHtml.style.cursor = "default";

  let jaContabilizou = false;

  if (videoId) {
    const divId = `yt-${idUnico}`;
    elementoHtml.innerHTML = `<div id="${divId}"></div>`;

    new YT.Player(divId, {
      videoId: videoId,
      playerVars: { autoplay: 1, rel: 0 },
      events: {
        onStateChange: function (event) {
          if (event.data == 1 && !jaContabilizou) {
            const player = event.target;
            const checador = setInterval(() => {
              const tempoAtual = player.getCurrentTime();
              const duracao = player.getDuration();

              if (duracao > 0 && tempoAtual / duracao >= 0.75) {
                window.registrarProgresso(idUnico);
                jaContabilizou = true;
                clearInterval(checador);
              }
            }, 5000);
          }
        },
      },
    });
  } else if (
    urlOriginal.includes("sharepoint.com") ||
    urlOriginal.includes("embed.aspx") ||
    urlOriginal.includes("onedrive")
  ) {
    window.registrarProgresso(idUnico);
    elementoHtml.innerHTML = `<iframe src="${urlOriginal}" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen></iframe>`;
  } else {
    const videoElement = document.createElement("video");
    videoElement.src = urlOriginal;
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.style.width = "100%";
    videoElement.style.height = "100%";

    elementoHtml.innerHTML = "";
    elementoHtml.appendChild(videoElement);

    videoElement.ontimeupdate = function () {
      if (!jaContabilizou) {
        const progresso = videoElement.currentTime / videoElement.duration;
        if (progresso >= 0.75) {
          window.registrarProgresso(idUnico);
          jaContabilizou = true;
          videoElement.ontimeupdate = null;
        }
      }
    };
  }
};
