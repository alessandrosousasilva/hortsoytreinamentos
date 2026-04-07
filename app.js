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
            // 1. Monta o HTML de todos os vídeos desse curso
            let listaVideosHTML = "";
            if (curso.videos && curso.videos.length > 0) {
              curso.videos.forEach((video) => {
                listaVideosHTML += `
                                    <div class="item-video">
                                        <h4>🎥 ${video.titulo}</h4>
                                        <div class="video-container">
                                            <iframe src="${video.url}" loading="lazy" allowfullscreen></iframe>
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

            // 3. Junta tudo dentro do bloco expansível
            const cursoHTML = `
                            <div class="curso-bloco" id="curso-${index}">
                                <div class="curso-cabecalho" onclick="alternarCurso('curso-${index}')">
                                    <h3>📚 ${curso.titulo}</h3>
                                    <span class="icone-expansao">▼</span>
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
// Função global para abrir/fechar o acordeão dos cursos
// Função global para abrir/fechar o acordeão dos cursos (Apenas UM aberto por vez)
// Função global para abrir/fechar o acordeão (Modo Foco: esconde os outros)
window.alternarCurso = function (idCurso) {
  const blocoClicado = document.getElementById(idCurso);
  const jaEstavaAberto = blocoClicado.classList.contains("aberto");
  const todosBlocos = document.querySelectorAll(".curso-bloco");

  if (jaEstavaAberto) {
    // Se o usuário clicou no curso que JÁ estava aberto, a intenção é fechá-lo.
    // Então fechamos ele e voltamos a mostrar a lista completa de módulos.
    blocoClicado.classList.remove("aberto");
    todosBlocos.forEach((bloco) => {
      bloco.style.display = "block"; // Mostra todos novamente
    });
  } else {
    // Se o usuário clicou em um módulo fechado, abrimos ele e escondemos todos os outros.
    todosBlocos.forEach((bloco) => {
      bloco.classList.remove("aberto"); // Garante que a animação de fechar ocorra

      if (bloco.id === idCurso) {
        bloco.classList.add("aberto"); // Abre o que foi clicado
        bloco.style.display = "block"; // Mantém ele visível na tela
      } else {
        bloco.style.display = "none"; // Oculta todos os outros
      }
    });
  }
};
