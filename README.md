# PESCARTE - Visualização de Dados de Comunidades Pesqueiras

Este projeto foi desenvolvido para o monitoramento e visualização de dados de comunidades pesqueiras, em parceria com o Projeto PESCARTE. A aplicação permite visualizar e analisar dados socioeconômicos das comunidades pesqueiras da Bacia de Campos e Espírito Santo, contribuindo para a gestão e tomada de decisão do projeto.

![Logo PESCARTE](frontend/src/assets/pescarte_logo.svg)

## Sobre o Projeto

O PESCARTE é um projeto de mitigação ambiental desenvolvido pela UENF em parceria com a Petrobras. Seu objetivo é promover, fortalecer e aperfeiçoar a pesca artesanal nas comunidades pesqueiras da região, contribuindo para a sustentabilidade socioeconômica e ambiental da atividade pesqueira.

Esta aplicação web fornece uma interface para visualização dos dados do CENSO do PEA-Pescarte, criando uma ponte entre o banco de dados e os usuários finais.

## Funcionalidades

- **Dashboard Interativo**: Visualização geral dos principais indicadores do projeto
- **Monitoramento de Comunidades**: Dados detalhados de cada comunidade pesqueira
- **Comparação entre Comunidades**: Comparação de dados entre diferentes comunidades
- **Análise Avançada**: Visualização de estatísticas gerais e tendências
- **Importação de Dados**: Upload de dados demográficos, censos e localidades via arquivos CSV
- **Cadastro de Ambientes de Pesca**: Registro e gestão de ambientes pesqueiros
- **Exportação de Relatórios**: Geração de relatórios em formato PDF

## Tecnologias Utilizadas

### Frontend
- **React.js**: Biblioteca JavaScript para construção da interface
- **Chart.js**: Biblioteca para criação de gráficos interativos
- **React Router**: Navegação entre componentes
- **Axios**: Cliente HTTP para requisições à API
- **jsPDF**: Geração de relatórios em PDF

### Backend
- **Node.js**: Ambiente de execução JavaScript
- **Express**: Framework web para criação da API RESTful
- **Multer**: Middleware para upload de arquivos
- **CSV-Parser**: Processamento de arquivos CSV
- **Swagger**: Documentação interativa da API

### Banco de Dados
- **PostgreSQL**: Sistema de gerenciamento de banco de dados relacional
- **pg**: Cliente PostgreSQL para Node.js

### DevOps & Ferramentas
- **Docker**: Containerização da aplicação
- **Docker Compose**: Orquestração de containers

## Requisitos de Sistema

- Docker e Docker Compose
- Git

## Como Iniciar o Projeto

### Clonar o Repositório

```bash
# Clonar o repositório
git clone https://github.com/ARRETdaniel/PescarteViz.git

# Navegar até o diretório do projeto
cd data-viz-project
```

### Iniciar com Docker Compose

```bash
# Construir e iniciar os containers
docker-compose up --build
```
ou
```bash
# no cache
docker-compose build --no-cache
# Iniciar a apli.
docker-compose up -d
```


**Nota para sistemas Linux**: Se você encontrar conflitos com a porta 5432 (PostgreSQL), edite o arquivo docker-compose.yml alterando o mapeamento de porta do PostgreSQL de `5432:5432` para `5435:5432`.

### Reconstruir os Containers

Se você precisa reconstruir os containers (por exemplo, após alterações significativas):

```bash
# Parar os containers
docker-compose down

# Remover containers órfãos
docker-compose down --remove-orphans

# Limpar cache do Docker (opcional)
docker system prune -a --volumes

# Reconstruir e iniciar os containers
docker-compose up --build
```

## Acessando a Aplicação

Após iniciar os containers, você pode acessar:

- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:3001/api
- **Documentação da API**: http://localhost:3001/api-docs

## Documentação do PROJETO:

- **[DB](docs/database_dictionary.md)**;
- **[API](docs/API_USAGE.md)**.

## Solução de Problemas

### Problemas com portas já em uso

Se você encontrar o erro "port is already allocated" durante a inicialização:

```bash
# Verifique quais processos estão usando a porta
sudo lsof -i :5432  # para o PostgreSQL
sudo lsof -i :3001  # para o backend
sudo lsof -i :3000  # para o frontend

# Ou altere o mapeamento de portas no arquivo docker-compose.yml
```

### Diagnosticando Problemas de Banco de Dados

Se você encontrar problemas com os dados exibidos, use o endpoint de diagnóstico:

```
http://localhost:3001/api/debug/view/comunidades_por_municipio
```

### Logs dos Containers

Para verificar os logs dos containers:

```bash
# Logs de todos os serviços
docker-compose logs -f

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
├── backend/                   # API Node.js/Express
│   ├── db/                    # Scripts de banco de dados
│   │   ├── init.sql           # Inicialização do banco de dados
│   │   └── migration.sql      # Scripts de migração
│   ├── middleware/            # Middlewares da API
│   ├── scripts/               # Scripts auxiliares
│   └── server.js              # Ponto de entrada do servidor
├── frontend/                  # Aplicação React
│   ├── public/                # Arquivos estáticos
│   ├── src/                   # Código fonte React
│   │   ├── assets/            # Imagens e recursos
│   │   ├── components/        # Componentes React
│   │   │   └── ui/            # Componentes reutilizáveis
│   │   ├── contexts/          # Contextos React
│   │   ├── hooks/             # Custom hooks
│   │   └── services/          # Serviços API
├── docs/                      # Documentação do projeto
│   └── database_dictionary.md # Dicionário do banco de dados
├── docker-compose.yml         # Configuração do Docker Compose
└── README.md                  # Este arquivo
```

## Componentes Principais

### Frontend

- **Dashboard**: Visão geral dos indicadores principais do projeto
- **CommunitiesDashboard**: Interface de navegação por comunidades pesqueiras
- **CommunityDetails**: Detalhes e estatísticas de comunidades específicas
- **CommunityComparison**: Comparação de dados entre comunidades selecionadas
- **AdvancedAnalysis**: Análises estatísticas e tendências
- **DataUploadForm**: Interface para upload de dados
- **FishingEnvironments**: Gestão de ambientes de pesca

### Backend

- **API RESTful**: Endpoints para acesso aos dados do banco
- **Serviços de Upload**: Processamento de arquivos CSV para importação de dados
- **Endpoints de Estatísticas**: Cálculo e fornecimento de estatísticas agregadas
- **Documentação Swagger**: API autodocumentada para facilitar integração

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
