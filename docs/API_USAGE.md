# Guia de Uso da API PESCARTE

## Introdução

Este documento explica como utilizar a documentação interativa Swagger para explorar e testar a API do projeto PESCARTE.

## Acessando a Documentação

A documentação Swagger pode ser acessada em:
- **Ambiente de desenvolvimento**: http://localhost:3001/api-docs
- **Ambiente de produção**: https://api.pescarte.org.br/api-docs

## Explorando a API

### 1. Estrutura da Documentação

A documentação está organizada por tags que agrupam endpoints relacionados:
- **Municípios**: Endpoints para consulta de municípios
- **Comunidades**: Endpoints para consulta de comunidades pesqueiras
- **Estatísticas**: Endpoints para análises estatísticas e análise de dados
- **Upload de Dados**: Endpoints para importação de dados via CSV
- **Ambientes de Pesca**: Endpoints para gerenciamento de ambientes pesqueiros
- **Exportação**: Endpoints para exportação de dados em diferentes formatos

### 2. Testando Endpoints

1. Clique em um endpoint para expandir seus detalhes
2. Revise os parâmetros necessários e o formato da resposta esperada
3. Clique no botão "Try it out"
4. Preencha os campos necessários
5. Clique em "Execute" para enviar a requisição
6. Observe a resposta retornada e o código de status

### 3. Exemplos de Uso Comum

#### Listar todos os municípios
- Endpoint: `GET /api/municipios`
- Não requer parâmetros

#### Listar comunidades de um município
- Endpoint: `GET /api/comunidades/{municipioId}`
- Substitua `{municipioId}` pelo ID do município desejado

#### Obter detalhes de uma comunidade
- Endpoint: `GET /api/comunidades/details/{id}`
- Substitua `{id}` pelo ID da comunidade desejada

#### Importar dados de censo
- Endpoint: `POST /api/upload/csv/census`
- Prepare um arquivo CSV seguindo o formato especificado
- Informe o ano de referência
- Envie o arquivo através do formulário

## Interpretando os Dados

### Estatísticas Gerais
Os endpoints de estatísticas fornecem métricas importantes como:
- Percentual médio de pescadores nas comunidades
- Comunidades com maior e menor dependência da pesca
- Distribuição populacional
- Tamanho médio das famílias

### Dados Temporais
Para análises de tendências, utilize o endpoint de séries temporais que retorna dados históricos organizados por ano.

## Resolução de Problemas

### Erros Comuns e Soluções

- **404 Not Found**: O recurso solicitado não existe. Verifique o ID informado.
- **500 Server Error**: Erro no servidor. Consulte os logs para mais detalhes.
- **400 Bad Request**: Verifique os parâmetros enviados na requisição.

### Contato para Suporte

Em caso de problemas técnicos, entre em contato:
- Email: suporte.tecnico@pescarte.org.br
