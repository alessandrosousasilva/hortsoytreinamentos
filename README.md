# 🚀 JEE - Portal de Treinamentos Corporativos

Plataforma web desenvolvida para centralizar, organizar e disponibilizar os treinamentos internos do Grupo JEE.

## ✨ Funcionalidades

* **Autenticação Segura:** Acesso exclusivamente para e-mails `@hortsoy.com.br`.
* **Banco de Dados:** Todo o conteúdo é gerenciado via Firebase Firestore.
* **Painel Admin:** Administradores podem adicionar, editar e excluir treinamento diretamente na tela do curso.
* **Rastreamento de Progresso (LMS):**
  * Integração com a **YouTube IFrame API** para auditar a visualização e contabilizando a aula como concluída.
  * Rastreamento de leitura dos materiais de apoio.
  * Barra de progresso calculando a porcentagem.
* **Hospedagem Leve (Nuvem):** Os PDFs e Vídeos agora são inseridos diretamente via links externos compartilhados (Google Drive, OneDrive, etc.).
* **Interface Adaptável:** Alternância de tema (Light/Dark).

---

## 📖 Manual do Administrador

### ⚠️ Passo a Passo para Adicionar um Novo Curso

1. **Autenticação:** Faça login na plataforma utilizando a conta de Administrador.
2. **Navegação:** Na página inicial, clique no Setor onde deseja inserir o treinamento (ex: "Logística e Estoque").
3. **Painel de Edição:** No topo da lista de cursos, clique no botão verde **"+ Adicionar Treinamento"** (este botão só é visível para administradores).
4. **Preenchimento do Formulário:**
   * **Título do Módulo:** O nome principal do agrupamento (Ex: *Módulo 1 - Introdução*).
   * **Vídeos (Opcional):** Preencha o nome da aula e o link do vídeo (veja as regras de links abaixo).
   * **PDFs (Opcional):** Preencha o nome do arquivo e o link de acesso.
5. **Salvar:** Clique em "Salvar Treinamento". O banco de dados (Firestore) será atualizado.

----

### ⚠️ Regras para Links Externos (Vídeos e PDFs)

Para manter a plataforma leve e sem custos de servidor, os arquivos pesados são gerenciados externamente. Siga estas regras ao preencher os formulários:

#### 🎥 Para Vídeos
* **Vídeos do YouTube:** Você pode colar qualquer link padrão do YouTube. O sistema fará a conversão automática para o formato correto.
* **Vídeos Internos (OneDrive / SharePoint):** Não use o botão de "Compartilhar" comum. 
  1. Abra o vídeo no OneDrive.
  2. Clique em **"Compartilhar -> Código de inserção"**.
  3. No código gerado (ex: `<iframe src="https://...">`), copie **apenas a URL** que está entre aspas `src`.
  4. Cole essa URL no portal.

#### 📄 Para PDFs
* Hospede o PDF no **Google Drive** ou no **OneDrive**.
* Gere um link de compartilhamento que esteja como **"Qualquer pessoa com o link pode ver"** (ou restrito apenas para a organização).
* Cole o link gerado".

---
---
## 🛠️ Tecnologias Utilizadas

* **HTML5 & CSS3**
* **JavaScript (Vanilla JS)** 
* **Firebase Auth**
* **Firebase Firestore**
* **YouTube IFrame API**

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
