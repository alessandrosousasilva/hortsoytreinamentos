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
// --- PROTEÇÃO DE ROTA E MENU DO USUÁRIO ---
// ==========================================
onAuthStateChanged(auth, (user) => {
  let paginaAtual = window.location.pathname.split("/").pop();

  // 1. CORREÇÃO NETLIFY: Se a URL estiver limpa, consideramos a página inicial
  if (paginaAtual === "" || paginaAtual === "/") {
    paginaAtual = "index.html";
  }

  // 2. TRAVA: Se NÃO tem usuário logado e não está na tela de login, chuta pro login
  if (!user && paginaAtual !== "login.html") {
    window.location.href = "login.html";
    return; // O return para a execução do código aqui!
  }

  // 3. TRAVA: Se TEM usuário logado e tenta acessar o login, manda pra home
  if (user && paginaAtual === "login.html") {
    window.location.href = "index.html";
    return;
  }

  // 4. SUCESSO: O usuário passou pelas travas! Carregar os dados dele.
  if (user && paginaAtual !== "login.html") {
    const email = user.email;
    const emailAdmin = "admin@hortsoy.com.br"; // E-mail do Administrador
    window.isAdmin = email === emailAdmin;

    // --- BUSCA O PROGRESSO DESTE USUÁRIO ---
    window.progressoUsuario = {};

    getDoc(doc(db, "progresso", email))
      .then((snap) => {
        if (snap.exists()) {
          window.progressoUsuario = snap.data();
        }
        
        // CORREÇÃO FIRESTORE: Só pede os dados do banco DEPOIS de confirmar o crachá
        if (paginaAtual === "index.html" && typeof window.carregarSetores === "function") {
          window.carregarSetores();
        } else if (paginaAtual === "cursos.html" && typeof window.carregarDetalhesSetor === "function") {
          window.carregarDetalhesSetor();
        }
      })
      .catch((e) => {
        console.error("Erro ao ler progresso", e);
        // Tenta desenhar a tela mesmo se o progresso falhar
        if (paginaAtual === "index.html" && typeof window.carregarSetores === "function") window.carregarSetores();
        if (paginaAtual === "cursos.html" && typeof window.carregarDetalhesSetor === "function") window.carregarDetalhesSetor();
      });

    // --- MONTA O NOME DO PERFIL ---
    let nomeExibicao = user.displayName;
    if (!nomeExibicao) {
      try {
        const partesNome = email.split("@")[0].split(".");
        const nome = partesNome[0].charAt(0).toUpperCase() + partesNome[0].slice(1);
        const sobrenome = partesNome.length > 1 ? partesNome[1].charAt(0).toUpperCase() + partesNome[1].slice(1) : "";
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
        window.location.href = "admin.html";
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
          window.location.href = "login.html";
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
    gridSetores.innerHTML = `<p style="text-align: center; color: red;">Erro ao carregar módulos. Verifique suas permissões.</p>`;
  }
};

const inputPesquisa = document.getElementById("input-pesquisa");
if (inputPesquisa) {
  inputPesquisa.addEventListener("input", (evento) => {
    const termoPesquisado = evento.target.value.toLowerCase();
    const cards = document.querySelectorAll(".card-setor");
    cards.forEach((card) => {
      const textoDoCard = card.innerText.toLowerCase();
      card.style.display = textoDoCard.includes(termoPesquisado) ? "flex" : "none";
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

      document.getElementById("titulo-setor").textContent = setorEncontrado.nome;
      document.getElementById("descricao-setor").textContent = setorEncontrado.descricao;
      
      const caixaEmail = document.getElementById("caixa-email-setor");
      const linkEmail = document.getElementById("link-email-setor");

      if (setorEncontrado.emailResponsavel) {
        linkEmail.textContent = setorEncontrado.emailResponsavel;
        linkEmail.href = `mailto:${setorEncontrado.emailResponsavel}`;
        caixaEmail.style.display = "inline-flex";
      } else {
        caixaEmail.style.display = "none";
      }

      listaCursos.innerHTML = "";
      if (!setorEncontrado.cursos || setorEncontrado.cursos.length === 0) {
        listaCursos.innerHTML = "<p>Nenhum treinamento cadastrado para este setor ainda.</p>";
      } else {
        setorEncontrado.cursos.forEach((curso, index) => {
          const totalItens = (curso.videos ? curso.videos.length : 0) + (curso.pdfs ? curso.pdfs.length : 0);
          let itensConcluidos = 0;

          let listaVideosHTML = "";
          if (curso.videos && curso.videos.length > 0) {
            curso.videos.forEach((video, vIndex) => {
              const videoId = obterIdYoutube(video.url);
              const idUnico = `${setorId}_${index}_video_${vIndex}`;

              if (window.progressoUsuario[idUnico]) itensConcluidos++;
              const iconeStatus = window.progressoUsuario[idUnico] ? "✅" : "🎥";

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
              const iconeStatus = window.progressoUsuario[idUnico] ? "✅" : "📄";

              listaPdfsHTML += `<a href="${pdf.url}" target="_blank" class="btn-pdf" onclick="registrarProgresso('${idUnico}')">${iconeStatus} ${pdf.titulo}</a>`;
            });
          }

          const porcentagem = totalItens === 0 ? 0 : Math.round((itensConcluidos / totalItens) * 100);

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
      document.getElementById("titulo-setor").textContent = "Setor não encontrado";
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
    const editIndex = parseInt(document.getElementById("modal-edit-index").value);
    btnSalvar.textContent = "Salvando...";
    btnSalvar.disabled = true;

    const parametrosDaURL = new URLSearchParams(window.location.search);
    const setorId = parametrosDaURL.get("setor");

    let videoUrlBruta = document.getElementById("modal-video-url").value;
    let videoUrlFinal = videoUrlBruta;

    if (videoUrlBruta) {
      const regexYT = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const match = videoUrlBruta.match(regexYT);
      if (match && match[1]) {
        videoUrlFinal = `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    const novoCurso = {
      titulo: document.getElementById("modal-titulo").value,
      videos: videoUrlFinal ? [{ titulo: document.getElementById("modal-video-nome").value || "Aula", url: videoUrlFinal }] : [],
      pdfs: document.getElementById("modal-pdf-url").value ? [{ titulo: document.getElementById("modal-pdf-nome").value || "PDF", url: document.getElementById("modal-pdf-url").value }] : [],
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

      alert(editIndex === -1 ? "Treinamento adicionado com sucesso!" : "Treinamento atualizado com sucesso!");
      modalNovoCurso.style.display = "none";
      window.carregarDetalhesSetor();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar o curso. Verifique sua conexão e permissões.");
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
        bloco.style.display = textoDoBloco.includes(termoPesquisado) ? "block" : "none";
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
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  return match ? match[1] : null;
}

window.deletarCurso = async function (evento, setorId, indexDoCurso) {
  evento.stopPropagation();

  const confirmacao = confirm("Tem certeza que deseja excluir este treinamento? Esta ação apagará o módulo permanentemente.");
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
    alert("Erro ao excluir. Verifique sua conexão e tente novamente.");
  }
};

window.prepararEdicao = async function (evento, setorId, index) {
  evento.stopPropagation();

  const docRef = doc(db, "setores", setorId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const curso = docSnap.data().cursos[index];

    document.getElementById("modal-titulo").value = curso.titulo;
    document.getElementById("modal-video-nome").value = curso.videos[0]?.titulo || "";
    document.getElementById("modal-video-url").value = curso.videos[0]?.url || "";
    document.getElementById("modal-pdf-nome").value = curso.pdfs[0]?.titulo || "";
    document.getElementById("modal-pdf-url").value = curso.pdfs[0]?.url || "";

    document.getElementById("modal-edit-index").value = index;
    document.querySelector(".modal-header h2").textContent = "Editar Treinamento";
    document.getElementById("modal-novo-curso").style.display = "flex";
  }
};

// ==========================================
// --- LÓGICA DE PROGRESSO DO USUÁRIO ---
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
    await setDoc(doc(db, "progresso", email), {
        [idUnico]: true,
      },
      { merge: true }
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
