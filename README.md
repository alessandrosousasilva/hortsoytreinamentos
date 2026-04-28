# 🚀 JEE - Portal de Treinamentos Corporativos

Plataforma web desenvolvida para centralizar, organizar e disponibilizar os treinamentos internos do Grupo JEE (HortSoy).

## ✨ Funcionalidades

* **Autenticação Segura:** Acesso para e-mails corporativos `@hortsoy.com.br`.
* **Painel de Gestão (Admin):** Dashboard para administradores acompanharem o engajamento da equipe, com cálculo de progresso Global e por Setor, opção de limpar histórico de ex-colaboradores e exportação de relatórios para **Excel (.csv)**.
* **Banco de Dados Serverless:** Todo o conteúdo de texto, estruturação de cursos e progresso dos usuários é gerenciado em tempo real via **Firebase Firestore**.
* **Gestão de Conteúdo (CRUD In-Place):** Administradores podem adicionar, editar e excluir treinamentos diretamente na interface do curso.
* **Módulos Dinâmicos:** Suporte para múltiplos vídeos e múltiplos PDFs dentro de um único bloco de treinamento.
* **Rastreamento de Progresso (LMS):**
  * Integração com a **YouTube IFrame API** para auditar a visualização, contabilizando a aula como concluída apenas após 75% de retenção de tela.
  * Rastreamento de leitura dos materiais de apoio (PDFs) e vídeos internos (SharePoint).
  * Barra de progresso visual calculando a porcentagem de conclusão.
* **Hospedagem Leve na Nuvem:** Os arquivos pesados (PDFs e Vídeos) não ficam no repositório. São consumidos via streaming e links externos compartilhados (OneDrive, SharePoint, YouTube).
* **Extrator Inteligente de Links:** O sistema higieniza automaticamente os links colados pelo administrador, convertendo Iframes complexos em URLs limpas.
* **Interface Adaptável e Acessível:** Alternância de tema (Modo Claro / Modo Escuro) salva no cache do usuário, além de uma seção de FAQ (Tira Dúvidas) embutida na página inicial.

---

## 📖 Manual do Administrador

### ⚠️ Passo a Passo para Adicionar um Novo Curso

1. **Autenticação:** Faça login na plataforma utilizando a conta de Administrador.
2. **Navegação:** Na página inicial, clique no Setor onde deseja inserir o treinamento (ex: "Logística e Estoque").
3. **Painel de Edição:** No topo da lista de cursos, clique no botão verde **"+ Adicionar Treinamento"** (este botão só é visível para administradores).
4. **Preenchimento do Formulário:**
   * **Título do Módulo:** O nome principal do agrupamento (Ex: *Módulo 1 - Introdução*).
   * **Aulas (Vídeos):** Preencha o nome da aula e o link do vídeo. Você pode clicar em "+ Adicionar Vídeo" para colocar várias aulas no mesmo módulo.
   * **Arquivos (PDFs):** Preencha o nome do arquivo e o link de acesso. Você pode adicionar múltiplos PDFs no mesmo módulo.
5. **Salvar:** Clique em "Salvar Treinamento". O banco de dados (Firestore) será atualizado e a tela recarregará automaticamente.

----

### ⚠️ Regras para Links Externos (Vídeos e PDFs)

Para manter a plataforma leve, rápida e sem custos com servidores de armazenamento, os arquivos são gerenciados por link no portal. 

#### 🎥 Para Vídeos
* **Vídeos do YouTube:** Você pode colar qualquer link padrão do YouTube na caixa. O sistema fará a conversão automática para o formato de incorporação (`/embed/`).
* **Vídeos Internos (OneDrive / SharePoint):** 1. Abra o vídeo no OneDrive Corporativo.
  2. Clique em **"Compartilhar -> Código de inserção"**.
  3. Pode **copiar o código inteiro** (o bloco gigante que começa com `<iframe...`) e colar na caixa de link do vídeo. Ao salvar, o sistema limpará o código sozinho e extrairá apenas a URL necessária!

#### 📄 Para PDFs
* Hospede o PDF no **SharePoint** ou **OneDrive** corporativo.
* Clique em "Compartilhar" e copie o link direto.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5 & CSS3**
* **JavaScript (Vanilla JS / ES6 Modules)** * **Firebase Authentication**
* **Firebase Firestore**
* **YouTube IFrame API**

---

## 📂 Estrutura do Projeto

```text
hortsoytreinamentos/
├── index.html          # Página inicial (Dashboard de setores e FAQ)
├── style.css           # Variáveis e estilos globais de toda a plataforma
├── app.js              # Motor principal: Rotas, Firebase, CRUD, Tema e Progresso
├── README.md           # Documentação técnica e manual do usuário
├── pages/              # Telas secundárias do sistema
│   ├── login.html      # Interface de autenticação e criação de conta corporativa
│   ├── cursos.html     # Página dinâmica que renderiza os módulos do setor selecionado
│   └── admin.html      # Painel de Gestão e exportação de relatórios
├── js/                 # Scripts específicos e isolados
│   ├── auth.js         # Lógica de validação de e-mail e persistência de login
│   └── admin.js        # Lógica de cálculo do Dashboard, cruzamento de dados e exportador Excel
└── assets/             # Arquivos estáticos
    ├── logos/          # Identidade visual (Tema Claro e Escuro)
    └── icones/         # Favicon e ícones gráficos auxiliares
