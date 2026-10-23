-- V1: cria todas as tabelas da loja Magnolia.
-- Regras gerais:
--   * ids são BIGINT gerados pelo próprio banco (IDENTITY)
--   * dinheiro é sempre inteiro em centavos (ex.: R$ 199,90 = 19990)
--   * "tipos" fixos (papel, status...) são texto com CHECK, que combina com @Enumerated(EnumType.STRING) no Java

-- ===== Catálogo =====

CREATE TABLE marca (
    id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE categoria (
    id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(50)  NOT NULL,                -- Feminino, Masculino, Unissex
    slug VARCHAR(60)  NOT NULL UNIQUE
);

CREATE TABLE produto (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    marca_id          BIGINT       NOT NULL REFERENCES marca (id),
    categoria_id      BIGINT       NOT NULL REFERENCES categoria (id),
    nome              VARCHAR(150) NOT NULL,
    slug              VARCHAR(180) NOT NULL UNIQUE,
    descricao         TEXT,
    concentracao      VARCHAR(10)  NOT NULL CHECK (concentracao IN ('EDP', 'EDT', 'PARFUM')),
    familia_olfativa  VARCHAR(60),
    notas_topo        VARCHAR(255),
    notas_coracao     VARCHAR(255),
    notas_fundo       VARCHAR(255),
    ativo             BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_produto_marca     ON produto (marca_id);
CREATE INDEX idx_produto_categoria ON produto (categoria_id);

-- O mesmo perfume em 50 ml e 100 ml = duas variantes, cada uma com preço e estoque
CREATE TABLE variante (
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    produto_id                  BIGINT      NOT NULL REFERENCES produto (id) ON DELETE CASCADE,
    volume_ml                   INTEGER     NOT NULL CHECK (volume_ml > 0),
    sku                         VARCHAR(60) NOT NULL UNIQUE,
    preco_centavos              INTEGER     NOT NULL CHECK (preco_centavos >= 0),
    preco_promocional_centavos  INTEGER              CHECK (preco_promocional_centavos >= 0),
    estoque                     INTEGER     NOT NULL DEFAULT 0 CHECK (estoque >= 0),
    UNIQUE (produto_id, volume_ml)
);

CREATE TABLE imagem_produto (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    produto_id BIGINT       NOT NULL REFERENCES produto (id) ON DELETE CASCADE,
    url        VARCHAR(500) NOT NULL,
    ordem      INTEGER      NOT NULL DEFAULT 0,
    alt        VARCHAR(200)
);

CREATE INDEX idx_imagem_produto ON imagem_produto (produto_id);

-- Itens do carrossel de promoções
CREATE TABLE promocao (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo     VARCHAR(150) NOT NULL,
    imagem_url VARCHAR(500) NOT NULL,
    link       VARCHAR(500),
    inicio     TIMESTAMPTZ  NOT NULL,
    fim        TIMESTAMPTZ  NOT NULL,
    ordem      INTEGER      NOT NULL DEFAULT 0,
    CHECK (fim > inicio)
);

CREATE TABLE cupom (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo          VARCHAR(40) NOT NULL UNIQUE,
    tipo            VARCHAR(12) NOT NULL CHECK (tipo IN ('PERCENTUAL', 'VALOR')),
    valor           INTEGER     NOT NULL CHECK (valor > 0),  -- % (ex.: 10) ou centavos
    minimo_centavos INTEGER     NOT NULL DEFAULT 0,
    valido_ate      TIMESTAMPTZ,
    usos_maximos    INTEGER,
    usos            INTEGER     NOT NULL DEFAULT 0
);

-- ===== Clientes =====

CREATE TABLE usuario (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome       VARCHAR(150) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(100) NOT NULL,              -- BCrypt, nunca a senha pura
    papel      VARCHAR(10)  NOT NULL DEFAULT 'CLIENTE' CHECK (papel IN ('CLIENTE', 'ADMIN')),
    criado_em  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE endereco (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id  BIGINT       NOT NULL REFERENCES usuario (id) ON DELETE CASCADE,
    cep         CHAR(8)      NOT NULL,              -- só números
    rua         VARCHAR(200) NOT NULL,
    numero      VARCHAR(20)  NOT NULL,
    complemento VARCHAR(100),
    bairro      VARCHAR(100) NOT NULL,
    cidade      VARCHAR(100) NOT NULL,
    uf          CHAR(2)      NOT NULL
);

CREATE INDEX idx_endereco_usuario ON endereco (usuario_id);

-- ===== Carrinho =====

-- Visitante usa sessao_id; quem fez login usa usuario_id
CREATE TABLE carrinho (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id    BIGINT      UNIQUE REFERENCES usuario (id) ON DELETE CASCADE,
    sessao_id     VARCHAR(64) UNIQUE,
    cupom_id      BIGINT      REFERENCES cupom (id),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (usuario_id IS NOT NULL OR sessao_id IS NOT NULL)
);

CREATE TABLE item_carrinho (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    carrinho_id BIGINT  NOT NULL REFERENCES carrinho (id) ON DELETE CASCADE,
    variante_id BIGINT  NOT NULL REFERENCES variante (id),
    quantidade  INTEGER NOT NULL CHECK (quantidade > 0),
    UNIQUE (carrinho_id, variante_id)
);

-- ===== Pedidos e pagamentos =====

CREATE TABLE pedido (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero            VARCHAR(20) NOT NULL UNIQUE,      -- número que o cliente vê
    usuario_id        BIGINT      NOT NULL REFERENCES usuario (id),
    endereco_entrega  JSONB       NOT NULL,             -- cópia do endereço no momento da compra
    subtotal_centavos INTEGER     NOT NULL,
    desconto_centavos INTEGER     NOT NULL DEFAULT 0,
    frete_centavos    INTEGER     NOT NULL DEFAULT 0,
    total_centavos    INTEGER     NOT NULL,
    status            VARCHAR(25) NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO'
                      CHECK (status IN ('AGUARDANDO_PAGAMENTO', 'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO')),
    criado_em         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pedido_usuario ON pedido (usuario_id);

-- Cópia do item: se o preço do perfume mudar depois, o pedido antigo não muda
CREATE TABLE item_pedido (
    id                       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id                BIGINT       NOT NULL REFERENCES pedido (id) ON DELETE CASCADE,
    variante_id              BIGINT       REFERENCES variante (id),
    nome_produto             VARCHAR(150) NOT NULL,
    volume_ml                INTEGER      NOT NULL,
    preco_unitario_centavos  INTEGER      NOT NULL,
    quantidade               INTEGER      NOT NULL CHECK (quantidade > 0)
);

CREATE TABLE pagamento (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id       BIGINT       NOT NULL REFERENCES pedido (id),
    provedor        VARCHAR(20)  NOT NULL DEFAULT 'MERCADO_PAGO',
    id_externo      VARCHAR(100),                    -- id do pagamento no Mercado Pago
    metodo          VARCHAR(10)  NOT NULL CHECK (metodo IN ('PIX', 'CARTAO', 'BOLETO')),
    status          VARCHAR(20)  NOT NULL,
    valor_centavos  INTEGER      NOT NULL,
    payload_webhook JSONB
);

CREATE INDEX idx_pagamento_pedido ON pagamento (pedido_id);
