-- V2: favoritos dos clientes e sessões de login.

CREATE TABLE favorito (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id BIGINT      NOT NULL REFERENCES usuario (id) ON DELETE CASCADE,
    produto_id BIGINT      NOT NULL REFERENCES produto (id) ON DELETE CASCADE,
    criado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (usuario_id, produto_id)
);

-- Token que renova o login sem pedir a senha de novo (fica num cookie HttpOnly).
-- O banco guarda só o hash SHA-256: quem ler a tabela não consegue usar os tokens.
CREATE TABLE token_renovacao (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id BIGINT      NOT NULL REFERENCES usuario (id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expira_em  TIMESTAMPTZ NOT NULL,
    criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_token_renovacao_usuario ON token_renovacao (usuario_id);
