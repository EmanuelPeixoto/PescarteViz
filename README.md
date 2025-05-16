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
- **Análise Avançada**: Visualização de estatísticas gerais, clusters e tendências

## Tecnologias Utilizadas

### Frontend
- **React.js**: Biblioteca JavaScript para construção da interface
- **Chart.js**: Biblioteca para criação de gráficos interativos
- **React Router**: Navegação entre componentes
- **Axios**: Cliente HTTP para requisições à API
- **Leaflet**: Biblioteca para mapas interativos
- **React Context API**: Gerenciamento de estado global

### Backend
- **Node.js**: Ambiente de execução JavaScript
- **Express**: Framework web para criação da API RESTful
- **Multer**: Middleware para upload de arquivos
- **CSV-Parser**: Processamento de arquivos CSV
- **Swagger**: Documentação interativa da API
- **Winston**: Sistema de logging

### Banco de Dados
- **PostgreSQL**: Sistema de gerenciamento de banco de dados relacional
- **pg**: Cliente PostgreSQL para Node.js

### DevOps & Ferramentas
- **Docker**: Containerização da aplicação
- **Docker Compose**: Orquestração de containers
- **GitHub Actions**: CI/CD para automação de testes e deployment

## Requisitos de Sistema

- Docker e Docker Compose
- Git
- Node.js 16+ e npm (para desenvolvimento local)
- Navegador moderno (Chrome, Firefox, Edge, Safari)

## Como Iniciar o Projeto

### Clonar o Repositório

```bash
# Clonar o repositório
git clone https://github.com/ARRETdaniel/PescarteViz.git

# Navegar até o diretório do projeto
cd data-viz-project
```

### Configuração de Ambiente

Por padrão, o projeto está configurado para rodar completamente com Docker Compose. Se necessário, você pode ajustar as variáveis de ambiente nos arquivos:
- `.env` (na raiz do projeto) - variáveis globais
- `backend/.env` - configurações específicas do backend
- `frontend/.env` - configurações específicas do frontend

### Iniciar com Docker Compose

```bash
# Construir e iniciar os containers
docker-compose up --build
```

Para execução em segundo plano (modo detached):
```bash
# Construir sem usar cache
docker-compose build --no-cache

# Iniciar a aplicação em segundo plano
docker-compose up -d
```

**Nota para sistemas Linux**: Se você encontrar conflitos com a porta 5432 (PostgreSQL), edite o arquivo docker-compose.yml alterando o mapeamento de porta do PostgreSQL de `5432:5432` para `5435:5432`.

### Reconstruir os Containers

Se você precisar reconstruir os containers (por exemplo, após alterações significativas):

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

### Para Desenvolvimento Local (sem Docker)

#### Backend
```bash
cd backend
npm install
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## Acessando a Aplicação

Após iniciar os containers, você pode acessar:

- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:3001/api
- **Documentação da API**: http://localhost:3001/api-docs
- **Diagnóstico do Banco**: http://localhost:3001/api/debug/view/comunidades_por_municipio

## Funcionalidades por Seção

### Dashboard
- Visão geral de estatísticas do projeto
- Mapa interativo das comunidades
- Gráficos de indicadores principais
- Filtros rápidos por município e região

### Comunidades
- Lista completa de comunidades pesqueiras
- Filtragem por município, estado e tipo
- Visualização detalhada por comunidade
- Exportação de dados em CSV

### Comparar Comunidades
- Seleção de até 5 comunidades para comparação simultânea
- Análise lado a lado de indicadores demográficos
- Comparação de dados de pesca e embarcações
- Gráficos comparativos dinâmicos

### Análise Avançada
- Visualização de clusters de comunidades
- Análise estatística avançada
- Tendências temporais e previsões
- Mapa de calor por indicadores selecionados
- Exportação de relatórios customizados

## Documentação do Projeto

- **[Dicionário do Banco de Dados](docs/database_dictionary.md)**: Estrutura do banco de dados, tabelas, relações e índices
- **[Guia de Uso da API](docs/API_USAGE.md)**: Documentação dos endpoints da API, parâmetros e exemplos de uso

## Solução de Problemas

### Problemas com portas já em uso

Se você encontrar o erro "port is already allocated" durante a inicialização:

```bash
# Verifique quais processos estão usando a porta
sudo lsof -i :5432  # para o PostgreSQL
sudo lsof -i :3001  # para o backend
sudo lsof -i :3000  # para o frontend

