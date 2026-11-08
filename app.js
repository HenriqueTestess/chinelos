(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const CHAVE = "chinelos-vendidos";
  let itens = [], vendidos = new Set(), faixaAtual = null, aberto = null;

  // vendidos ficam no localStorage do celular
  try { vendidos = new Set(JSON.parse(localStorage.getItem(CHAVE) || "[]")); } catch (e) {}
  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify([...vendidos])); } catch (e) {} };

  // "33-34 (2).jpg" -> "33-34_2.webp"
  const slug = a => a.replace(/\.[^.]+$/, "").replace(/\s*\((\d+)\)/, "_$1");
  const thumb = i => "imagens/thumb/" + slug(i.arquivo) + ".webp";
  const medio = i => "imagens/medio/" + slug(i.arquivo) + ".webp";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function formatarValor(v) {
    if (v === "" || v == null) return null;
    const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", "."));
    return isNaN(n) ? String(v) : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  const faixas = () => [...new Set(itens.map(i => i.numeracao))].sort((a, b) => parseInt(a) - parseInt(b));

  function desenharAbas() {
    const nav = $("abas"); nav.innerHTML = "";
    faixas().forEach(f => {
      const livres = itens.filter(i => i.numeracao === f && !vendidos.has(i.arquivo)).length;
      const b = document.createElement("button");
      b.className = "aba"; b.type = "button"; b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", f === faixaAtual);
      b.innerHTML = f + " <small>(" + livres + ")</small>";
      b.onclick = () => {
        faixaAtual = f;
        try { localStorage.setItem("faixa", f); } catch (e) {}
        desenhar(); window.scrollTo(0, 0);
      };
      nav.appendChild(b);
    });
    const ativa = nav.querySelector('[aria-selected="true"]');
    if (ativa) ativa.scrollIntoView({ inline: "center", block: "nearest" });
  }

  function desenharGrade() {
    const g = $("grade"); g.innerHTML = "";
    itens.filter(i => i.numeracao === faixaAtual).forEach(i => {
      const v = vendidos.has(i.arquivo);
      const b = document.createElement("button");
      b.className = "cartao" + (v ? " vendido" : ""); b.type = "button";
      b.innerHTML = '<img loading="lazy" alt="Chinelo ' + i.numeracao + '" src="' + thumb(i) + '">' +
        (v ? '<span class="selo">VENDIDO</span>' : "") +
        '<span class="leg">' + i.numeracao + (i.decoracao ? " · " + esc(i.decoracao) : "") + "</span>";
      b.onclick = () => abrir(i);
      g.appendChild(b);
    });
  }

  function desenhar() {
    desenharAbas(); desenharGrade();
    const nv = itens.filter(i => vendidos.has(i.arquivo)).length;
    $("resumo").textContent = (itens.length - nv) + " à venda · " + nv + " vendidos";
  }

  function abrir(i, empurrar = true) {
    aberto = i;
    $("d-foto").src = medio(i);
    $("d-foto").alt = "Chinelo " + i.numeracao;
    $("d-num").textContent = i.numeracao;
    const dec = $("d-dec"), val = $("d-val"), fv = formatarValor(i.valor);
    dec.textContent = i.decoracao || "A definir"; dec.className = i.decoracao ? "" : "vazio";
    val.textContent = fv || "A definir"; val.className = fv ? "" : "vazio";
    atualizarBotao();
    $("d-msg").hidden = true;
    $("detalhe").hidden = false; $("detalhe").scrollTop = 0;
    document.body.style.overflow = "hidden";
    if (empurrar) history.pushState({ d: 1 }, "");
  }

  function atualizarBotao() {
    const v = vendidos.has(aberto.arquivo), b = $("d-botao");
    b.textContent = v ? "Desfazer venda" : "Marcar como vendido";
    b.className = "botao" + (v ? " desfazer" : "");
    $("d-selo").hidden = !v;
  }

  function fechar() {
    $("detalhe").hidden = true; document.body.style.overflow = ""; aberto = null; desenhar();
  }

  $("d-botao").onclick = () => {
    const a = aberto.arquivo;
    if (vendidos.has(a)) vendidos.delete(a); else vendidos.add(a);
    salvar(); atualizarBotao();
  };
  // Compartilhar só a imagem (JPEG, sem link nem texto) -> abre a lista de apps do celular
  async function fotoComoArquivo(i) {
    const img = new Image();
    img.src = medio(i);
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const x = c.getContext("2d");
    x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height);
    x.drawImage(img, 0, 0);
    const blob = await new Promise(r => c.toBlob(r, "image/jpeg", 0.92));
    return new File([blob], "chinelo-" + i.numeracao + ".jpg", { type: "image/jpeg" });
  }
  $("d-compartilhar").onclick = async () => {
    const btn = $("d-compartilhar"), msg = $("d-msg");
    msg.hidden = true; btn.disabled = true;
    try {
      const arq = await fotoComoArquivo(aberto);
      if (!navigator.canShare || !navigator.canShare({ files: [arq] })) throw new Error("sem-suporte");
      await navigator.share({ files: [arq] });
    } catch (e) {
      if (e.name !== "AbortError") {
        msg.textContent = "Este celular não permitiu compartilhar. Use o Chrome (Android) ou o Safari (iPhone) com o app aberto pelo endereço do site.";
        msg.hidden = false;
      }
    }
    btn.disabled = false;
  };

  $("voltar").onclick = () => { if (history.state && history.state.d) history.back(); else fechar(); };
  addEventListener("popstate", () => { if (!$("detalhe").hidden) fechar(); });

  async function iniciar() {
    try {
      const r = await fetch("chinelos.json", { cache: "no-cache" });
      if (!r.ok) throw new Error(r.status);
      itens = await r.json();
    } catch (e) {
      $("aviso").hidden = false;
      $("aviso").textContent = "Não consegui carregar a lista de chinelos. Abra o app com internet uma vez.";
      return;
    }
    let salva = null;
    try { salva = localStorage.getItem("faixa"); } catch (e) {}
    const fs = faixas();
    faixaAtual = fs.includes(salva) ? salva : fs[0];
    desenhar();
  }
  iniciar();

  if ("serviceWorker" in navigator) {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
