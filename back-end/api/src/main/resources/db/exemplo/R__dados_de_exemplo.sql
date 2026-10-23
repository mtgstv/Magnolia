-- Dados de exemplo para desenvolvimento: categorias, marcas, perfumes e promoções.
-- Migration "repetível" (R__): o Flyway roda este arquivo de novo sempre que ele muda,
-- por isso todo INSERT ignora o que já existe (ON CONFLICT DO NOTHING / NOT EXISTS).
-- Para não carregar estes dados em produção, tire classpath:db/exemplo de spring.flyway.locations.

INSERT INTO categoria (nome, slug) VALUES
    ('Feminino', 'feminino'),
    ('Masculino', 'masculino'),
    ('Unissex', 'unissex')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO marca (nome, slug) VALUES
    ('Calvin Klein', 'calvin-klein'),
    ('Carolina Herrera', 'carolina-herrera'),
    ('Chanel', 'chanel'),
    ('Dior', 'dior'),
    ('Dolce&Gabbana', 'dolce-gabbana'),
    ('Giorgio Armani', 'giorgio-armani'),
    ('Gucci', 'gucci'),
    ('Lancôme', 'lancome'),
    ('Le Labo', 'le-labo'),
    ('Paco Rabanne', 'paco-rabanne'),
    ('Yves Saint Laurent', 'yves-saint-laurent')
ON CONFLICT (slug) DO NOTHING;

-- "dias" define a data de cadastro (há quantos dias), usada para ordenar as novidades
INSERT INTO produto (marca_id, categoria_id, nome, slug, descricao, concentracao, familia_olfativa,
                     notas_topo, notas_coracao, notas_fundo, criado_em)
SELECT m.id, c.id, p.nome, p.slug, p.descricao, p.concentracao, p.familia,
       p.topo, p.coracao, p.fundo, now() - p.dias * INTERVAL '1 day'
