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
  usuario/     usuário e rota /me
  comum/       tratamento de erros da API
  config/      segurança, CORS e JWT
back-end/api/src/main/resources/db/
  migration/   estrutura do banco (Flyway)
  exemplo/     perfumes e promoções de exemplo (tirar em produção)

front-end/src/
  pages/       uma tela por arquivo (Home, Catalogo, Produto, Login, Cadastro, Favoritos)
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
| `GET /produtos`, `GET /produtos/{slug}` | não | catálogo e detalhe do perfume |
| `GET /marcas`, `GET /categorias`, `GET /promocoes` | não | dados dos filtros e do carrossel |
| `POST /auth/cadastro`, `POST /auth/login` | não | criam a sessão (cookies) |
| `POST /auth/refresh`, `POST /auth/logout` | não | renovam ou encerram a sessão |
| `GET /me` | sim | dados do usuário logado |
| `GET /me/favoritos`, `PUT/DELETE /me/favoritos/{id}` | sim | favoritos |
| `GET /me/recomendacoes` | sim | perfumes parecidos com os favoritos |

Carrinho, pedidos e endereços já têm as chamadas prontas no front-end (`services/`), mas ainda não têm rotas na API.

## Configuração de produção

- `APP_AUTH_SEGREDO_JWT`: chave secreta dos tokens (32+ caracteres aleatórios).
- `app.auth.cookie-seguro=true` quando o site estiver em HTTPS.
- `spring.flyway.locations=classpath:db/migration` para não carregar os perfumes de exemplo.
- `VITE_API_URL` no front-end, se a API não estiver em `localhost:8080` (ver `front-end/.env.example`).