# Encerre o processo que está usando a porta
kill -9 <PID>

# Ou altere o mapeamento de portas no arquivo docker-compose.yml
```

### Diagnosticando Problemas de Banco de Dados

Se você encontrar problemas com os dados exibidos:

1. Verifique se o banco de dados foi inicializado corretamente:
   ```bash
   docker-compose logs postgres
   ```

2. Use o endpoint de diagnóstico para verificar se as views estão funcionando:
   ```
   http://localhost:3001/api/debug/view/comunidades_por_municipio
   ```

3. Conecte-se diretamente ao banco de dados para testes:
   ```bash
   docker exec -it data-viz-db psql -U admin -d datavizdb
   ```

### Problemas na Importação de Dados

Se você encontrar problemas ao importar arquivos CSV:

1. Verifique o formato do arquivo CSV (deve usar vírgula como separador)
2. Confirme se as colunas do arquivo correspondem às esperadas pelo endpoint
3. Verifique os logs do servidor para mensagens de erro detalhadas:
   ```bash
   docker-compose logs backend
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
│   ├── controllers/           # Controladores da API
│   ├── db/                    # Scripts de banco de dados
│   │   ├── init.sql           # Inicialização do banco de dados
│   │   └── migration.sql      # Scripts de migração
│   ├── middleware/            # Middlewares da API
│   ├── models/                # Modelos de dados
│   ├── routes/                # Rotas da API
│   ├── services/              # Serviços de negócio
│   ├── utils/                 # Funções utilitárias
│   ├── Dockerfile             # Configuração do container
│   └── server.js              # Ponto de entrada do servidor
├── frontend/                  # Aplicação React
│   ├── public/                # Arquivos estáticos
│   ├── src/                   # Código fonte React
│   │   ├── assets/            # Imagens e recursos estáticos
│   │   ├── components/        # Componentes React
│   │   │   ├── admin/         # Componentes administrativos
│   │   │   ├── charts/        # Componentes de gráficos
│   │   │   ├── maps/          # Componentes de mapas
│   │   │   └── ui/            # Componentes de interface
│   │   ├── contexts/          # Contextos React
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # Serviços de API
│   │   ├── styles/            # Arquivos CSS/SCSS
│   │   ├── utils/             # Funções utilitárias
│   │   └── App.js             # Componente principal
│   └── Dockerfile             # Configuração do container
├── docs/                      # Documentação do projeto
│   ├── api/                   # Documentação da API
│   ├── database_dictionary.md # Dicionário do banco de dados
│   └── API_USAGE.md           # Guia de uso da API
├── docker-compose.yml         # Configuração do Docker Compose
├── .env.example               # Exemplo de variáveis de ambiente
└── README.md                  # Este arquivo
```

## Componentes Principais

### Frontend

- **Dashboard**: Visão geral dos indicadores principais do projeto
- **CommunitiesDashboard**: Interface de navegação por comunidades pesqueiras
- **CommunityDetails**: Detalhes e estatísticas de comunidades específicas
- **CommunityComparison**: Comparação de dados entre comunidades selecionadas
- **AdvancedAnalysis**: Análises estatísticas e tendências

### Backend

- **API RESTful**: Endpoints para acesso aos dados do banco
- **Endpoints de Estatísticas**: Cálculo e fornecimento de estatísticas agregadas
- **Sistema de Clustering**: Análise de agrupamentos de comunidades por características
- **Documentação Swagger**: API autodocumentada para facilitar integração

## Roadmap de Desenvolvimento

### Recursos Planejados
- Autenticação e controle de acesso baseado em funções (RBAC)
- Exportação de dados em múltiplos formatos (CSV, XLSX, JSON)
- Integração com fontes externas de dados ambientais
- API GraphQL para consultas mais flexíveis
- Versão móvel da aplicação
- Internacionalização (i18n) para suporte a múltiplos idiomas

## Contribuição

Para contribuir com este projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Padrões de Código

Este projeto segue os seguintes padrões:
- **ESLint**: Para qualidade de código JavaScript
- **Prettier**: Para formatação consistente
- **Conventional Commits**: Para mensagens de commit padronizadas

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato e Suporte

- **Projeto PESCARTE**: [Website Oficial](https://pescarte.org.br/)
- **Email de Suporte**: suporte@pescarte.org.br
- **Reportar Bugs**: Por favor use a seção de Issues do GitHub

---

Desenvolvido por Daniel Terra Gomes - UENF - 2025