FROM (VALUES
    ('dior', 'masculino', 'Sauvage', 'sauvage-eau-de-parfum',
     'Fresco e intenso, com a bergamota vibrante equilibrada pelo calor da baunilha. Um clássico moderno para o dia e para a noite.',
     'EDP', 'Aromático', 'Bergamota, pimenta', 'Lavanda, pimenta-de-sichuan, anis-estrelado', 'Ambroxan, baunilha', 40),
    ('carolina-herrera', 'feminino', 'Good Girl', 'good-girl',
     'Ousado e sofisticado: o contraste entre a tuberosa luminosa e o cacau envolvente, num frasco que virou ícone.',
     'EDP', 'Oriental', 'Amêndoa, café', 'Tuberosa, jasmim-sambac', 'Fava-tonka, cacau', 55),
    ('paco-rabanne', 'masculino', '1 Million', '1-million',
     'Especiado e marcante, com canela e couro sobre um fundo amadeirado. Para quem gosta de ser notado.',
     'EDT', 'Amadeirado', 'Toranja, hortelã, mandarina', 'Canela, rosa, especiarias', 'Couro, âmbar, madeiras', 70),
    ('lancome', 'feminino', 'La Vie Est Belle', 'la-vie-est-belle',
     'Uma declaração de felicidade: íris delicada envolta em praliné e baunilha, doce na medida certa.',
     'EDP', 'Gourmand', 'Pera, groselha-preta', 'Íris, jasmim, flor de laranjeira', 'Praliné, baunilha, patchouli', 25),
    ('giorgio-armani', 'masculino', 'Acqua di Giò', 'acqua-di-gio',
     'Frescor mediterrâneo de cítricos e notas marinhas, leve e elegante para os dias quentes.',
     'EDT', 'Cítrico', 'Limão, bergamota, notas marinhas', 'Jasmim, alecrim', 'Cedro, almíscar branco, patchouli', 90),
    ('yves-saint-laurent', 'feminino', 'Libre', 'libre-eau-de-parfum',
     'A lavanda francesa encontra a flor de laranjeira marroquina numa assinatura floral, livre e confiante.',
     'EDP', 'Floral', 'Lavanda, mandarina', 'Flor de laranjeira, jasmim', 'Baunilha, cedro, âmbar', 10),
    ('chanel', 'feminino', 'N°5', 'n5-eau-de-parfum',
     'O floral aldeídico mais famoso do mundo: rosa e jasmim com um rastro aveludado de sândalo e baunilha.',
     'EDP', 'Floral', 'Aldeídos, néroli, ylang-ylang', 'Rosa, jasmim', 'Sândalo, baunilha, vetiver', 120),
    ('chanel', 'masculino', 'Bleu de Chanel', 'bleu-de-chanel',
     'Amadeirado aromático e atemporal, com frescor cítrico e um fundo de incenso e sândalo.',
     'EDP', 'Amadeirado', 'Toranja, limão, hortelã', 'Gengibre, noz-moscada, jasmim', 'Incenso, sândalo, cedro', 15),
    ('calvin-klein', 'unissex', 'CK One', 'ck-one',
     'O unissex que marcou época: limpo, cítrico e descomplicado, feito para ser compartilhado.',
     'EDT', 'Cítrico', 'Bergamota, limão, abacaxi', 'Jasmim, lírio-do-vale', 'Almíscar, âmbar, musgo', 150),
    ('dolce-gabbana', 'feminino', 'Light Blue', 'light-blue',
     'Um passeio pelo verão siciliano: limão, maçã verde e cedro em uma fragrância luminosa.',
     'EDT', 'Cítrico', 'Limão-siciliano, maçã verde', 'Jasmim, rosa branca', 'Cedro, âmbar, almíscar', 35),
    ('le-labo', 'unissex', 'Santal 33', 'santal-33',
     'Sândalo cremoso com notas de couro e especiarias: amadeirado, marcante e muito pessoal.',
     'EDP', 'Amadeirado', 'Cardamomo, violeta', 'Íris, papiro', 'Sândalo, couro, cedro', 5),
    ('gucci', 'unissex', 'Mémoire d''une Odeur', 'memoire-d-une-odeur',
     'Floral aromático com camomila romana e almíscar, inspirado em memórias afetivas.',
     'EDP', 'Floral', 'Camomila romana, amêndoa amarga', 'Jasmim, almíscar', 'Sândalo, cedro, baunilha', 3),
    ('yves-saint-laurent', 'feminino', 'Black Opium', 'black-opium',
     'Café preto e baunilha encontram flores brancas num gourmand intenso e envolvente.',
     'EDP', 'Gourmand', 'Pera, pimenta-rosa', 'Café, jasmim, flor de laranjeira', 'Baunilha, patchouli, cedro', 20),
    ('paco-rabanne', 'masculino', 'Invictus', 'invictus',
     'Fresco e energético, com toranja e notas marinhas sobre um fundo amadeirado.',
     'EDT', 'Aromático', 'Toranja, notas marinhas', 'Louro, jasmim', 'Guaiaco, musgo de carvalho, âmbar gris', 60)
) AS p (marca, categoria, nome, slug, descricao, concentracao, familia, topo, coracao, fundo, dias)
JOIN marca m ON m.slug = p.marca
JOIN categoria c ON c.slug = p.categoria
ON CONFLICT (slug) DO NOTHING;

