# Meus Chinelos

Catálogo de chinelos para celular (site instalável, HTML/CSS/JS puro).

## Ver no computador antes de publicar
Na pasta do projeto, rode:
```
python servidor.py
```
e abra http://localhost:8000 (Ctrl+C para parar).

## Editar as informações
Abra `chinelos.json` e preencha `decoracao` e `valor` de cada chinelo, por exemplo:
```
{ "arquivo": "33-34.jpg", "numeracao": "33-34", "decoracao": "Pérolas", "valor": 35 }
```
`valor` pode ser `35`, `35.5` ou `"35,50"`. Depois é só publicar de novo (abaixo).

## Fotos novas
1. Coloque a foto em `imagens/chinelos/` com o nome `NN-NN.jpg` ou `NN-NN (2).jpg`.
2. Rode `python tools/gerar.py` (precisa de `pip install pillow`). Ele cria os WebP e
   acrescenta o chinelo no `chinelos.json` sem apagar o que você já preencheu.
3. Se trocar uma foto mantendo o mesmo nome, aumente `VERSAO` no `sw.js` (ex.: "v2").

## Publicar no GitHub Pages (passo a passo)
**Criar o repositório**
1. Crie conta em https://github.com (grátis) e entre.
2. Clique no **+** (canto superior direito) → **New repository**.
3. Nome: `chinelos`. Marque **Public**. Clique **Create repository**.

**Enviar os arquivos (sem instalar nada)**
4. Na página do repositório vazio, clique em **uploading an existing file**.
5. Arraste para lá TUDO da pasta do projeto, **exceto** as fotos `.jpg` originais
   (pasta `imagens/chinelos` e os `.jpg` soltos): `index.html`, `app.js`, `style.css`,
   `sw.js`, `manifest.webmanifest`, `chinelos.json`, `.nojekyll`, e as pastas
   `icons`, `imagens/thumb` e `imagens/medio`.
   (Se algum arquivo de nome começando com ponto não aparecer, sem problema.)
6. Clique **Commit changes**.

**Ativar o Pages**
7. No repositório: **Settings** → **Pages** (menu da esquerda).
8. Em **Source**: **Deploy from a branch**. Em **Branch**: `main` e pasta `/ (root)` → **Save**.
9. Espere 1–2 minutos e atualize. O endereço aparece no topo:
   `https://SEU-USUARIO.github.io/chinelos/`

**No celular da sua tia**
10. Abra o endereço no Chrome (Android) ou Safari (iPhone) → menu → **Adicionar à tela inicial / Instalar app**.

**Para atualizar depois**: edite o arquivo (ex.: `chinelos.json`) no GitHub (lápis ✏️ → Commit)
ou envie de novo pelo **Add file → Upload files**. O app atualiza sozinho na próxima vez que
abrir com internet, sem sua tia fazer nada. Os "vendidos" ficam salvos no celular dela.
