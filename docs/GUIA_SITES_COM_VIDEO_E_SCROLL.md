# Guia prático: criar sites de marca com vídeo e scroll

Este guia transforma o fluxo usado nos protótipos Casa Miga e Lume em um processo que pode ser repetido para novos cases da ServAgency. A proposta é partir de uma identidade visual, produzir uma cena curta e montar duas experiências possíveis: um filme em loop atrás da página ou uma cena que avança conforme a rolagem.

## O que pode ser automatizado

- Briefing e conteúdo podem nascer de um formulário ou arquivo de configuração.
- A geração de imagens e vídeos pode usar referências para preservar cenário, produto e direção de arte.
- A estrutura do site pode ser montada a partir de um template HTML/CSS/JS com tokens e capítulos definidos em JSON.
- A otimização de mídia, a atualização do manifesto, a validação e o deploy podem rodar em sequência.
- A curadoria final continua humana: escolher as imagens e o take que representam bem a marca evita automatizar um resultado visual incoerente.

Há dois caminhos de geração. No Google Flow, dá para criar ou editar imagens no projeto, usá-las como referências/ingredientes para os clipes e baixar o vídeo gerado. Para uma pipeline semiautomática, mantenha esse passo no Flow e automatize todo o restante após salvar o MP4 na pasta de mídia. Para geração realmente programática, use a API oficial do Gemini/Veo quando a conta, região, modelo e orçamento estiverem habilitados; não automatize cliques nem dependa de endpoints internos do Flow.

## Pipeline recomendado

1. **Defina a tese visual.** Escreva quem é a marca, para quem é o site, qual ação importa e que momento visual explica o produto.
2. **Monte um kit de referências.** Separe logo, paleta, fontes, fotos reais permitidas e uma imagem-mestra do cenário. Reutilize as mesmas imagens como referência para manter continuidade.
3. **Escreva um prompt de cena.** Descreva sujeito, ação, ambiente, enquadramento, luz, lente, movimento, textura e o que deve permanecer estável. Não peça ao modelo que escreva letreiros, preços ou logos dentro do vídeo: esses elementos ficam no HTML.
4. **Gere e aprove o take.** Faça algumas variações, escolha uma e confira mãos, objetos, continuidade, enquadramento e espaço negativo para o texto. Para Flow, use as imagens carregadas no projeto como ingredientes/referências e exporte o vídeo escolhido.
5. **Otimize os arquivos.** Guarde o original fora do build público, produza um MP4 H.264 sem áudio para o fundo, gere um poster WebP/JPEG e use imagens de catálogo comprimidas. O arquivo de vídeo deve carregar sob demanda e nunca bloquear a primeira pintura da página.
6. **Preencha o manifesto do site.** Informe a marca, tema, arquivo de vídeo/poster, modo (`loop` ou `scroll`), capítulos, CTAs, catálogo e pontos de quebra.
7. **Gere a página pelo template.** Construa conteúdo real da marca; não transforme cada seção em um hero vazio. Alterne trechos curtos de texto, imagem/produto, prova e ação.
8. **Revise em desktop e mobile.** Confira primeiro dobra, legibilidade sobre vídeo, corte do assunto, alturas das seções, carrossel por toque/teclado, largura de 320–390 px, carregamento e preferência por movimento reduzido.
9. **Publique e confirme.** Faça preview, confira a URL e recursos de mídia, só então promova para produção. Guarde o SHA do commit e a URL implantada no registro do case.

## Dois modos de vídeo

### A. Vídeo fixo em loop, página independente

Use um `<video>` absoluto, silenciado, `muted`, `loop`, `autoplay` e `playsinline`; o conteúdo da página rola à frente. Use `poster` como fallback, uma camada de contraste local atrás do texto e um controle acessível de pausar/retomar. Prefira um take que funcione em loop e deixe espaço de composição para títulos em mais de um breakpoint.

```html
<video class="site-video" autoplay muted loop playsinline preload="metadata" poster="media/poster.webp" aria-hidden="true">
  <source src="media/brand-film.mp4" type="video/mp4">
</video>
```

```css
.site-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.video-shade { position: absolute; inset: 0; background: linear-gradient(90deg, #10100dd9, #10100d35); }
```

A reprodução automática de vídeo com áudio é bloqueada em muitos navegadores; o fundo deve ser silencioso. `preload="metadata"` limita o trabalho inicial. Respeite `prefers-reduced-motion` usando o poster e mantendo o conteúdo completo.

### B. Vídeo narrativo sincronizado ao scroll

Escolha um clipe com começo, meio e fim claros. Prenda a cena com `position: sticky` durante a seção narrativa e transforme o progresso da rolagem em `video.currentTime`. Troque título, texto e marcador por capítulos definidos no mesmo manifesto. Limite seeks com `requestAnimationFrame` e trate carregamento, seek concorrente, falha do MP4 e movimento reduzido. Deixe os capítulos escritos disponíveis como conteúdo normal abaixo/sem vídeo, para a história continuar legível sem mídia ou animação.

