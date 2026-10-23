-- V3: carrinho guardado na API, checkout com endereço e frete, e pagamento simulado (Pix ou cartão de teste).

-- ===== Cupons =====

ALTER TABLE cupom ADD COLUMN descricao       VARCHAR(100) NOT NULL DEFAULT '';  -- texto mostrado na sacola
ALTER TABLE cupom ADD COLUMN somente_pix     BOOLEAN      NOT NULL DEFAULT FALSE;
ALTER TABLE cupom ADD COLUMN primeira_compra BOOLEAN      NOT NULL DEFAULT FALSE; -- só para quem nunca comprou

-- Os mesmos cupons que o site já anuncia na faixa do topo
INSERT INTO cupom (codigo, tipo, valor, descricao, somente_pix, primeira_compra) VALUES
    ('BEMVINDA10', 'PERCENTUAL', 10, '10% de boas-vindas', FALSE, TRUE),
    ('PIX5', 'PERCENTUAL', 5, '5% para pagamento no Pix', TRUE, FALSE)
ON CONFLICT (codigo) DO NOTHING;

-- ===== Pedidos =====

-- O endereço vira colunas comuns (mais fácil de ler e de consultar que um JSON).
-- A tabela ainda está vazia: nenhuma versão anterior criava pedidos.
ALTER TABLE pedido DROP COLUMN endereco_entrega;
ALTER TABLE pedido
    ADD COLUMN entrega_destinatario VARCHAR(150) NOT NULL,
    ADD COLUMN entrega_cep          VARCHAR(8)   NOT NULL,   -- só números
    ADD COLUMN entrega_rua          VARCHAR(200) NOT NULL,
    ADD COLUMN entrega_numero       VARCHAR(20)  NOT NULL,
    ADD COLUMN entrega_complemento  VARCHAR(100),
    ADD COLUMN entrega_bairro       VARCHAR(100) NOT NULL,
    ADD COLUMN entrega_cidade       VARCHAR(100) NOT NULL,
    ADD COLUMN entrega_uf           VARCHAR(2)   NOT NULL,
    ADD COLUMN frete_tipo           VARCHAR(10)  NOT NULL CHECK (frete_tipo IN ('PADRAO', 'EXPRESSA')),
    ADD COLUMN frete_prazo          VARCHAR(40)  NOT NULL,
    ADD COLUMN cupom_codigo         VARCHAR(40);

-- Cópia do que o cliente viu ao comprar, para o histórico continuar igual mesmo se o perfume mudar
ALTER TABLE item_pedido
    ADD COLUMN produto_slug VARCHAR(180),
    ADD COLUMN marca        VARCHAR(100),
    ADD COLUMN imagem_url   VARCHAR(500);

-- Apagar um volume no painel admin não pode apagar pedidos antigos (eles guardam uma cópia dos dados)
ALTER TABLE item_pedido DROP CONSTRAINT item_pedido_variante_id_fkey;
ALTER TABLE item_pedido ADD FOREIGN KEY (variante_id) REFERENCES variante (id) ON DELETE SET NULL;

-- ...mas tira o volume apagado das sacolas
ALTER TABLE item_carrinho DROP CONSTRAINT item_carrinho_variante_id_fkey;
ALTER TABLE item_carrinho ADD FOREIGN KEY (variante_id) REFERENCES variante (id) ON DELETE CASCADE;

-- ===== Pagamentos (simulados: nenhum dinheiro de verdade passa por aqui) =====

ALTER TABLE pagamento ALTER COLUMN provedor SET DEFAULT 'SIMULADO';
ALTER TABLE pagamento
    ADD COLUMN cartao_final     VARCHAR(4),      -- só os 4 últimos dígitos; o número inteiro nunca é guardado
    ADD COLUMN parcelas         INTEGER,
    ADD COLUMN pix_copia_e_cola VARCHAR(300),
    ADD COLUMN criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN pago_em          TIMESTAMPTZ;
