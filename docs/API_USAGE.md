# Guia de Uso da API PESCARTE

## Introdução

Este documento explica como utilizar a documentação interativa Swagger para explorar e testar a API do projeto PESCARTE. A API fornece acesso a dados sobre comunidades pesqueiras, incluindo dados demográficos, estatísticas e análises avançadas que são utilizados nas diversas seções do sistema.

## Acessando a Documentação

A documentação Swagger pode ser acessada em:
- **Ambiente de desenvolvimento**: http://localhost:3001/api-docs
- **Ambiente de produção**: https://api.pescarte.org.br/api-docs

## Autenticação

Alguns endpoints podem requerer autenticação:
1. Clique no botão "Authorize" no topo da página do Swagger
2. Insira seu token de autenticação no formato `Bearer {seu-token}`
3. Clique em "Authorize" para aplicar as credenciais em todas as requisições subsequentes

## Explorando a API

### 1. Estrutura da Documentação

A documentação está organizada por tags que agrupam endpoints relacionados:
- **Municípios**: Endpoints para consulta de municípios
- **Comunidades**: Endpoints para consulta de comunidades pesqueiras
- **Estatísticas**: Endpoints para análises estatísticas e análise de dados
- **Upload de Dados**: Endpoints para importação de dados via CSV
- **Ambientes de Pesca**: Endpoints para gerenciamento de ambientes pesqueiros
- **Exportação**: Endpoints para exportação de dados em diferentes formatos
- **Analytics**: Endpoints para análises avançadas, clustering, regressões e previsões

### 2. Testando Endpoints

1. Clique em um endpoint para expandir seus detalhes
2. Revise os parâmetros necessários e o formato da resposta esperada
3. Clique no botão "Try it out"
4. Preencha os campos necessários
5. Clique em "Execute" para enviar a requisição
6. Observe a resposta retornada e o código de status

### 3. Endpoints por Seção da Aplicação

#### Dashboard
- `GET /api/comunidades/stats`: Estatísticas gerais para exibição no dashboard
- `GET /api/communities/data`: Dados completos das comunidades para visualizações
- `GET /api/municipios`: Lista de municípios para filtros e seleção

#### Comunidades
- `GET /api/comunidades/summary/municipio`: Resumo das comunidades agrupadas por município
- `GET /api/comunidades/{municipioId}`: Comunidades de um município específico
- `GET /api/comunidades/details/{id}`: Detalhes completos de uma comunidade

#### Comparar Comunidades
- `GET /api/communities/demographics/{ids}`: Dados demográficos de múltiplas comunidades
- `GET /api/analytics/fishing_types/{ids}`: Tipos de pesca para comunidades selecionadas
- `GET /api/comunidades/timeseries/{id}`: Séries temporais para análises históricas

#### Análise Avançada
- `GET /api/analytics/clusters`: Análise de clusters de comunidades
- `GET /api/analytics/statistics`: Estatísticas avançadas e análises
- `GET /api/analytics/predictions`: Análises preditivas baseadas em dados históricos
- `GET /api/analytics/regression`: Análises de regressão para tendências

### 4. Exemplos de Uso Comum

#### Listar todos os municípios
- Endpoint: `GET /api/municipios`
- Não requer parâmetros
- Retorna uma lista completa de municípios ordenados alfabeticamente

#### Listar comunidades de um município
- Endpoint: `GET /api/comunidades/{municipioId}`
- Substitua `{municipioId}` pelo ID do município desejado
- Retorna todas as comunidades pertencentes ao município especificado

#### Obter detalhes de uma comunidade
- Endpoint: `GET /api/comunidades/details/{id}`
- Substitua `{id}` pelo ID da comunidade desejada
- Retorna informações detalhadas sobre uma comunidade específica

#### Importar dados de censo
- Endpoint: `POST /api/upload/csv/census`
- Prepare um arquivo CSV seguindo o formato especificado
- Informe o ano de referência
- Envie o arquivo através do formulário