-- Preços em centavos; promo NULL = sem desconto
INSERT INTO variante (produto_id, volume_ml, sku, preco_centavos, preco_promocional_centavos, estoque)
SELECT pr.id, v.volume, v.sku, v.preco, v.promo, v.estoque
FROM (VALUES
    ('sauvage-eau-de-parfum', 60, 'DIOR-SAUV-EDP-60', 64990, NULL::INTEGER, 12),
    ('sauvage-eau-de-parfum', 100, 'DIOR-SAUV-EDP-100', 89990, 74990, 8),
    ('good-girl', 50, 'CH-GOODGIRL-EDP-50', 57990, NULL, 10),
    ('good-girl', 80, 'CH-GOODGIRL-EDP-80', 79990, 67990, 6),
    ('1-million', 50, 'PR-1MILLION-EDT-50', 47990, NULL, 15),
    ('1-million', 100, 'PR-1MILLION-EDT-100', 69990, NULL, 9),
    ('la-vie-est-belle', 50, 'LAN-LVEB-EDP-50', 54990, NULL, 11),
    ('la-vie-est-belle', 75, 'LAN-LVEB-EDP-75', 74990, 62990, 7),
    ('acqua-di-gio', 100, 'GA-ADG-EDT-100', 79990, NULL, 10),
    ('acqua-di-gio', 200, 'GA-ADG-EDT-200', 109990, NULL, 4),
    ('libre-eau-de-parfum', 50, 'YSL-LIBRE-EDP-50', 64990, NULL, 9),
    ('libre-eau-de-parfum', 90, 'YSL-LIBRE-EDP-90', 84990, 72990, 5),
    ('n5-eau-de-parfum', 50, 'CHA-N5-EDP-50', 89990, NULL, 6),
    ('n5-eau-de-parfum', 100, 'CHA-N5-EDP-100', 129990, NULL, 4),
    ('bleu-de-chanel', 50, 'CHA-BLEU-EDP-50', 84990, NULL, 8),
    ('bleu-de-chanel', 100, 'CHA-BLEU-EDP-100', 119990, NULL, 5),
    ('ck-one', 100, 'CK-ONE-EDT-100', 39990, NULL, 20),
    ('ck-one', 200, 'CK-ONE-EDT-200', 54990, 46990, 12),
    ('light-blue', 50, 'DG-LBLUE-EDT-50', 49990, NULL, 10),
    ('light-blue', 100, 'DG-LBLUE-EDT-100', 69990, 59990, 7),
    ('santal-33', 50, 'LL-SANTAL33-EDP-50', 159990, NULL, 3),
    ('santal-33', 100, 'LL-SANTAL33-EDP-100', 239990, NULL, 0),
    ('memoire-d-une-odeur', 60, 'GUC-MEMOIRE-EDP-60', 64990, NULL, 8),
    ('memoire-d-une-odeur', 100, 'GUC-MEMOIRE-EDP-100', 84990, 69990, 6),
    ('black-opium', 50, 'YSL-BOPIUM-EDP-50', 64990, NULL, 9),
    ('black-opium', 90, 'YSL-BOPIUM-EDP-90', 89990, NULL, 6),
    ('invictus', 100, 'PR-INVICTUS-EDT-100', 59990, 49990, 14),
    ('invictus', 200, 'PR-INVICTUS-EDT-200', 79990, NULL, 6)
) AS v (produto, volume, sku, preco, promo, estoque)
JOIN produto pr ON pr.slug = v.produto
ON CONFLICT (sku) DO NOTHING;

-- As imagens ficam em front-end/public/images/produtos/<slug>.svg
INSERT INTO imagem_produto (produto_id, url, ordem, alt)
SELECT pr.id, '/images/produtos/' || pr.slug || '.svg', 0, 'Frasco do perfume ' || pr.nome
FROM produto pr
WHERE pr.slug = ANY (ARRAY[
    'sauvage-eau-de-parfum', 'good-girl', '1-million', 'la-vie-est-belle', 'acqua-di-gio',
    'libre-eau-de-parfum', 'n5-eau-de-parfum', 'bleu-de-chanel', 'ck-one', 'light-blue',
    'santal-33', 'memoire-d-une-odeur', 'black-opium', 'invictus'
])
  AND NOT EXISTS (SELECT 1 FROM imagem_produto i WHERE i.produto_id = pr.id);

INSERT INTO promocao (titulo, imagem_url, link, inicio, fim, ordem)
SELECT p.titulo, p.imagem, p.link, TIMESTAMPTZ '2026-01-01 00:00:00-03', TIMESTAMPTZ '2027-12-31 23:59:59-03', p.ordem
FROM (VALUES
    ('Semana Floral: perfumes florais com até 20% de desconto', '/images/promocoes/semana-floral.svg', '/catalogo?familia=Floral', 1),
    ('Ofertas da estação em perfumes selecionados', '/images/promocoes/ofertas.svg', '/catalogo?promocao=1', 2),
    ('Chegaram as novidades: conheça os lançamentos', '/images/promocoes/novidades.svg', '/catalogo?ordenacao=novidades', 3)
) AS p (titulo, imagem, link, ordem)
WHERE NOT EXISTS (SELECT 1 FROM promocao x WHERE x.titulo = p.titulo);
