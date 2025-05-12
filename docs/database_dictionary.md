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
| created_at | TIMESTAMP | Data e hora de criação do registro | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Data e hora da última atualização | DEFAULT CURRENT_TIMESTAMP |

### demograficos
Armazena dados demográficos detalhados das comunidades.

| Coluna | Tipo | Descrição | Restrições |
|--------|------|-------------|-------------|
| id | SERIAL | Identificador único | CHAVE PRIMÁRIA |
| comunidade_id | INTEGER | Identificador da comunidade | REFERENCES comunidades(id) |
| faixa_etaria | VARCHAR(20) | Faixa etária (ex: "18-25", "26-35") | |
| genero | VARCHAR(20) | Gênero | |
| cor | VARCHAR(30) | Raça/Etnia | |
| profissao | VARCHAR(100) | Profissão/ocupação | |
| renda_mensal | DECIMAL(10,2) | Renda mensal média | |
| quantidade | INTEGER | Número de pessoas nesta categoria | NOT NULL |
| created_at | TIMESTAMP | Data e hora de criação do registro | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Data e hora da última atualização | DEFAULT CURRENT_TIMESTAMP |

### ambiente_pesca
Armazena informações sobre os ambientes de pesca.

| Coluna | Tipo | Descrição | Restrições |
|--------|------|-------------|-------------|
| id | SERIAL | Identificador único | CHAVE PRIMÁRIA |
| nome | VARCHAR(100) | Nome do ambiente de pesca | NOT NULL |
| descricao | TEXT | Descrição do ambiente | |
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
```

### comunidades_por_municipio
Fornece um resumo das comunidades pesqueiras por município.

```sql
SELECT
    m.id as municipio_id,
    m.nome as municipio,
    m.estado,
    COUNT(DISTINCT c.id) as num_comunidades,
    SUM(cc.pescadores) as total_pescadores,
    SUM(cc.pessoas) as total_pessoas,
    SUM(cc.familias) as total_familias
FROM
    municipios m
LEFT JOIN
    comunidades c ON m.id = c.municipio_id
LEFT JOIN
    censo_comunidade cc ON c.id = cc.comunidade_id
WHERE
    cc.ano_referencia = (SELECT MAX(ano_referencia) FROM censo_comunidade)
    OR cc.ano_referencia IS NULL
GROUP BY
    m.id, m.nome, m.estado
ORDER BY
    m.nome;
```

## Índices

Para otimizar o desempenho do banco de dados, os seguintes índices foram criados:

```sql
CREATE INDEX idx_comunidades_municipio_id ON comunidades(municipio_id);
CREATE INDEX idx_localidades_comunidade_id ON localidades(comunidade_id);
CREATE INDEX idx_censo_comunidade_id ON censo_comunidade(comunidade_id);
CREATE INDEX idx_censo_ano ON censo_comunidade(ano_referencia);
CREATE INDEX idx_demograficos_municipio ON demograficos(municipio_id);
CREATE INDEX idx_demograficos_comunidade ON demograficos(comunidade_id);
CREATE INDEX idx_demograficos_categoria ON demograficos(categoria, subcategoria);
```

## Manutenção do Banco de Dados

### Importação de Dados

O sistema suporta importação de dados através de arquivos CSV para as seguintes entidades:
- Dados de censo
- Localidades
- Dados demográficos

Para importar dados, use os endpoints da API:
- `/api/upload/csv/census` - Importação de dados do censo
- `/api/upload/csv/localities` - Importação de localidades
- `/api/upload/csv/demographics` - Importação de dados demográficos

### Backup e Restauração

Para fazer backup do banco de dados:

```bash
pg_dump -h localhost -U admin -d datavizdb > pescarte_backup.sql
```

Para restaurar o banco de dados:

```bash
psql -h localhost -U admin -d datavizdb < pescarte_backup.sql
```

## Diagrama de Entidade-Relacionamento

Um diagrama visual das tabelas e seus relacionamentos está disponível no arquivo `docs/er_diagram.png`.

## Considerações de Desempenho

- As consultas que envolvem múltiplas junções podem ser lentas, especialmente com grandes volumes de dados.
- As views materializam cálculos complexos para melhorar o desempenho.
- Os índices nas colunas frequentemente consultadas melhoram significativamente o tempo de resposta.

Este documento fornece uma documentação completa e detalhada do banco de dados do PESCARTE, incluindo descrições detalhadas de todas as tabelas, relacionamentos, views importantes e considerações de desempenho. Também adicionei informações sobre índices e manutenção do banco de dados que são úteis para desenvolvedores que trabalham no projeto.
