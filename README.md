# 🚀 Portal de Treinamentos Corporativos - HortSoy

Plataforma web desenvolvida para centralizar, organizar e disponibilizar os treinamentos internos do Grupo HortSoy.

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Semântica e estruturação em página única e página de template (`index.html` e `cursos.html`).
* **CSS3:**
* **JavaScript (Vanilla):** 
* **JSON:** Banco de dados estático para armazenamento de todo o conteúdo da plataforma.

## 📂 Estrutura do Projeto

```text
hortsoytreinamentos/
├── index.html          # Página inicial com o grid de setores
├── cursos.html         # Página de template para exibir os módulos do setor
├── style.css           # Estilos globais e variáveis de tema
├── app.js              # Lógica de renderização, busca e interação
├── assets/
│   ├── logos/          # Logomarcas (versão colorida e branca)
│   ├── icones/         # Ícones da interface
│   └── pdfs/           # Manuais e apostilas organizados por setor
└── data/
    └── cursos.json     # Arquivo de dados que alimenta a plataforma
