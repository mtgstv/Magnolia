# 🌸 Magnolia
---

Projeto de aplicação web com tema de uma loja de perfumes para a cadeira de maturidade de software.

## Como rodar

Precisa de: Docker, Java 21 e Node.js 20.19+.

```bash
# 1. Banco de dados (Postgres na porta 5433)
docker compose up -d

# 2. API (http://localhost:8080/api/v1) — cria as tabelas e os perfumes de exemplo na primeira vez
cd back-end/api
./mvnw spring-boot:run

# 3. Site (http://localhost:5173), em outro terminal
cd front-end
npm install
npm run dev
```

Para criar uma conta, use a tela **Criar conta** do site.

### Para testar a loja

- **Compra:** coloque perfumes na sacola e clique em **Finalizar compra** (precisa estar logado). O CEP preenche o endereço sozinho (ViaCEP) e calcula o frete.
- **Pagamento (simulado, nada é cobrado):** no Pix, o pedido mostra um código de teste e o botão **Simular pagamento**. No cartão, use `4111 1111 1111 1111` (aprovado) ou `4000 0000 0000 0002` (recusado), com qualquer nome, validade futura e CVV.
- **Cupons:** `BEMVINDA10` (10%, só na primeira compra) e `PIX5` (5%, só no Pix).
- **Painel admin (`/admin`):** no perfil dev existe uma conta de administrador; o e-mail e a senha estão no fim de `back-end/api/src/main/resources/db/exemplo/R__dados_de_exemplo.sql`. Em produção, transforme uma conta em admin direto no banco: `UPDATE usuario SET papel = 'ADMIN' WHERE email = '...';`

O `./mvnw spring-boot:run` liga sozinho o perfil **dev** (`application-dev.properties`), com a senha do banco local e os perfumes de exemplo. Se rodar a API pela IDE (botão "Run" no `ApiApplication`), ative o perfil `dev` na configuração de execução, senão ela não inicia.

### Produção

Sem o perfil dev, a API exige estas variáveis de ambiente e não inicia se faltar alguma:

| Variável | Exemplo |
|---|---|
| `DB_URL`, `DB_USUARIO`, `DB_SENHA` | `jdbc:postgresql://servidor:5432/magnolia` |
| `APP_AUTH_SEGREDO_JWT` | texto aleatório com 32+ caracteres (ex.: `openssl rand -base64 48`) |
| `APP_CORS_ORIGENS` | `https://www.seusite.com.br` |

Em produção o cookie de login só é enviado por HTTPS, e login/cadastro aceitam até 10 tentativas por minuto por IP.

### Testes

```bash
cd back-end/api && ./mvnw test   # testes de integração (sobem um Postgres próprio no Docker)
cd front-end && npm run lint
```

## Estrutura

```
back-end/api/src/main/java/com/magnolia/api/
  auth/        login, cadastro, renovação de sessão e logout (JWT em cookie HttpOnly)
  catalogo/    perfumes, variantes, marcas, categorias e promoções
  favorito/    favoritos e recomendações do usuário logado
  carrinho/    sacola (visitante e logado), cupons e cálculo de frete
  pedido/      checkout, pedidos e pagamento simulado (Pix e cartão de teste)
  avaliacao/   avaliações dos clientes nos perfumes
  admin/       painel admin: perfumes, preços, estoque, marcas e promoções
  usuario/     usuário e rota /me
  comum/       tratamento de erros da API
  config/      segurança, CORS e JWT
back-end/api/src/main/resources/db/
  migration/   estrutura do banco (Flyway)
  exemplo/     perfumes e promoções de exemplo (tirar em produção)

front-end/src/
  pages/       uma tela por arquivo (Home, Catalogo, Produto, Carrinho, Checkout, Pedidos...)
    admin/     telas do painel admin
  components/
    layout/    header, footer e moldura das páginas
    home/      seções da home (visitante e logado)
    catalogo/  filtros, carrossel de promoções
    produto/   card, grade e botão de favorito
    auth/      moldura das telas de login e cadastro
    ui/        peças reaproveitáveis (botão, campo, mensagens)
  contexts/    login e favoritos compartilhados pelo site todo
  hooks/       useAuth, useFavoritos e useCarregar (buscar dados da API)
  services/    chamadas à API
  routes/      rotas e rotas protegidas
  utils/       preços, textos e filtros do catálogo
front-end/public/images/  ilustrações dos frascos e banners
```

As cores da marca ficam em `front-end/src/index.css` (`bg-marca`, `text-destaque`...).

## API

Todas as rotas começam com `/api/v1`. Preços sempre em centavos.

| Rota | Login? | O que faz |
|---|---|---|
| `GET /produtos`, `GET /produtos/{slug}` | não | catálogo (aceita busca e filtros: `?q=baunilha&categoria=feminino&marca=dior&familia=Floral&precoMin=30000&precoMax=80000&promocao=true&ordenacao=menor-preco`) e detalhe |
| `GET /produtos/{slug}/avaliacoes` | não | avaliações, média e distribuição das notas |
| `PUT/DELETE /produtos/{slug}/avaliacoes` | sim | cria/edita ou apaga a avaliação do cliente |
| `GET /carrinho`, `POST /carrinho/itens`, `PATCH/DELETE /carrinho/itens/{varianteId}` | não | sacola (visitante pelo cookie `magnolia_carrinho`; ao entrar, vai para a conta) |
| `POST/DELETE /carrinho/cupom`, `GET /carrinho/frete?cep=` | não | cupom e opções de entrega |
| `POST /pedidos`, `GET /pedidos`, `GET /pedidos/{numero}` | sim | finaliza a compra e lista os pedidos |
| `POST /pedidos/{numero}/simular-pagamento` | sim | confirma um Pix de teste |
| `/admin/**` | admin | perfumes, marcas, promoções e moderação de avaliações |
| `GET /marcas`, `GET /categorias`, `GET /promocoes` | não | dados dos filtros e do carrossel |
| `POST /auth/cadastro`, `POST /auth/login` | não | criam a sessão (cookies) |
| `POST /auth/refresh`, `POST /auth/logout` | não | renovam ou encerram a sessão |
| `GET /me` | sim | dados do usuário logado |
| `GET /me/favoritos`, `PUT/DELETE /me/favoritos/{id}` | sim | favoritos |
| `GET /me/recomendacoes` | sim | perfumes parecidos com os favoritos |

O pagamento é simulado (`pedido/PagamentoSimulado.java`): para cobrar de verdade, troque essa classe pela integração com um provedor, como o Mercado Pago.

## Configuração de produção

- `APP_AUTH_SEGREDO_JWT`: chave secreta dos tokens (32+ caracteres aleatórios).
- `app.auth.cookie-seguro=true` quando o site estiver em HTTPS.
- `spring.flyway.locations=classpath:db/migration` para não carregar os perfumes de exemplo.
- `VITE_API_URL` no front-end, se a API não estiver em `localhost:8080` (ver `front-end/.env.example`).
