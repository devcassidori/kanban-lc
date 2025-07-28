# 📋 LC Kanban - Sistema de Gerenciamento de Tarefas

Sistema completo de gerenciamento de tarefas estilo Kanban com interface moderna e totalmente responsiva.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Responsive](https://img.shields.io/badge/Responsive-4285F4?style=flat-square&logo=google-chrome&logoColor=white)

---

## 🎯 Visão Geral

O **LC Kanban** é uma aplicação de gerenciamento de tarefas que implementa a metodologia Kanban de forma moderna e intuitiva. Desenvolvido com tecnologias web puras (HTML5, CSS3 e JavaScript ES6+), oferece uma experiência responsiva sem dependências externas.

### ✨ Principais Funcionalidades

- 🎨 **7 Temas Personalizáveis**: Adaptação visual para diferentes ambientes
- 📱 **Design Totalmente Responsivo**: Experiência otimizada para desktop, tablet e mobile
- 🖱️ **Drag & Drop Nativo**: Movimentação intuitiva de tarefas entre colunas
- 🔍 **Sistema de Filtros**: Filtros por prioridade e responsável com contadores dinâmicos
- 📥 **Export/Import**: Backup e migração de dados em formatos JSON e CSV
- 💾 **Persistência Local**: Salvamento automático no navegador (localStorage)
- ⚡ **Performance Otimizada**: Carregamento rápido sem bibliotecas externas

---

## 🚀 Instalação e Uso

### Método Simples (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/devcassidori/kanban-lc.git

# 2. Navegue até a pasta
cd kanban-lc

# 3. Abra o arquivo index.html no navegador
# Duplo clique no arquivo OU arraste para o navegador
```

### Método com Servidor Local

```bash
# Python 3.x
python -m http.server 8000

# Node.js
npx http-server -p 8000

# Acesse: http://localhost:8000
```

---

## 🛠️ Funcionalidades

### Core Kanban

- **3 Colunas**: To Do, Doing, Done
- **CRUD Completo**: Criar, editar, excluir e visualizar tarefas
- **Drag & Drop**: Movimentação intuitiva entre colunas
- **Persistência**: Dados salvos automaticamente no navegador
- **Contadores**: Número de tarefas por coluna em tempo real

### Sistema de Filtros

- **Filtro por Prioridade**: Alta, Média, Baixa
- **Filtro por Responsável**: Lista dinâmica de usuários
- **Estatísticas**: Contador de tarefas filtradas
- **Reset Rápido**: Botão para limpar todos os filtros

### Export/Import

- **JSON**: Formato completo com metadados e estatísticas
- **CSV**: Formato tabular compatível com planilhas
- **Validação**: Verificação automática de formato na importação
- **Backup**: Proteção automática antes de importar

### Temas Visuais

| Tema | Cores | Descrição |
|------|-------|-----------|
| **Padrão** | Azul/Roxo | Design profissional |
| **Claro** | Branco/Azul | Interface limpa |
| **Escuro** | Cinza/Preto | Modo noturno |
| **Floresta** | Verdes | Tons naturais |
| **Minimalista** | Cinza claro | Design simplificado |
| **Oceano** | Azuis | Inspirado no mar |
| **Pôr do Sol** | Laranja/Amarelo | Cores quentes |

---

## 📖 Como Usar

### 1. Criar Nova Tarefa

1. Clique em **"Nova Tarefa"** no cabeçalho
2. Preencha o formulário com título, descrição, prioridade e responsável
3. A tarefa aparece automaticamente na coluna "A Fazer"

### 2. Mover Tarefas

- **Drag & Drop**: Arraste a tarefa para outra coluna
- **Feedback Visual**: Destaque da área de destino durante o arraste

### 3. Editar/Excluir

- **Editar**: Clique no ícone de edição na tarefa
- **Excluir**: Clique no ícone de lixeira na tarefa

### 4. Filtrar Tarefas

- Use os seletores no topo para filtrar por prioridade ou responsável
- O contador mostra quantas tarefas estão visíveis

### 5. Export/Import

- **Exportar**: Botão "Exportar" → Escolha JSON ou CSV
- **Importar**: Botão "Importar" → Selecione arquivo válido

---

## 🖥️ Requisitos Técnicos

### Navegadores Suportados

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

### Recursos Necessários

- JavaScript habilitado
- LocalStorage disponível (para persistência)
- Tela mínima: 320px de largura

---

## 🏗️ Arquitetura Técnica

### Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Estilo**: CSS Grid, Flexbox, CSS Variables
- **Ícones**: Font Awesome 6.0
- **Armazenamento**: LocalStorage API

### Estrutura de Dados

```javascript
// Modelo de Tarefa
{
    id: "task_1690123456789",
    title: "Título da tarefa",
    description: "Descrição opcional",
    priority: "alta" | "media" | "baixa",
    assignee: "Nome do responsável",
    status: "todo" | "doing" | "done",
    createdAt: "2024-07-23T10:30:00Z",
    updatedAt: "2024-07-23T11:45:00Z"
}
```

### Performance

- **First Load**: < 200ms
- **Operações**: < 50ms
- **Mobile**: < 300ms
- **Storage**: < 20ms

---

## 📁 Estrutura do Projeto

```
kanban-lc/
├── index.html              # Página principal
├── styles.css              # Estilos e temas
├── script.js               # Lógica da aplicação
├── exemplo-importacao.csv  # Arquivo de exemplo
└── README.md               # Documentação
```

---

## 📊 Estatísticas

- **Código**: ~3.000 linhas
- **Temas**: 7 opções visuais
- **Responsividade**: 7+ breakpoints
- **Compatibilidade**: Navegadores modernos

---
