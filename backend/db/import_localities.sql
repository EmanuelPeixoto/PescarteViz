-- Clear existing localities to prevent duplication
-- WARNING: Only use if you want to start fresh with locality data
-- DELETE FROM localidades;

-- Import localities for Arraial do Cabo
INSERT INTO localidades (comunidade_id, nome)
SELECT c.id, l.nome
FROM (VALUES
    ('Figueira', 'Novo Arraial'),
    ('Figueira', 'Pernambuca (Arraial do Cabo)'),
    ('Figueira', 'Caiçara'),
    ('Figueira', 'Figueira'),
    ('Figueira', 'Sabá'),
    ('Monte Alto', 'Monte Alto'),
    ('Praia dos Anjos', 'Sítio (Arraial do Cabo)'),
    ('Praia dos Anjos', 'Praia dos Anjos'),
    ('Praia Grande', 'Centro (Arraial do Cabo)'),
    ('Praia Grande', 'Morro da Cabocla'),
    ('Praia Grande', 'Macedônia'),
    ('Prainha', 'Prainha')
) AS l(comunidade_nome, nome)
JOIN comunidades c ON c.nome = l.comunidade_nome
WHERE c.municipio_id = (SELECT id FROM municipios WHERE nome = 'Arraial do Cabo')
ON CONFLICT DO NOTHING;

-- Import localities for Cabo Frio
INSERT INTO localidades (comunidade_id, nome)
SELECT c.id, l.nome
FROM (VALUES
    ('Botafogo', 'Botafogo'),
    ('Centro (Cabo Frio)', 'Porto do Carro'),
    ('Centro (Cabo Frio)', 'São Cristovão'),
    ('Centro (Cabo Frio)', 'Monte Alegre'),
    ('Centro (Cabo Frio)', 'Portinho'),
    ('Centro (Cabo Frio)', 'Jardim Esperança'),
    ('Centro (Cabo Frio)', 'Passagem'),
    ('Centro (Cabo Frio)', 'Itajurú'),
    ('Centro (Cabo Frio)', 'União'),
    ('Centro (Cabo Frio)', 'São Bento'),
    ('Gamboa', 'Gamboa'),
    ('Jacaré', 'Jacaré'),
    ('Jardim Peró', 'Jardim Peró'),
    ('Praia do Siqueira', 'Jardim Caiçara'),
    ('Praia do Siqueira', 'Ponta do Ambrósio'),
    ('Praia do Siqueira', 'Palmeiras'),
    ('Praia do Siqueira', 'Praia do Siqueira'),
    ('Praia do Siqueira', 'Jardim Olinda'),
    ('Tamoios', 'Bairro do Arroz'),
    ('Tamoios', 'Aquarius'),
    ('Tamoios', 'Chavão'),
    ('Tamoios', 'Unamar'),
    ('Tamoios', 'Bairro Hípico')
) AS l(comunidade_nome, nome)
JOIN comunidades c ON c.nome = l.comunidade_nome
WHERE c.municipio_id = (SELECT id FROM municipios WHERE nome = 'Cabo Frio')
ON CONFLICT DO NOTHING;

-- Repeat similar blocks for remaining municipalities...
-- For brevity, showing Campos dos Goytacazes as an example:
INSERT INTO localidades (comunidade_id, nome)
SELECT c.id, l.nome
FROM (VALUES
    ('Coroa Grande', 'Coroa Grande'),
    ('Farol de São Tomé', 'Centro (Farol de São Tomé)'),
    ('Tocos', 'Goiaba'),
    ('Tocos', 'Tocos'),
    ('Tocos', 'Marcelo de Tocos'),
    ('Tocos', 'Canto do Rio'),
    ('Lagoa de Cima', 'Ururaí'),
    ('Lagoa de Cima', 'Pernambuca (Campos dos Goytacazes)'),
    ('Lagoa de Cima', 'Lagoa de Cima'),
    ('Lagoa de Cima', 'Imbé'),
    ('Parque Prazeres', 'Parque Prazeres'),
    ('Ponta Grossa dos Fidalgos', 'Carvão'),
    ('Ponta Grossa dos Fidalgos', 'Ponta Grossa dos Fidalgos'),
    ('Sant''Ana', 'Sant''Ana'),
    ('Sant''Ana', 'Mundeus'),
    ('Sant''Ana', 'Lagoa do Campelo'),
    ('Sant''Ana', 'Travessão de Campos')
) AS l(comunidade_nome, nome)
JOIN comunidades c ON c.nome = l.comunidade_nome
WHERE c.municipio_id = (SELECT id FROM municipios WHERE nome = 'Campos dos Goytacazes')
ON CONFLICT DO NOTHING;