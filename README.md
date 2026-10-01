# Mesa Posta — Biblioteca de Receitas

Plataforma web de receitas (Next.js + TypeScript + Tailwind), pensada para celular, hospedada na Vercel e sem custos de banco de dados.
O conteúdo inicial foi extraído dos PDFs enviados e convertido em **505 receitas** (499 visíveis — 6 eram páginas repetidas nos PDFs).

> O nome "Mesa Posta" e todos os textos gerais ficam em `site.config.ts`. Troque à vontade.

---

## Sumário

1. [Como executar no computador](#1-como-executar-no-computador)
2. [Como publicar (deploy) na Vercel](#2-como-publicar-deploy-na-vercel)
3. [Onde fica cada coisa](#3-onde-fica-cada-coisa)
4. [Adicionar uma receita](#4-adicionar-uma-receita)
5. [Editar uma receita](#5-editar-uma-receita)
6. [Adicionar ou trocar a foto](#6-adicionar-ou-trocar-a-foto)
7. [Adicionar um vídeo](#7-adicionar-um-vídeo)
8. [Criar uma coleção](#8-criar-uma-coleção)
9. [Criar uma categoria](#9-criar-uma-categoria)
10. [Importar um PDF novo](#10-importar-um-pdf-novo)
11. [Atualizar o conteúdo e publicar de novo](#11-atualizar-o-conteúdo-e-publicar-de-novo)
12. [Relatórios: inventário, duplicatas e revisão](#12-relatórios-inventário-duplicatas-e-revisão)
13. [Conteúdo de saúde](#13-conteúdo-de-saúde)
14. [Senha de acesso (como trocar)](#14-senha-de-acesso-como-trocar)
15. [Login individual e área administrativa (futuro)](#15-login-individual-e-área-administrativa-futuro)
16. [Detalhes técnicos](#16-detalhes-técnicos)

---

## 1. Como executar no computador

Precisa do [Node.js](https://nodejs.org) versão 20 ou mais nova.
Copie `.env.example` para `.env.local` e defina a senha (`SITE_PASSWORD`).

```bash
npm install      # só na primeira vez
npm run dev      # abre em http://localhost:3000
```

Antes de iniciar, o projeto prepara as imagens e confere o conteúdo automaticamente.
Se algo estiver errado em uma receita (ex.: categoria que não existe), aparece uma mensagem explicando o arquivo e o problema.

Para testar a versão final, igual à que vai ao ar:

```bash
npm run build
npm start
```

## 2. Como publicar (deploy) na Vercel

**Primeira vez**

1. Crie um repositório no GitHub e envie este projeto (`git push`).
2. Em [vercel.com](https://vercel.com) → **Add New → Project** → escolha o repositório → **Deploy**. Não precisa mudar nenhuma configuração.
3. Em **Settings → Environment Variables**, adicione:
   - `SITE_PASSWORD` = a senha de acesso das clientes (**obrigatória** — sem ela o site fica fechado).
   - `NEXT_PUBLIC_SITE_URL` = endereço final do site (ex.: `https://receitas.seudominio.com.br`). Usado nos links de compartilhamento, sitemap e SEO.
   - (opcional) `NEXT_PUBLIC_ALLOW_INDEXING` = `true` se quiser que o Google indexe as receitas. **Padrão: não indexar**, já que é um produto pago.
4. Para usar seu domínio: **Settings → Domains**.

**Depois disso**, toda vez que você enviar alterações para o GitHub (`git push`), a Vercel publica sozinha em 1–2 minutos.

Custo: atenção — pelos termos atuais, o plano gratuito da Vercel é para uso **não comercial**; para vender, confira os termos ou use Cloudflare Pages/Netlify, cujos planos gratuitos permitem uso comercial. Não há banco de dados, CMS ou API paga. As imagens já saem otimizadas do build, então não consomem a cota de otimização de imagens da Vercel.

## 3. Onde fica cada coisa

```
content/                      ← TODO o conteúdo do site
  recipes/<coleção>/<slug>.json   uma receita por arquivo
  images/<slug>.jpg               foto original de cada receita
  collections/<slug>.json         uma coleção por arquivo
  categories.json                 lista de categorias (filtros e fileiras)
  _modelos/receita-modelo.json    modelo para criar receita nova
  _reports/                       relatórios gerados (inventário, duplicatas, revisão)
  _import/                        material de importação dos PDFs
    dsl/*.dsl                       transcrição revisada de cada PDF
    sources.json                    configuração de cada PDF (coleção, categorias)
site.config.ts                ← nome do site, textos, endereço, indexação
app/                          ← páginas (início, explorar, receitas, coleções, favoritos)
components/                   ← peças visuais (cards, fileiras, vídeo, checklist...)
lib/                          ← leitura dos dados, busca, favoritos, vídeo
scripts/                      ← imagens, validação, importação, OCR de PDFs
```

**Páginas:** `/` (início), `/explorar`, `/receitas/[slug]`, `/colecoes`, `/colecoes/[slug]`, `/favoritos`.
Todas são geradas automaticamente a partir dos arquivos de `content/`. Nenhuma página de receita é escrita à mão.

## 4. Adicionar uma receita

1. Copie `content/_modelos/receita-modelo.json` para `content/recipes/<coleção>/<slug>.json`.
   Ex.: `content/recipes/doces-sem-acucar/bolo-de-laranja-da-vovo.json`
2. Preencha os campos:
   - `id`: um código único qualquer (ex.: `manual-001`). Nunca reutilize.
   - `slug`: o final do link, em minúsculas, sem acento e com hífens. Igual ao nome do arquivo.
   - `title`, `description`
   - `collections`: lista de coleções (o nome do arquivo da coleção, sem `.json`).
   - `categories`: lista de categorias (veja os `slug` em `content/categories.json`).
   - `ingredients` e `instructions`: grupos com `title` (ou `null`) e a lista de itens/passos.
   - `prepTime` (minutos), `servings` (texto, ex.: `"12 fatias"`), `nutrition` etc.
   - **Se o dado não existe, use `null`.** Não invente.
3. Coloque a foto em `content/images/` (passo 6) — ou deixe `"image": null`: o site mostra uma capa ilustrada elegante.
4. Rode `npm run dev` e confira.

Pronto: a receita aparece sozinha na busca, nos filtros da categoria, na coleção, nas fileiras da página inicial e nas sugestões de "Você também pode gostar".

Quer que apareça em **Em destaque**? Use `"featured": true`.
Quer escolher as relacionadas manualmente? Liste os slugs em `"relatedRecipes"`.

## 5. Editar uma receita

Abra `content/recipes/<coleção>/<slug>.json` em qualquer editor de texto (no GitHub dá para editar direto pelo navegador, no ícone de lápis) e salve.
Não mude o `id`. Se mudar o `slug`, mude também o nome do arquivo — atenção: o link antigo deixa de funcionar.

## 6. Adicionar ou trocar a foto

1. Salve a foto em `content/images/` com o **mesmo nome do slug**: `content/images/<slug>.jpg` (aceita `.jpg`, `.png`, `.webp`). Fotos verticais (retrato) ficam melhores.
2. Na receita: `"image": { "file": "<slug>.jpg", "alt": "Descrição da foto", "origin": "manual" }`.
3. No próximo `npm run dev` ou deploy, o site gera sozinho as versões otimizadas (WebP leve para o celular, WebP maior para telas grandes e JPG para a prévia do WhatsApp).

Não use foto de outra receita: quando não houver foto adequada, deixe `"image": null`.

## 7. Adicionar um vídeo

Os vídeos **não** ficam dentro do projeto — eles são hospedados fora (YouTube, Vimeo, Bunny Stream ou um link de MP4) e o site só incorpora.
Na receita:

```json
"video": {
  "url": "https://www.youtube.com/shorts/XXXXXXXXXXX",
  "provider": "youtube",
  "thumbnail": null,
  "orientation": "vertical"
}
```

- `provider`: `youtube`, `vimeo`, `bunny` (use a URL de *embed* do painel do Bunny) ou `mp4`.
- `orientation`: `vertical` (9:16, estilo Reels) ou `horizontal` (16:9).
- `thumbnail`: capa opcional; sem ela, o YouTube gera a capa sozinho e nos outros casos é usada a foto da receita.

O player só carrega quando a pessoa toca em **Assistir ao preparo** — a página continua leve. Receitas sem vídeo simplesmente não mostram a seção.
Para adicionar outro provedor, edite `lib/video.ts` (uma entrada nova; nada mais muda).

**Sobre conteúdo pago:** vídeos públicos ou "não listados" no YouTube podem ser assistidos por quem tiver o link. Para proteção real, use um serviço com links assinados (ex.: Bunny Stream com *token authentication*) junto com o login (seção 14).

## 8. Criar uma coleção

Crie `content/collections/<slug>.json`:

```json
{
  "id": "pressao-arterial",
  "slug": "pressao-arterial",
  "name": "Alimentação e pressão arterial",
  "shortDescription": "Frase curta que aparece no card.",
  "description": "Texto maior que aparece no topo da página da coleção.",
  "coverRecipe": "slug-de-uma-receita-com-foto",
  "coverImage": null,
  "heroImage": null,
  "disclaimer": "Este conteúdo tem caráter informativo e não substitui a orientação de profissionais de saúde.",
  "featured": false,
  "order": 7,
  "accent": "#7A8F5B"
}
```

Depois, coloque o slug da coleção no campo `collections` das receitas desejadas. Uma receita pode estar em várias coleções.
Para que a coleção vire uma fileira na página inicial, adicione-a na lista `ROWS` em `app/page.tsx`.

## 9. Criar uma categoria

Edite `content/categories.json` e adicione, por exemplo:

```json
{ "slug": "massas", "name": "Massas", "emoji": "🍝", "order": 14, "homeRow": true }
```

Use o slug no campo `categories` das receitas. O filtro aparece sozinho em **Explorar** (só aparecem categorias com receitas).
Para virar fileira na página inicial, inclua `{ type: "category", slug: "massas" }` na lista `ROWS` em `app/page.tsx`.

## 10. Importar um PDF novo

Fluxo: **PDF → texto → transcrição revisada (.dsl) → `npm run import` → receitas JSON → site**.

1. Gere as páginas e o texto do PDF (no Mac, usa o OCR do próprio sistema quando o PDF é só imagem):
   ```bash
   bash scripts/ocr/novo-pdf.sh "/caminho/Novo PDF.pdf" NOVO1
   ```
   (precisa do Poppler: `brew install poppler`)
2. Cadastre o PDF em `content/_import/sources.json` (nome do arquivo, chave, coleção e, se quiser, categorias fixas).
3. Transcreva as receitas para `content/_import/dsl/NOVO1.dsl` seguindo `content/_import/FORMATO-DSL.md`, conferindo o texto com as páginas em `content/_import/trabalho/NOVO1/paginas/`. Esta etapa pode ser feita com ajuda de IA — **revise sempre** quantidades, temperaturas e tempos.
4. Fotos: salve os recortes em `content/_import/images-raw/<CHAVE>-p<página>.jpg` (ou `-n<número>`); o importador associa sozinho.
5. Rode:
   ```bash
   npm run import content/_import/dsl/NOVO1.dsl
   npm run validate
   ```
6. Confira `content/_reports/duplicatas.md` e `revisao.md`, rode `npm run dev` e publique.

Rodar o importador de novo **não apaga** edições manuais de vídeo, destaque, relacionadas, coleções extras e fotos manuais.

## 11. Atualizar o conteúdo e publicar de novo

```bash
npm run dev          # conferir localmente
git add -A
git commit -m "Novas receitas"
git push             # a Vercel publica sozinha
```

Se o conteúdo tiver erro estrutural, o build para e mostra exatamente qual arquivo corrigir — assim nada quebrado vai ao ar.

## 12. Relatórios: inventário, duplicatas e revisão

`npm run validate` (roda sozinho em todo build) atualiza:

- `content/_reports/inventario.md` — total de receitas, por documento, coleção e categoria, e quais campos estão ausentes.
- `content/_reports/duplicatas.md` — possíveis duplicatas comparando **nome, ingredientes e modo de preparo**. Nada é apagado:
  - cópias idênticas recebem `"duplicateOf": "<slug-principal>"` e ficam fora de listas e busca (o link continua funcionando);
  - receitas com mesmo nome e conteúdo diferente são mantidas como versões distintas.
- `content/_reports/revisao.md` — receitas com pontos para revisão editorial (`review.flags`): texto incompleto no PDF, ingrediente citado no preparo e ausente da lista, título com marca registrada, ingredientes com açúcar em coleção "sem açúcar" etc.

## 13. Conteúdo de saúde

- Coleções temáticas (diabetes, pressão, etc.) são **forma de organização**, não promessa de tratamento.
- Alegações de saúde encontradas nos PDFs ("ajuda a controlar a glicemia", "anti-inflamatório"...) foram retiradas das descrições exibidas e guardadas em `review.healthClaims` para revisão. Não aparecem no site.
- Cada coleção pode ter um `disclaimer`, mostrado na página da coleção e nas receitas dela. O aviso geral fica no rodapé (`site.config.ts → healthNotice`).
- Valores nutricionais só aparecem quando existem no material, sempre identificados como aproximados quando a fonte diz isso.

## 14. Senha de acesso (como trocar)

O site inteiro é protegido por **uma senha única**, a mesma para todas as clientes. Sem ela, ninguém vê páginas, fotos nem a busca — nem copiando os links. Quem entra uma vez fica conectado naquele aparelho.

- A senha fica **só** na variável `SITE_PASSWORD` (na hospedagem e no arquivo `.env.local` do computador). Ela nunca vai para o GitHub.
- Maiúsculas/minúsculas e espaços antes/depois são ignorados, para facilitar.

**Para trocar a senha** (ex.: se alguém repassou):

1. Na hospedagem (Vercel: **Settings → Environment Variables**), edite `SITE_PASSWORD` e salve.
2. Faça um novo deploy (Vercel: **Deployments → … → Redeploy**).
3. Envie a senha nova para as clientes no WhatsApp.

Na hora em que a senha muda, **todo mundo é desconectado** automaticamente e só entra de novo com a senha nova. Dica: trocar a senha periodicamente (ex.: todo mês) reduz o efeito de compartilhamentos.

Como funciona: `proxy.ts` confere, antes de qualquer resposta, um cookie com a "impressão digital" (HMAC) da senha atual; a tela fica em `app/entrar/`; o botão **Sair** fica no rodapé.

## 15. Login individual e área administrativa (futuro)

Se um dia quiser saber quem é cada cliente (e bloquear só quem repassou o acesso), dá para trocar a senha única por login individual sem reconstruir o front-end:

- **Login por cliente:** códigos de acesso por cliente ou autenticação (ex.: Supabase Auth, Auth.js), usando o mesmo `proxy.ts`. O pagamento pode continuar no WhatsApp: ao confirmar, você libera o acesso da cliente.
- **Favoritos na conta:** `lib/storage.ts` concentra favoritos e histórico; basta trocar a implementação para sincronizar com o servidor.
- **Banco de dados / área `/admin`:** todas as páginas leem dados só por `lib/content.ts`. Para usar banco ou CMS, reimplemente essas funções (mesmas assinaturas) e crie `/admin` com formulários para adicionar/editar receita, vídeo, imagem, coleção e categoria. O schema já está pronto em `lib/types.ts`.

Esses serviços têm planos gratuitos para começar, mas podem gerar custo conforme o uso — avalie antes de tornar obrigatório.

## 16. Detalhes técnicos

- **Next.js 16 (App Router)**, React 19, TypeScript, Tailwind CSS 4. Todas as páginas são **estáticas** (geradas no build): carregam rápido e custam quase nada.
- **Imagens:** `scripts/images.mjs` gera WebP 480 px / 1080 px + JPG de prévia; `next/image` com loader próprio escolhe o tamanho certo, com carregamento preguiçoso e cor média como fundo enquanto carrega.
- **Busca:** índice compacto em `/search-index.json` (~290 KB, ~45 KB comprimido), baixado só quando a pessoa abre a busca, Explorar ou Favoritos; busca sem acentos por nome, ingredientes, categorias, coleções e tags.
- **Página inicial:** só imagens e textos; cada fileira mostra até 18 cards; vídeos nunca são carregados na home.
- **Favoritos e "Continue explorando":** `localStorage`, apenas IDs das receitas.
- **SEO:** metadata, canonical, Open Graph, Twitter Cards, `sitemap.xml`, `robots.txt`, manifest e **Schema.org Recipe** apenas com campos reais. Indexação desligada por padrão (`site.config.ts`); com a senha ativa, buscadores também não entram.
- **Acessibilidade:** fonte base de 17 px, alto contraste, botões de no mínimo 44 px, navegação inferior no celular, foco visível, suporte a "reduzir movimento".
- Comandos: `npm run dev`, `npm run build`, `npm run lint`, `npm run images`, `npm run validate`, `npm run import`.
