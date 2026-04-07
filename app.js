// --- Lógica do Modo Escuro ---
const btnTema = document.getElementById("btn-tema");
const body = document.body;
const logoHortsoy = document.getElementById("logo-hortsoy");

// Verifica se o usuário já tinha escolhido o modo escuro antes
if (localStorage.getItem("tema") === "escuro") {
  body.classList.add("modo-escuro");
  logoHortsoy.src = "assets/logos/logo_hortsoy_branco.png";
  btnTema.textContent = "☀️";
}

btnTema.addEventListener("click", () => {
  body.classList.toggle("modo-escuro");

  if (body.classList.contains("modo-escuro")) {
    // Troca para logo branca e salva preferência
    logoHortsoy.src = "assets/logos/logo_hortsoy_branco.png";
    btnTema.textContent = "☀️";
    localStorage.setItem("tema", "escuro");
  } else {
    // Volta para logo colorida e salva preferência
    logoHortsoy.src = "assets/logos/logo-hortsoy.png";
    btnTema.textContent = "🌙";
    localStorage.setItem("tema", "claro");
  }
});

// --- Efeito do Cabeçalho Fixo ao Rolar a Página ---
const cabecalho = document.querySelector(".cabecalho");

// toda vez que a tela for rolada
window.addEventListener("scroll", () => {
  // Se a barra de rolagem desceu mais de 20 pixels, adiciona o efeito
  if (window.scrollY > 20) {
    cabecalho.classList.add("efeito-rolagem");
  } else {
    // Se voltou para o topo, tira o efeito
    cabecalho.classList.remove("efeito-rolagem");
  }
});

// --- Lógicas Específicas de Cada Página ---
const gridSetores = document.getElementById("grid-setores");
const listaCursos = document.getElementById("lista-cursos");