#### Obter análise de clusters
- Endpoint: `GET /api/analytics/clusters?includeCoordinates=true`
- O parâmetro `includeCoordinates` permite incluir dados geográficos
- Retorna análise de agrupamentos das comunidades baseada no percentual de pescadores

#### Atualizar coordenadas geográficas
- Endpoint: `PUT /api/comunidades/{id}/coordinates`
- Substitua `{id}` pelo ID da comunidade
- Forneça valores de latitude e longitude no corpo da requisição
- Utilizado na interface administrativa de coordenadas

## Formatos de Dados

### Importação de Dados Censitários (CSV)

O formato esperado para arquivos CSV de censo é:
```
comunidade_id,pessoas,pescadores,familias
1,320,95,80
2,450,120,110
```

Campos obrigatórios:
- `comunidade_id`: Identificador numérico da comunidade
- `pessoas`: Total de pessoas na comunidade
- `pescadores`: Número de pescadores na comunidade
- `familias`: Número de famílias na comunidade

### Dados de Clusters

Os dados de clusters são retornados com a seguinte estrutura:
- `communityData`: Lista de comunidades com seus atributos e cluster atribuído
- `clusterSummary`: Contagem de comunidades por cluster
- `clusterAnalysis`: Estatísticas agregadas por cluster (população, pescadores, percentual)

## Interpretando os Dados

### Estatísticas Gerais
Os endpoints de estatísticas fornecem métricas importantes como:
- Percentual médio de pescadores nas comunidades
- Comunidades com maior e menor dependência da pesca
- Distribuição populacional por região
- Tamanho médio das famílias
- Relações entre variáveis demográficas

### Análise de Clusters
A análise de clusters categoriza as comunidades em grupos:
- **Alta Dependência**: Acima de 45% de pescadores
- **Dependência Moderada**: Entre 35% e 45% de pescadores
- **Baixa Dependência**: Abaixo de 35% de pescadores

### Dados Temporais
Para análises de tendências, utilize o endpoint de séries temporais que retorna dados históricos organizados por ano, permitindo visualizar a evolução das comunidades ao longo do tempo.

## Integração com o Frontend

A API é utilizada pelo frontend através de várias páginas:

### Dashboard
- Visão geral das estatísticas do projeto
- Mapa interativo de comunidades
- Acesso rápido por município

### Comunidades
- Lista de comunidades filtráveis por município
- Estatísticas detalhadas por comunidade
- Visualizações gráficas dos dados

### Comparar Comunidades
- Seleção de até 5 comunidades para comparação
- Gráficos comparativos de população, pescadores e percentuais
- Análise de tipos de pesca e dados demográficos

### Análise Avançada
- Visualização de clusters de comunidades
- Mapa interativo com filtros por tipo de cluster
- Tabelas detalhadas e exportáveis
- Análises estatísticas e visualizações complexas

## Versionamento

A API suporta versionamento através do cabeçalho HTTP `api-version`. Se não especificado, a versão padrão (1) será utilizada.

## Resolução de Problemas

### Erros Comuns e Soluções

- **404 Not Found**: O recurso solicitado não existe. Verifique o ID informado.
- **500 Server Error**: Erro no servidor. Consulte os logs para mais detalhes.
- **400 Bad Request**: Verifique os parâmetros enviados na requisição.
- **401 Unauthorized**: Autenticação necessária ou token inválido.
- **403 Forbidden**: Sem permissão para acessar este recurso.

### Depuração

Para fins de desenvolvimento, existem endpoints de debug disponíveis:
- `GET /api/debug/view/comunidades_por_municipio`: Verifica o estado da view de comunidades por município

### Contato para Suporte

Em caso de problemas técnicos, entre em contato:
- Email: suporte.tecnico@pescarte.org.br
- Website: https://pescarte.org.br
