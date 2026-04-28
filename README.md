# 🚀 JEE - Portal de Treinamentos Corporativos

Plataforma web para gestão de treinamentos internos do Grupo JEE (HortSoy).

## ✨ Funcionalidades Principais

* **🔒 Acesso Corporativo:** Autenticação restrita a e-mails `@hortsoy.com.br`.
* **📊 Painel de Gestão:** Dashboard com progresso de usuários (Global e Setor) e exportação para CSV.
* **☁️ Serverless:** Banco de dados rápido e em tempo real com **Firebase Firestore**.
* **✏️ Gestão In-Place:** Adicione, edite ou exclua módulos e aulas direto na interface de uso.
* **🧠 Links Inteligentes:** Aceita links diretos ou códigos sujos (`<iframe>` do SharePoint/OneDrive) e higieniza a URL automaticamente.
* **📈 LMS Integrado:** Auditoria de retenção (só contabiliza a aula após 75% do vídeo assistido) e barra de progresso.
* **🌙 UI Adaptável:** Alternância para Modo Escuro salva na memória do navegador.

---

## 📖 Guia Rápido do Administrador

### Criar Módulos
1. Logado como Admin, acesse um Setor (ex: Logística).
2. Clique no botão verde **"+ Adicionar Treinamento"**.
3. Defina o Título e clique em **+ Adicionar Vídeo** ou **+ Adicionar PDF** quantas vezes for necessário.
4. Clique em Salvar.

### Regras de Inserção de Links
* **🎥 Vídeos (YouTube):** Cole o link padrão. O sistema converte para embed sozinho.
* **🎥 Vídeos Internos:** No SharePoint/OneDrive, clique em *Compartilhar > Código de Inserção*. Cole o código `<iframe...` inteiro no sistema.
* **📄 PDFs:** No SharePoint/OneDrive, copie o link de compartilhamento comum e cole no sistema.

*(Nota: O extrator inteligente da plataforma limpa qualquer tag HTML indesejada durante o salvamento).*

---

## 🛠️ Stack Tecnológico

* HTML5, CSS3, Vanilla JS (ES6 Modules)
* Firebase (Authentication & Firestore)
* YouTube IFrame API

---

## 📂 Estrutura de Pastas

```text
hortsoytreinamentos/
├── index.html          # Home (Dashboard de setores)
├── style.css           # Variáveis globais e design
├── app.js              # Motor principal (Rotas, CRUD, LMS, UX)
├── README.md           
├── pages/              
│   ├── login.html      # Autenticação restrita
│   ├── cursos.html     # Renderizador dinâmico de módulos
│   └── admin.html      # Painel de gestão e relatórios
├── js/                 
│   ├── auth.js         # Lógica de registro e recuperação
│   └── admin.js        # Motor do dashboard e exportação Excel
└── assets/             # Identidade visual (Logos e ícones)
