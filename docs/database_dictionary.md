# Dicionário de Dados do PESCARTE

## Introdução

Este documento descreve a estrutura do banco de dados utilizado pelo sistema de visualização de dados do projeto PESCARTE, que monitora comunidades pesqueiras na Bacia de Campos e Espírito Santo. O banco de dados foi projetado para armazenar informações sobre municípios, comunidades pesqueiras, censos populacionais, demografia e ambientes de pesca.

## Tabelas Principais

### municipios
Armazena informações sobre os municípios onde estão localizadas as comunidades pesqueiras.

| Coluna | Tipo | Descrição | Restrições |
|--------|------|-------------|-------------|
| id | SERIAL | Identificador único | CHAVE PRIMÁRIA |
| nome | VARCHAR(100) | Nome do município | NOT NULL |
| estado | VARCHAR(2) | Sigla do estado (ex: RJ, ES) | NOT NULL |
| codigo_ibge | VARCHAR(7) | Código IBGE do município | UNIQUE |
| regiao | VARCHAR(50) | Nome da região | |
| area_km2 | DECIMAL(10,2) | Área do município em km² | |
| created_at | TIMESTAMP | Data e hora de criação do registro | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Data e hora da última atualização | DEFAULT CURRENT_TIMESTAMP |

### comunidades
Armazena informações sobre as comunidades pesqueiras.

| Coluna | Tipo | Descrição | Restrições |
|--------|------|-------------|-------------|
| id | SERIAL | Identificador único | CHAVE PRIMÁRIA |
| nome | VARCHAR(100) | Nome da comunidade | NOT NULL |
| municipio_id | INTEGER | Chave estrangeira para municípios | NOT NULL, REFERENCES municipios(id) |
| tipo | VARCHAR(50) | Tipo da comunidade | |
| latitude | DECIMAL(10,8) | Latitude geográfica | |
| longitude | DECIMAL(11,8) | Longitude geográfica | |
| data_source_id | INTEGER | Referência à fonte dos dados | REFERENCES data_sources(id) |
| created_at | TIMESTAMP | Data e hora de criação do registro | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Data e hora da última atualização | DEFAULT CURRENT_TIMESTAMP |

### censo_comunidade
Armazena dados dos censos realizados nas comunidades pesqueiras ao longo do tempo.

| Coluna | Tipo | Descrição | Restrições |
|--------|------|-------------|-------------|
| id | SERIAL | Identificador único | CHAVE PRIMÁRIA |
| comunidade_id | INTEGER | Identificador da comunidade | NOT NULL, REFERENCES comunidades(id) |
| ano_referencia | INTEGER | Ano de realização do censo | NOT NULL |
| pessoas | INTEGER | Número total de pessoas | NOT NULL |
| familias | INTEGER | Número total de famílias | NOT NULL |
| pescadores | INTEGER | Número total de pescadores | NOT NULL |
| data_source_id | INTEGER | Referência à fonte dos dados | REFERENCES data_sources(id) |
| created_at | TIMESTAMP | Data e hora de criação do registro | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Data e hora da última atualização | DEFAULT CURRENT_TIMESTAMP |

### localidades
Armazena as localidades (bairros/distritos) que pertencem a uma comunidade.

| Coluna | Tipo | Descrição | Restrições |
|--------|------|-------------|-------------|
| id | SERIAL | Identificador único | CHAVE PRIMÁRIA |
| comunidade_id | INTEGER | Identificador da comunidade | NOT NULL, REFERENCES comunidades(id) |
| nome | VARCHAR(100) | Nome da localidade | NOT NULL |
| descricao | TEXT | Descrição da localidade | |
| created_at | TIMESTAMP | Data e hora de criação do registro | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Data e hora da última atualização | DEFAULT CURRENT_TIMESTAMP |

### demograficos
Armazena dados demográficos detalhados das comunidades.

