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
