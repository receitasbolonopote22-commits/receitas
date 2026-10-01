# Formato de transcrição (.dsl)

Os PDFs foram transcritos para arquivos de texto simples (`content/_import/dsl/*.dsl`).
O comando `npm run import` converte esses arquivos em receitas JSON (`content/recipes/`).

```
@doc Nome exato do arquivo.pdf        ← precisa existir em content/_import/sources.json

=== p12                               ← nova receita: p = página do PDF (ou n12 = número da receita)
cat: Café da manhã saudável           ← selo/seção do material (ajuda a categorizar)
title: Panqueca de Banana
desc: Frase de apresentação (opcional)
- 1 banana                            ← ingrediente
-# Recheio                            ← subtítulo de grupo de ingredientes
- 2 colheres de ricota
1. Amasse a banana.                   ← passo numerado
# Montagem                            ← subtítulo de grupo de passos
2. Recheie e dobre.
para: Texto corrido do preparo. Cada frase vira um passo.
yield: 2 porções                      ← rendimento
portion: 1 unidade                    ← porção sugerida
carbs: 12 g por porção                ← carboidratos (como no material)
meta: TEMPO MÉDIO DE PREPARO: 40 MIN  ← linhas de informação (tempo, calorias...) no padrão do material
sweet: Observação sobre adoçante
alert: Alerta sobre consumo moderado
note: Dica ou observação
flag: Algo estranho no material para revisão (não aparece no site)
health: Alegação de saúde do material (guardada, NÃO aparece no site)
mapcat: almoco,jantar                 ← força categorias (slugs), se a automática errar
origTitle: Título original, se você ajustou o título exibido
```

Regras: nunca inventar dados. Se o PDF não informa, simplesmente não escreva a linha.