| Coluna | Tipo | Descrição | Restrições |
|--------|------|-------------|-------------|
| id | SERIAL | Identificador único | CHAVE PRIMÁRIA |
| comunidade_id | INTEGER | Identificador da comunidade | REFERENCES comunidades(id) |
| ano_referencia | INTEGER | Ano de referência dos dados | NOT NULL |
| municipio_id | INTEGER | Identificador do município | REFERENCES municipios(id) |
| categoria | VARCHAR(50) | Categoria do dado (ex: "genero", "faixa_etaria") | NOT NULL |
| subcategoria | VARCHAR(50) | Subcategoria (ex: "Masculino", "18-25") | NOT NULL |
| valor | DECIMAL(10,2) | Valor numérico | NOT NULL |
| tipo_valor | VARCHAR(20) | Tipo do valor (ex: "percentual", "contagem") | DEFAULT 'percentual' |
| faixa_etaria | VARCHAR(20) | Faixa etária | |
| genero | VARCHAR(20) | Gênero | |
| cor | VARCHAR(30) | Raça/Etnia | |
| profissao | VARCHAR(100) | Profissão/ocupação | |
| renda_mensal | DECIMAL(10,2) | Renda mensal média | |
| quantidade | INTEGER | Número de pessoas nesta categoria | |
| created_at | TIMESTAMP | Data e hora de criação do registro | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Data e hora da última atualização | DEFAULT CURRENT_TIMESTAMP |

### ambiente_pesca
Armazena informações sobre os ambientes de pesca.

| Coluna | Tipo | Descrição | Restrições |
|--------|------|-------------|-------------|
| id | SERIAL | Identificador único | CHAVE PRIMÁRIA |
| nome | VARCHAR(100) | Nome do ambiente de pesca | NOT NULL |
| tipo | VARCHAR(50) | Tipo do ambiente (mar, rio, lagoa, etc) | NOT NULL |
| municipio_id | INTEGER | Identificador do município | REFERENCES municipios(id) |
| descricao | TEXT | Descrição do ambiente | |
| area_km2 | DECIMAL(10,2) | Área do ambiente em km² | |
| created_at | TIMESTAMP | Data e hora de criação do registro | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Data e hora da última atualização | DEFAULT CURRENT_TIMESTAMP |

### atividade_pesca
Armazena dados sobre as atividades de pesca nas comunidades.

| Coluna | Tipo | Descrição | Restrições |
|--------|------|-------------|-------------|
| id | SERIAL | Identificador único | CHAVE PRIMÁRIA |
| ano_referencia | INTEGER | Ano de referência | NOT NULL |
| comunidade_id | INTEGER | Identificador da comunidade | REFERENCES comunidades(id) |
| ambiente_id | INTEGER | Identificador do ambiente | REFERENCES ambiente_pesca(id) |
| especie | VARCHAR(100) | Espécie pescada | |
| petrecho | VARCHAR(100) | Equipamento de pesca utilizado | |
| periodo_inicio | DATE | Data de início da atividade | |
| periodo_fim | DATE | Data de término da atividade | |
| producao_kg | DECIMAL(10,2) | Produção em quilogramas | |
| valor_medio_kg | DECIMAL(10,2) | Valor médio por quilograma | |
| data_source_id | INTEGER | Referência à fonte dos dados | REFERENCES data_sources(id) |
| created_at | TIMESTAMP | Data e hora de criação do registro | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Data e hora da última atualização | DEFAULT CURRENT_TIMESTAMP |

### embarcacoes
Armazena informações sobre as embarcações utilizadas nas comunidades.

| Coluna | Tipo | Descrição | Restrições |
|--------|------|-------------|-------------|
| id | SERIAL | Identificador único | CHAVE PRIMÁRIA |
| ano_referencia | INTEGER | Ano de referência | NOT NULL |
| municipio_id | INTEGER | Identificador do município | REFERENCES municipios(id) |
| comunidade_id | INTEGER | Identificador da comunidade | REFERENCES comunidades(id) |
| tamanho | VARCHAR(50) | Tamanho da embarcação | NOT NULL |
| material | VARCHAR(50) | Material de fabricação | |
| propulsao | VARCHAR(50) | Tipo de propulsão | |
| quantidade | INTEGER | Quantidade | NOT NULL |
| capacidade_media | DECIMAL(10,2) | Capacidade média | |
| data_source_id | INTEGER | Referência à fonte dos dados | REFERENCES data_sources(id) |
| created_at | TIMESTAMP | Data e hora de criação do registro | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Data e hora da última atualização | DEFAULT CURRENT_TIMESTAMP |

### data_sources
Registra as fontes de dados utilizadas no sistema.

| Coluna | Tipo | Descrição | Restrições |
|--------|------|-------------|-------------|
| id | SERIAL | Identificador único | CHAVE PRIMÁRIA |
| name | VARCHAR(100) | Nome da fonte de dados | NOT NULL |
| description | TEXT | Descrição da fonte de dados | |
| collection_date | DATE | Data da coleta dos dados | |
| responsible_researcher | VARCHAR(100) | Pesquisador responsável | |
| methodology | TEXT | Metodologia utilizada | |
| created_at | TIMESTAMP | Data e hora de criação do registro | DEFAULT CURRENT_TIMESTAMP |

