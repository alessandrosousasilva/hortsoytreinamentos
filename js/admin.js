import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD020dSaYAKlmmq8ce2oDqRJyAMzOHL90I",
  authDomain: "hortsoy-treinamentos-847e2.firebaseapp.com",
  projectId: "hortsoy-treinamentos-847e2",
  storageBucket: "hortsoy-treinamentos-847e2.firebasestorage.app",
  messagingSenderId: "247605921968",
  appId: "1:247605921968:web:307eef1017e68b398e9375",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.dadosPlanilha = [
  [
    "E-mail do Colaborador",
    "Setor do Colaborador",
    "Progresso no Setor (%)",
    "Progresso Global (%)",
  ],
];

// =========================================
// 1. TRAVA DE SEGURANÇA E INÍCIO
// =========================================
onAuthStateChanged(auth, async (user) => {
  const emailAdmin = "admin@hortsoy.com.br";

  if (!user || user.email !== emailAdmin) {
    alert("Acesso Negado. Apenas administradores podem ver os relatórios.");
    window.location.href = "/index.html";
    return;
  }

  await carregarDashboard();
});

// =========================================
// 2. BUSCAR DADOS E FILTRAR "FANTASMAS"
// =========================================
async function carregarDashboard() {
  try {
    window.dadosPlanilha = [
      [
        "E-mail do Colaborador",
        "Setor do Colaborador",
        "Progresso no Setor (%)",
        "Progresso Global (%)",
      ],
    ];

    const setoresSnap = await getDocs(collection(db, "setores"));
    let mapaSetores = {};
    let totalGlobalPlataforma = 0;

    let idsValidos = new Set();

    setoresSnap.forEach((d) => {
      const dados = d.data();
      const setorId = d.id;
      let itensNoSetor = 0;

      if (dados.cursos) {
        dados.cursos.forEach((c, index) => {
          if (c.videos) {
            c.videos.forEach((v, vIndex) => {
              idsValidos.add(`${setorId}_${index}_video_${vIndex}`);
              itensNoSetor++;
            });
          }
          if (c.pdfs) {
            c.pdfs.forEach((p, pIndex) => {
              idsValidos.add(`${setorId}_${index}_pdf_${pIndex}`);
              itensNoSetor++;
            });
          }
        });
      }
      mapaSetores[setorId] = itensNoSetor;
      totalGlobalPlataforma += itensNoSetor;
    });

    const usuariosSnap = await getDocs(collection(db, "usuarios"));
    const progressoSnap = await getDocs(collection(db, "progresso"));

    let todosEmails = new Set();
    let dadosUsuarios = {};

    usuariosSnap.forEach((d) => {
      todosEmails.add(d.id);
      dadosUsuarios[d.id] = { setor: d.data().setor, progresso: {} };
    });

    progressoSnap.forEach((d) => {
      todosEmails.add(d.id);
      if (!dadosUsuarios[d.id]) {
        dadosUsuarios[d.id] = { setor: "Não Informado", progresso: {} };
      }
      dadosUsuarios[d.id].progresso = d.data();
    });

    const tbody = document.getElementById("tabela-corpo");
    tbody.innerHTML = "";

    if (todosEmails.size === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Nenhum colaborador encontrado.</td></tr>`;
      return;
    }

    todosEmails.forEach((email) => {
      const infoUser = dadosUsuarios[email];
      const setorDoUser = infoUser.setor || "Não Informado";
      const progressoData = infoUser.progresso || {};

      let totalConcluidos = 0;
      let concluidosNoSetor = 0;

      Object.keys(progressoData).forEach((chave) => {
        if (progressoData[chave] === true && idsValidos.has(chave)) {
          totalConcluidos++;
          if (chave.startsWith(setorDoUser + "_")) {
            concluidosNoSetor++;
          }
        }
      });

      const totalNoSetor = mapaSetores[setorDoUser] || 0;

      const percSetor =
        totalNoSetor === 0
          ? 0
          : Math.round((concluidosNoSetor / totalNoSetor) * 100);
      const percGlobal =
        totalGlobalPlataforma === 0
          ? 0
          : Math.round((totalConcluidos / totalGlobalPlataforma) * 100);

      tbody.innerHTML += `
          <tr class="linha-usuario">
              <td>
                  <div style="display:flex; flex-direction:column;">
                      <strong>${email}</strong>
                      <small style="color:var(--cor-verde-hortsoy); font-weight:bold;">Setor: ${setorDoUser.toUpperCase()}</small>
                  </div>
              </td>
              <td>
                  <div style="display:flex; flex-direction:column; gap:5px;">
                      <span style="font-size: 0.85rem; color: var(--texto-secundario);">${percSetor}% do Setor (${concluidosNoSetor}/${totalNoSetor})</span>
                      <div class="progresso-container" style="margin:0;"><div class="progresso-barra" style="width:${percSetor}%"></div></div>
                  </div>
              </td>
              <td>
                  <div style="display:flex; flex-direction:column; gap:5px;">
                      <span style="font-size: 0.85rem; color: var(--texto-secundario);">${percGlobal}% Global (${totalConcluidos}/${totalGlobalPlataforma})</span>
                      <div class="progresso-container" style="margin:0;"><div class="progresso-barra" style="width:${percGlobal}%; background-color:#2196F3;"></div></div>
                  </div>
              </td>
              <td style="text-align: center; vertical-align: middle;">
                  <button onclick="excluirHistorico('${email}')" title="Excluir histórico deste colaborador" 
                          style="background:none; border:none; cursor:pointer; font-size:1.3rem; opacity:0.6; transition: 0.2s;">
                      🗑️
                  </button>
              </td>
          </tr>
      `;

      window.dadosPlanilha.push([
        email,
        setorDoUser,
        percSetor + "%",
        percGlobal + "%",
      ]);
    });

    configurarFiltro();
  } catch (e) {
    console.error(e);
    document.getElementById("tabela-corpo").innerHTML =
      `<tr><td colspan="4" style="color: red; text-align:center;">Erro ao carregar os dados.</td></tr>`;
  }
}

// =========================================
// 3. FUNÇÕES GERAIS (Filtro, Excel, Excluir)
// =========================================
function configurarFiltro() {
  const inputFiltro = document.getElementById("filtro-usuarios");
  if (!inputFiltro) return;

  inputFiltro.addEventListener("input", (evento) => {
    const termo = evento.target.value.toLowerCase();
    const linhas = document.querySelectorAll(".linha-usuario");

    linhas.forEach((linha) => {
      const textoDaLinha = linha.innerText.toLowerCase();
      if (textoDaLinha.includes(termo)) {
        linha.style.display = "";
      } else {
        linha.style.display = "none";
      }
    });
  });
}

window.excluirHistorico = async function (emailParaExcluir) {
  const confirmacao = confirm(
    `Tem certeza que deseja excluir o histórico de ${emailParaExcluir}?\n\nEsta ação apagará os registros deste painel permanentemente.`,
  );
  if (!confirmacao) return;

  try {
    await deleteDoc(doc(db, "usuarios", emailParaExcluir));
    await deleteDoc(doc(db, "progresso", emailParaExcluir));
    alert("Histórico excluído com sucesso!");
    carregarDashboard();
  } catch (e) {
    console.error("Erro ao excluir histórico:", e);
    alert("Erro ao tentar excluir. Verifique sua conexão e tente novamente.");
  }
};

window.exportarExcel = function () {
  let csvContent = "data:text/csv;charset=utf-8,";

  window.dadosPlanilha.forEach(function (linha) {
    let formatoLinha = linha.join(";");
    csvContent += formatoLinha + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);

  const dataHoje = new Date().toISOString().split("T")[0];
  link.setAttribute("download", `Relatorio_HortSoy_${dataHoje}.csv`);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// =========================================
// 4. LÓGICA DO MODO ESCURO (ADMIN)
// =========================================
const btnTema = document.getElementById("btn-tema");
const body = document.body;
const logoHortsoy = document.getElementById("logo-hortsoy");

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
