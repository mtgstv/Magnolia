// Baixa as fotos livres (Unsplash e Pexels) usadas no site para public/images/.
// Rode uma vez, de dentro da pasta front-end:  npm run imagens
// Os créditos de cada foto estão em public/images/CREDITOS.md
import { mkdir, writeFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PASTA_IMAGENS = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images");

const FOTOS = [
  // Produtos (frascos)
  { arquivo: "produtos/sauvage-eau-de-parfum.jpg", site: "unsplash", id: "OtzhtSV8UEU", largura: 800 },
  { arquivo: "produtos/bleu-de-chanel.jpg", site: "unsplash", id: "2b0JeJTEclQ", largura: 800 },
  { arquivo: "produtos/n5-eau-de-parfum.jpg", site: "unsplash", id: "potCPE_Cw8A", largura: 800 },
  { arquivo: "produtos/ck-one.jpg", site: "unsplash", id: "5f4yovjJw4c", largura: 800 },
  { arquivo: "produtos/1-million.jpg", site: "unsplash", id: "HHwGiLybnW4", largura: 800 },
  { arquivo: "produtos/acqua-di-gio.jpg", site: "pexels", id: "8747010", largura: 800 },
  { arquivo: "produtos/black-opium.jpg", site: "pexels", id: "28471438", largura: 800 },
  { arquivo: "produtos/libre-eau-de-parfum.jpg", site: "pexels", id: "11920479", largura: 800 },
  { arquivo: "produtos/invictus.jpg", site: "pexels", id: "32630376", largura: 800 },
  { arquivo: "produtos/good-girl.jpg", site: "pexels", id: "32645088", largura: 800 },
  { arquivo: "produtos/la-vie-est-belle.jpg", site: "pexels", id: "6938739", largura: 800 },
  { arquivo: "produtos/light-blue.jpg", site: "pexels", id: "1961786", largura: 800 },
  { arquivo: "produtos/santal-33.jpg", site: "pexels", id: "16722275", largura: 800 },
  { arquivo: "produtos/memoire-d-une-odeur.jpg", site: "pexels", id: "29611647", largura: 800 },
  // Banners do carrossel de promoções
  { arquivo: "promocoes/semana-floral.jpg", site: "pexels", id: "6938592", largura: 1600 },
  { arquivo: "promocoes/ofertas.jpg", site: "pexels", id: "264819", largura: 1600 },
  { arquivo: "promocoes/novidades.jpg", site: "pexels", id: "10924522", largura: 1600 },
  // Home: convite para criar conta
  { arquivo: "home/cadastro.jpg", site: "pexels", id: "7524968", largura: 1200 },
  // Telas de entrar e criar conta
  { arquivo: "conta/entrar.jpg", site: "pexels", id: "36297822", largura: 1200 },
  { arquivo: "conta/cadastro.jpg", site: "pexels", id: "7796498", largura: 1200 },
  // Carrinho
  { arquivo: "carrinho/presente.jpg", site: "pexels", id: "5486845", largura: 1200 },
];

async function enderecoDaFoto({ site, id, largura }) {
  if (site === "pexels") {
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${largura}`;
  }

  // O Unsplash pede que o download passe por este endereço; ele redireciona para o arquivo da foto
  const resposta = await fetch(`https://unsplash.com/photos/${id}/download?force=true`, { redirect: "manual" });
  const destino = resposta.headers.get("location");
  if (!destino) throw new Error(`o Unsplash não devolveu o endereço da foto (status ${resposta.status})`);

  const endereco = new URL(destino);
  endereco.searchParams.delete("dl");
  endereco.searchParams.set("w", String(largura));
  endereco.searchParams.set("q", "80");
  endereco.searchParams.set("fm", "jpg");
  endereco.searchParams.set("fit", "max");
  return endereco.toString();
}

let falhas = 0;

for (const foto of FOTOS) {
  const caminho = join(PASTA_IMAGENS, foto.arquivo);
  try {
    const resposta = await fetch(await enderecoDaFoto(foto));
    if (!resposta.ok) throw new Error(`status ${resposta.status}`);

    await mkdir(dirname(caminho), { recursive: true });
    await writeFile(caminho, Buffer.from(await resposta.arrayBuffer()));
    // A ilustração SVG antiga deixa de ser usada
    await rm(caminho.replace(/\.jpg$/, ".svg"), { force: true });
    console.log(`ok     ${foto.arquivo}`);
  } catch (erro) {
    falhas++;
    console.error(`falhou ${foto.arquivo}: ${erro.message}`);
  }
}

console.log(falhas ? `\n${falhas} foto(s) não baixaram. Rode de novo.` : "\nPronto! Todas as fotos foram baixadas.");
process.exitCode = falhas ? 1 : 0;