// SE ESTIVER NA PÁGINA INICIAL (index.html)
if (gridSetores) {
  async function carregarSetores() {
    try {
      const resposta = await fetch("data/cursos.json");
      const setores = await resposta.json();
      gridSetores.innerHTML = "";

      setores.forEach((setor) => {
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
      console.error("Erro ao carregar os setores:", erro);
    }
  }
  carregarSetores();

  // A barra de pesquisa só funciona na index
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

// SE ESTIVER NA PÁGINA INTERNA DE CURSOS (cursos.html)
if (listaCursos) {
  async function carregarDetalhesSetor() {
    // Pega o ID do setor lá na URL (ex: ?setor=rh)
    const parametrosDaURL = new URLSearchParams(window.location.search);
    const setorId = parametrosDaURL.get("setor");

    try {
      const resposta = await fetch("data/cursos.json");
      const setores = await resposta.json();

      // Procura no JSON o setor que tenha o mesmo ID da URL
      const setorEncontrado = setores.find((s) => s.id === setorId);

      if (setorEncontrado) {
        // Preenche o cabeçalho
        document.getElementById("titulo-setor").textContent =
          setorEncontrado.nome;
        document.getElementById("descricao-setor").textContent =
          setorEncontrado.descricao;

        // Cria os cursos
        listaCursos.innerHTML = "";
        if (setorEncontrado.cursos.length === 0) {
          listaCursos.innerHTML =
            "<p>Nenhum treinamento cadastrado para este setor ainda.</p>";
        } else {
          // Passamos um 'index' (número) para criar um ID único para cada bloco
          setorEncontrado.cursos.forEach((curso, index) => {
            // 1. Monta o HTML de todos os vídeos desse curso com Lazy Load
            let listaVideosHTML = "";
            if (curso.videos && curso.videos.length > 0) {
              curso.videos.forEach((video) => {
                const videoId = obterIdYoutube(video.url);
                // Pega a imagem de capa oficial do YouTube
                const urlCapa = videoId
                  ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                  : "";

                listaVideosHTML += `
                                    <div class="item-video">
                                        <h4>🎥 ${video.titulo}</h4>
                                        <div class="video-container lazy-video" data-url="${video.url}" onclick="carregarVideo(this)" title="Clique para reproduzir">
                                            <img src="${urlCapa}" alt="Capa do vídeo ${video.titulo}">
                                            <div class="btn-play">▶</div>
                                        </div>
                                    </div>
                                `;
              });
            }

            // 2. Monta o HTML de todos os PDFs desse curso
            let listaPdfsHTML = "";
            if (curso.pdfs && curso.pdfs.length > 0) {
              curso.pdfs.forEach((pdf) => {
                listaPdfsHTML += `
                                    <a href="${pdf.url}" target="_blank" class="btn-pdf">📄 ${pdf.titulo}</a>
                                `;
              });
            }

            // 3. Junta tudo dentro do bloco expansível com Acessibilidade (A11y)
            const cursoHTML = `
                            <div class="curso-bloco" id="curso-${index}">
                                <div class="curso-cabecalho" 
                                     onclick="alternarCurso('curso-${index}')" 
                                     tabindex="0" 
                                     role="button" 
                                     aria-expanded="false" 
                                     onkeydown="if(event.key === 'Enter' || event.key === ' ') alternarCurso('curso-${index}')">
                                    
                                    <h3>📚 ${curso.titulo}</h3>
                                    <span class="icone-expansao" aria-hidden="true">▼</span>
                                </div>
                                <div class="curso-conteudo">
                                    <div class="area-videos">
                                        ${listaVideosHTML}
                                    </div>
                                    <div class="acoes-curso">
                                        ${listaPdfsHTML}
                                    </div>
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
  }
  carregarDetalhesSetor();
  // --- Lógica da Busca Interna de Cursos ---
  const inputPesquisaCurso = document.getElementById("input-pesquisa-curso");

  if (inputPesquisaCurso) {
    inputPesquisaCurso.addEventListener("input", (evento) => {
      const termoPesquisado = evento.target.value.toLowerCase();
      const blocosDeCursos = document.querySelectorAll(".curso-bloco");

      blocosDeCursos.forEach((bloco) => {
        // Pega todo o texto do bloco (Título do módulo + Nomes dos Vídeos + Nomes dos PDFs)
        const textoDoBloco = bloco.innerText.toLowerCase();

        // Se achar o termo no texto, mostra o bloco. Se não, esconde.
        if (textoDoBloco.includes(termoPesquisado)) {
          bloco.style.display = "block";
        } else {
          bloco.style.display = "none";
        }
      });
    });
  }
}

// Função global para abrir/fechar o acordeão (Modo Foco)
window.alternarCurso = function(idCurso) {
    const blocoClicado = document.getElementById(idCurso);
    const jaEstavaAberto = blocoClicado.classList.contains('aberto');
    const todosBlocos = document.querySelectorAll('.curso-bloco');

    if (jaEstavaAberto) {
        blocoClicado.classList.remove('aberto');
        // Acessibilidade: avisa que fechou
        blocoClicado.querySelector('.curso-cabecalho').setAttribute('aria-expanded', 'false'); 
        
        todosBlocos.forEach(bloco => {
            bloco.style.display = 'block';
        });
    } else {
        todosBlocos.forEach(bloco => {
            bloco.classList.remove('aberto');
            bloco.querySelector('.curso-cabecalho').setAttribute('aria-expanded', 'false');
            
            if (bloco.id === idCurso) {
                bloco.classList.add('aberto');
                bloco.style.display = 'block';
                // Acessibilidade: avisa que abriu
                bloco.querySelector('.curso-cabecalho').setAttribute('aria-expanded', 'true');
            } else {
                bloco.style.display = 'none';
            }
        });
    }
};

// --- Funções de Performance ---

// Extrai o ID do YouTube da URL para pegarmos a imagem de capa
function obterIdYoutube(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Troca a imagem de capa pelo vídeo real (Iframe)
window.carregarVideo = function(elementoHtml) {
    const urlOriginal = elementoHtml.getAttribute('data-url');
    // Injeta o iframe apenas no momento do clique, com autoplay ativado
    elementoHtml.innerHTML = `<iframe src="${urlOriginal}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    // Remove o evento de clique para não recarregar
    elementoHtml.onclick = null;
    elementoHtml.style.cursor = 'default';
};