```js
const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / scrollRange));
const targetTime = progress * video.duration;
video.currentTime = targetTime; // na implementação real, limitar a frequência e evitar seeks concorrentes
```

Não use scroll-scrubbing para uma sequência de tomadas independentes que não forma uma progressão. Se cada cena precisar de um corte ou ação separada, use capítulos com transições e uma timeline deliberada. A rolagem deve controlar uma narrativa visual coerente.

## Manifesto que alimenta o template

Use JSON/YAML como fonte única para o conteúdo. O template lê o manifesto e monta a página, os capítulos do modo scroll e os dados do catálogo.

```json
{
  "brand": "Casa Miga",
  "industry": "padaria e café",
  "mode": "scroll",
  "media": {
    "video": "media/miga-story.mp4",
    "poster": "media/miga-poster.webp",
    "alt": "Café sendo servido ao lado de um croissant"
  },
  "chapters": [
    { "title": "A xícara espera.", "copy": "A manhã começa no balcão." },
    { "title": "O café encontra o fundo.", "copy": "A crema se abre devagar." },
    { "title": "A mesa já está posta.", "copy": "Café servido, pão recém-saído." },
    { "title": "A manhã ganha companhia.", "copy": "Tem lugar para mais um." }
  ]
}
```

A automação deve validar que o arquivo de vídeo e poster existem, que todos os capítulos têm texto e que a primeira cena funciona sem JavaScript. Nunca insira texto gerado dentro dos títulos via `innerHTML`; use DOM/texto escapado ou componentes que tratem conteúdo como texto.

## Otimização simples com FFmpeg

Instale FFmpeg por uma fonte confiável e mantenha o arquivo mestre original. Exemplo para um fundo silencioso em 1080p, otimizado para streaming progressivo:

```bash
ffmpeg -i input.mp4 -an -vf "scale='min(1920,iw)':-2:force_original_aspect_ratio=decrease,fps=30" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart public/media/brand-film.mp4
```

O preset/CRF é ponto de partida, não uma garantia de tamanho ou qualidade. Avalie o peso e a textura do resultado. Para o poster, exporte um quadro representativo e converta para WebP/JPEG; sirva imagens de catálogo em tamanhos próximos ao espaço em que aparecem.

## Prompt-base para gerar a página

> Crie um case demonstrativo para [marca/nicho] usando a direção visual aprovada e os arquivos locais em `media/`. Mantenha a cena de vídeo como peça central. Entregue dois modos: `/index.html` com vídeo de fundo em loop enquanto o conteúdo rola e `/scroll.html` com a mesma narrativa visual avançando junto do scroll. Use o manifesto em `content/site.json` como fonte do texto e dos capítulos. Monte um hero, uma explicação curta, catálogo ou serviços reais/ilustrativos claramente identificados, prova de confiança, CTA e rodapé. Reduza espaços verticais sem comprimir a leitura; cada seção deve ter um propósito e uma ligação visual com a anterior. Comece pelo mobile, preserve foco de teclado, contraste sobre imagem, navegação acessível, poster/fallback e `prefers-reduced-motion`. Não adicione dependências sem necessidade. Antes de concluir, verifique os caminhos dos arquivos, console, carrossel, versão mobile e versão desktop. Não publique sem a aprovação da pessoa responsável.

## Estrutura de pastas sugerida

```text
brand-demo/
  content/site.json
  media/
    brand-film.mp4
    brand-poster.webp
    products/
  index.html
  scroll.html
  styles.css
  app.js
  README.md
```

## Lista de revisão

- Vídeo começa sem som, não impede interação e tem poster de fallback.
- A primeira dobra identifica a marca e mostra uma ação clara.
- Nenhuma seção cria grandes vazios sem intenção editorial.
- Texto fica legível em cima das imagens e o fundo de seções claras é realmente opaco.
- Carrossel funciona por toque, mouse e teclado; contador e botões refletem o cartão mais próximo.
- Scroll narrativo alcança todos os capítulos, e modo reduzido mantém texto e poster.
- Mobile não tem overflow horizontal, CTAs cortados ou controles sobrepostos.
- Catálogo fictício está identificado como demonstração; endereço, preços e formulários não fingem processar pedidos.
- Assets têm licença/origem registrada, nomes previsíveis e compressão adequada.
- Secrets e chaves de API ficam no ambiente de build/servidor, nunca no HTML/JS público nem no Git.
- Deploy pronto foi conferido na URL e o SHA publicado corresponde ao commit esperado.

## Fontes oficiais

- [Ajuda do Google Flow: criar vídeos e usar referências/ingredientes](https://support.google.com/flow/answer/16353334)
- [Ajuda do Google Labs: gerir projetos, assets e downloads no Flow](https://support.google.com/labs/answer/16935308)
- [Google AI for Developers: geração de vídeo Veo pela Gemini API](https://ai.google.dev/gemini-api/docs/veo)
- [MDN: elemento `<video>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
