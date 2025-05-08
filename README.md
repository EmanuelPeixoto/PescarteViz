# PESCARTE - Visualização de Dados de Comunidades Pesqueiras

Este projeto foi desenvolvido para o monitoramento e visualização de dados de comunidades pesqueiras, em parceria com o Projeto PESCARTE. A aplicação permite visualizar e analisar dados socioeconômicos das comunidades pesqueiras da Bacia de Campos e Espírito Santo, contribuindo para a gestão e tomada de decisão do projeto.

![Logo PESCARTE](https://pescarte.org.br/wp-content/uploads/2021/04/logo-pescarte.svg)

## Sobre o Projeto

O PESCARTE é um projeto de mitigação ambiental desenvolvido pela UENF em parceria com a Petrobras. Seu objetivo é promover, fortalecer e aperfeiçoar a pesca artesanal nas comunidades pesqueiras da região, contribuindo para a sustentabilidade socioeconômica e ambiental da atividade pesqueira.

Esta aplicação web fornece uma interface para visualização dos dados do CENSO do PEA-Pescarte, criando uma ponte entre o banco de dados e os usuários finais.

## Funcionalidades

- **Dashboard Interativo**: Visualização geral dos principais indicadores do projeto
- **Monitoramento de Comunidades**: Dados detalhados de cada comunidade pesqueira
- **Comparação entre Comunidades**: Comparação de dados entre diferentes comunidades
- **Importação de Dados**: Upload de dados demográficos via arquivos CSV
- **Cadastro de Ambientes de Pesca**: Registro e gestão de ambientes pesqueiros
- **Exportação de Relatórios**: Geração de relatórios em formato Excel

## Tecnologias Utilizadas

### Frontend
- **React.js**: Biblioteca JavaScript para construção da interface
- **Chart.js**: Biblioteca para criação de gráficos interativos
- **React Router**: Navegação entre componentes
- **Axios**: Cliente HTTP para requisições à API

### Backend
- **Node.js**: Ambiente de execução JavaScript
- **Express**: Framework web para criação da API RESTful
- **Multer**: Middleware para upload de arquivos
- **XLSX**: Biblioteca para geração de arquivos Excel
- **CSV-Parser**: Processamento de arquivos CSV

### Banco de Dados
- **PostgreSQL**: Sistema de gerenciamento de banco de dados relacional
- **pg**: Cliente PostgreSQL para Node.js

### DevOps & Ferramentas
- **Docker**: Containerização da aplicação
- **Docker Compose**: Orquestração de containers
- **Swagger**: Documentação da API

## Requisitos de Sistema

- Docker e Docker Compose
- Git

## Como Iniciar o Projeto

### Clonar o Repositório

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/data-viz-project.git

# Navegar até o diretório do projeto
cd data-viz-project
```

### Configuração de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=pescarte_data
POSTGRES_HOST=postgres

# Backend Configuration
BACKEND_PORT=3001

# Frontend Configuration
FRONTEND_PORT=3000
```

### Iniciar com Docker Compose

```bash
# Construir e iniciar os containers
docker-compose up --build
```

### Reconstruir os Containers

Se você precisa reconstruir os containers (por exemplo, após alterações significativas):

```bash
# Parar os containers
docker-compose down

# Remover o volume do PostgreSQL para limpar dados antigos
docker volume rm data-viz-project_postgres_data

# Reconstruir e iniciar os containers
docker-compose up --build
```

## Acessando a Aplicação

Após iniciar os containers, você pode acessar:

- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:3001/api
- **Documentação da API**: http://localhost:3001/api-docs

## Solução de Problemas

### Diagnosticando Problemas de Banco de Dados

Se você encontrar problemas com os dados exibidos, use o endpoint de diagnóstico:

```
http://localhost:3001/api/debug/view/comunidades_por_municipio
```

### Logs dos Containers

Para verificar os logs dos containers:

```bash
# Logs do frontend
docker-compose logs -f frontend

# Logs do backend
docker-compose logs -f backend

# Logs do PostgreSQL
docker-compose logs -f postgres
```

## Estrutura do Projeto

```
data-viz-project/
├── backend/                # API Node.js/Express
│   ├── db/                 # Scripts de banco de dados
│   ├── routes/             # Rotas da API
│   └── server.js           # Ponto de entrada do servidor
├── frontend/               # Aplicação React
│   ├── public/             # Arquivos estáticos
│   ├── src/                # Código fonte React
│   │   ├── assets/         # Imagens e recursos
│   │   ├── components/     # Componentes React
│   │   └── services/       # Serviços API
├── docker-compose.yml      # Configuração do Docker Compose
└── README.md               # Este arquivo
```

## Contribuição

Para contribuir com este projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

Projeto PESCARTE - [website](https://pescarte.org.br/)

---

Desenvolvido por Daniel Terra Gomes - UENF - 2025
