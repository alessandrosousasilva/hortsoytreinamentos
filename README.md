# 🚀 Portal de Treinamentos Corporativos - JEE

Plataforma web desenvolvida para centralizar, organizar e disponibilizar os treinamentos internos do Grupo JEE.

O projeto evoluiu de uma estrutura estática para um **Software como Serviço (SaaS)** completo, utilizando banco de dados em nuvem em tempo real, autenticação corporativa de usuários e rastreamento de jornada de aprendizagem (LMS).

## ✨ Funcionalidades

* **Autenticação Segura:** Login integrado com Firebase, com trava de segurança que restringe o acesso exclusivamente para e-mails corporativos (`@hortsoy.com.br`).
* **Banco de Dados em Tempo Real:** Todo o conteúdo é gerenciado via Firebase Firestore, permitindo atualizações instantâneas em todos os dispositivos sem necessidade de recarregar a página.
* **Painel Admin (In-Place):** Administradores credenciados podem adicionar, editar e excluir módulos de treinamento diretamente na tela do curso, através de janelas modais intuitivas.
* **Rastreamento de Progresso (LMS):**
  * Integração com a **YouTube IFrame API** para auditar a visualização, contabilizando a aula como concluída apenas após o usuário assistir a pelo menos 75% do vídeo.
  * Rastreamento de leitura dos materiais de apoio.
  * Barra de progresso dinâmica calculando a porcentagem de conclusão de cada colaborador individualmente.
* **Hospedagem Leve (Arquivos em Nuvem):** Os PDFs e manuais agora são inseridos diretamente via links externos compartilhados (Google Drive, OneDrive, etc.), mantendo a plataforma livre de limites de armazenamento e custos extras.
* **Interface Adaptável:** Alternância inteligente de tema (Light/Dark Mode) que salva a preferência do usuário, e layout 100% responsivo para uso em smartphones.

## 🛠️ Tecnologias Utilizadas

* **HTML5 & CSS3:** Estruturação semântica, variáveis CSS nativas, Flexbox, Glassmorphism e responsividade (Mobile First).
* **JavaScript (Vanilla JS):** Manipulação do DOM, módulos ES6 e controle assíncrono (Async/Await).
* **Firebase Auth:** Gerenciamento de usuários, proteção de rotas e controle de sessão.
* **Firebase Firestore:** Banco de dados NoSQL baseado em documentos para CRUD de cursos.
* **YouTube IFrame API:** Controle avançado e escuta de eventos dos vídeos incorporados.

## 📂 Estrutura do Projeto

```text
hortsoytreinamentos/
├── index.html          # Página inicial (Dashboard de setores)
├── cursos.html         # Página dinâmica para exibir os módulos do setor
├── login.html          # Tela de autenticação corporativa
├── style.css           # Estilos globais e componentes visuais
├── app.js              # Lógica principal, rotas, Firebase, CRUD e LMS
├── auth.js             # Script isolado para processamento de login
└── assets/
    ├── logos/          # Logomarcas (versões colorida e branca)
    └── icones/         # Ícones gerais da interface
