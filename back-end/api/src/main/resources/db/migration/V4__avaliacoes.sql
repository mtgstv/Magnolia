-- V4: avaliações dos clientes na página do produto (uma por cliente em cada perfume).

CREATE TABLE avaliacao (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    produto_id    BIGINT       NOT NULL REFERENCES produto (id) ON DELETE CASCADE,
    usuario_id    BIGINT       NOT NULL REFERENCES usuario (id) ON DELETE CASCADE,
    nota          INTEGER      NOT NULL CHECK (nota BETWEEN 1 AND 5),
    titulo        VARCHAR(100),
    comentario    VARCHAR(2000),
    criado_em     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (produto_id, usuario_id)
);

CREATE INDEX idx_avaliacao_produto ON avaliacao (produto_id);