### comunidade_ambiente
Tabela de junção para o relacionamento N:M entre comunidades e ambientes de pesca.

| Coluna | Tipo | Descrição | Restrições |
|--------|------|-------------|-------------|
| comunidade_id | INTEGER | Identificador da comunidade | REFERENCES comunidades(id) |
| ambiente_id | INTEGER | Identificador do ambiente | REFERENCES ambiente_pesca(id) |
| percentual_utilizacao | DECIMAL(5,2) | Percentual de uso | |
| created_at | TIMESTAMP | Data e hora de criação do registro | DEFAULT CURRENT_TIMESTAMP |
| PRIMARY KEY | | | (comunidade_id, ambiente_id) |

## Relacionamentos

### Município para Comunidades (1:N)
- Um município pode ter várias comunidades
- Implementado pela chave estrangeira `comunidades.municipio_id` referenciando `municipios.id`
- Comportamento na exclusão: RESTRICT (um município não pode ser excluído se tiver comunidades vinculadas)

### Comunidade para Censo (1:N)
- Uma comunidade pode ter vários registros de censo (ao longo dos anos)
- Implementado pela chave estrangeira `censo_comunidade.comunidade_id` referenciando `comunidades.id`
- Comportamento na exclusão: CASCADE (se uma comunidade for excluída, todos os seus registros de censo também serão)

### Comunidade para Localidades (1:N)
- Uma comunidade pode ter várias localidades
- Implementado pela chave estrangeira `localidades.comunidade_id` referenciando `comunidades.id`
- Comportamento na exclusão: CASCADE (se uma comunidade for excluída, todas as suas localidades também serão)

### Comunidade para Dados Demográficos (1:N)
- Uma comunidade pode ter vários registros demográficos
- Implementado pela chave estrangeira `demograficos.comunidade_id` referenciando `comunidades.id`
- Comportamento na exclusão: CASCADE (se uma comunidade for excluída, todos os seus registros demográficos também serão)

### Comunidade para Ambientes de Pesca (N:M)
- Uma comunidade pode utilizar vários ambientes de pesca
- Um ambiente de pesca pode ser utilizado por várias comunidades
- Implementado através da tabela de junção `comunidade_ambiente`
- Comportamento na exclusão: CASCADE (se uma comunidade ou ambiente for excluído, os registros associados na tabela de junção também serão)

### Comunidade para Atividades de Pesca (1:N)
- Uma comunidade pode ter várias atividades de pesca registradas
- Implementado pela chave estrangeira `atividade_pesca.comunidade_id` referenciando `comunidades.id`
- Comportamento na exclusão: CASCADE

### Comunidade para Embarcações (1:N)
- Uma comunidade pode ter vários tipos de embarcações
- Implementado pela chave estrangeira `embarcacoes.comunidade_id` referenciando `comunidades.id`
- Comportamento na exclusão: CASCADE

## Views e Consultas Importantes

### vw_municipio_estatisticas
Fornece estatísticas agregadas para cada município.

Descrição: Esta view calcula estatísticas importantes sobre os municípios, incluindo o número de comunidades, o total de pessoas, pescadores, famílias e o percentual de pescadores em relação à população total.

```sql
SELECT
    m.id as municipio_id,
    m.nome as municipio_nome,
    m.estado,
    COUNT(DISTINCT c.id) as num_comunidades,
    COUNT(DISTINCT l.id) as num_localidades,
    SUM(cc.pessoas) as total_pessoas,
    SUM(cc.familias) as total_familias,
    SUM(cc.pescadores) as total_pescadores,
    CASE
        WHEN SUM(cc.pessoas) > 0 THEN
            ROUND((SUM(cc.pescadores)::DECIMAL / SUM(cc.pessoas)::DECIMAL) * 100, 2)
        ELSE 0
    END as percentual_pescadores,
    MAX(cc.ano_referencia) as ultimo_ano_censo
FROM
    municipios m
LEFT JOIN
    comunidades c ON m.id = c.municipio_id
LEFT JOIN
    localidades l ON c.id = l.comunidade_id
LEFT JOIN
    censo_comunidade cc ON c.id = cc.comunidade_id
WHERE
    cc.ano_referencia = (SELECT MAX(ano_referencia) FROM censo_comunidade)
    OR cc.ano_referencia IS NULL
GROUP BY
    m.id, m.nome, m.estado;
````
