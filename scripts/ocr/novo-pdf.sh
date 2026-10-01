#!/bin/bash
# Prepara um PDF novo para transcrição.
#   bash scripts/ocr/novo-pdf.sh "/caminho/Meu PDF.pdf" CHAVE
# Gera em content/_import/trabalho/CHAVE/:
#   paginas/*.png   — páginas renderizadas (para conferir e recortar fotos)
#   texto.txt       — texto do PDF (camada de texto, quando existe) ou OCR do macOS
# Depois: transcreva para content/_import/dsl/CHAVE.dsl (veja FORMATO-DSL.md),
# cadastre o PDF em content/_import/sources.json e rode `npm run import`.
set -e
PDF="$1"; KEY="$2"
[ -z "$PDF" ] || [ -z "$KEY" ] && { echo "uso: bash scripts/ocr/novo-pdf.sh arquivo.pdf CHAVE"; exit 1; }
DIR="$(cd "$(dirname "$0")/../.." && pwd)/content/_import/trabalho/$KEY"
mkdir -p "$DIR/paginas"
pdftoppm -r 150 -png "$PDF" "$DIR/paginas/p"
pdftotext -layout "$PDF" "$DIR/texto.txt" || true
if [ "$(tr -d '[:space:]' < "$DIR/texto.txt" | wc -c)" -lt 200 ]; then
  echo "PDF sem texto: usando OCR do macOS (Vision)…"
  BIN="$DIR/../ocr-bin"; [ -x "$BIN" ] || swiftc -O "$(dirname "$0")/ocr.swift" -o "$BIN"
  mkdir -p "$DIR/ocr"; "$BIN" "$DIR/ocr" "$DIR"/paginas/*.png
  python3 "$(dirname "$0")/order.py" "" 0.5 --dir "$DIR/ocr" > "$DIR/texto.txt"
fi
echo "Pronto: $DIR"
