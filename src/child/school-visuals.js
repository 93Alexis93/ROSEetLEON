// Illustrations de l’École : SVG et petites mises en page générés localement,
// sans image externe, pour rester légers et hors ligne.
import { el } from "../ui.js";
import { SHAPES_2D, SOLIDS, POSITIONS } from "./school-engine.js";

const NS = "http://www.w3.org/2000/svg";
function svg(viewBox, children, attrs = {}) {
  const node = document.createElementNS(NS, "svg");
  node.setAttribute("viewBox", viewBox);
  node.setAttribute("role", "img");
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const child of children) if (child) node.append(child);
  return node;
}
function s(tag, attrs = {}, text = null) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== null) node.textContent = text;
  return node;
}

/* ---------- Formes ---------- */
export function shapeSvg(name, size = 90) {
  const fill = { rond: "#ff8fb8", carré: "#7cc4ff", triangle: "#ffd166", rectangle: "#8be0a4", losange: "#c9a7ff", pentagone: "#ffb37a", hexagone: "#6fd6d0", octogone: "#ff9a9a" }[name] || "#ccc";
  const common = { fill, stroke: "#2b2b44", "stroke-width": 3, "stroke-linejoin": "round" };
  let shape;
  if (name === "rond") shape = s("circle", { cx: 50, cy: 50, r: 38, ...common });
  else if (name === "carré") shape = s("rect", { x: 14, y: 14, width: 72, height: 72, rx: 2, ...common });
  else if (name === "rectangle") shape = s("rect", { x: 6, y: 26, width: 88, height: 48, rx: 2, ...common });
  else if (name === "triangle") shape = s("polygon", { points: "50,10 92,86 8,86", ...common });
  else if (name === "losange") shape = s("polygon", { points: "50,6 84,50 50,94 16,50", ...common });
  else {
    const n = SHAPES_2D[name]?.sides || 5;
    const pts = Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n + (n === 8 ? Math.PI / 8 : 0);
      return (50 + 40 * Math.cos(a)).toFixed(1) + "," + (52 + 40 * Math.sin(a)).toFixed(1);
    }).join(" ");
    shape = s("polygon", { points: pts, ...common });
  }
  return svg("0 0 100 100", [shape], { width: size, height: size, "aria-label": SHAPES_2D[name]?.name || name, class: "school-shape" });
}

/* ---------- Dé, doigts, boîte de dix ---------- */
const PIPS = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[26, 26], [50, 50], [74, 74]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]], 6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]] };
function dice(value) {
  return svg("0 0 100 100", [s("rect", { x: 5, y: 5, width: 90, height: 90, rx: 18, fill: "#fff", stroke: "#2b2b44", "stroke-width": 4 }), ...PIPS[value].map(([cx, cy]) => s("circle", { cx, cy, r: 9, fill: "#2b2b44" }))], { class: "school-dice", "aria-label": "Un dé" });
}
function fingers(value) {
  const box = el("div", { class: "school-hands", role: "img", "aria-label": value + " doigts levés" });
  const order = [1, 2, 3, 4, 0]; // l’index se lève en premier, le pouce en dernier
  const toHand = n => {
    // Construit une main avec n doigts levés dans l’ordre naturel (index, majeur, annulaire, auriculaire, pouce).
    const raised = new Set(order.slice(0, n));
    const fingersDef = [[18, 46, 34], [32, 22, 54], [46, 16, 60], [60, 22, 54], [73, 30, 44]];
    const parts = [s("rect", { x: 14, y: 70, width: 70, height: 64, rx: 26, fill: "#ffd7b8", stroke: "#9b6b4b", "stroke-width": 3 })];
    fingersDef.forEach(([x, y, h], i) => {
      const up = raised.has(i);
      if (i === 0) parts.push(s("rect", { x: 2, y: up ? 60 : 82, width: 13, height: up ? 36 : 20, rx: 6.5, fill: up ? "#ffd7b8" : "#f1bf9a", stroke: "#9b6b4b", "stroke-width": 3, transform: `rotate(${up ? -28 : 0} 8 92)` }));
      else parts.push(s("rect", { x, y: up ? y : 58, width: 13, height: up ? h : 20, rx: 6.5, fill: up ? "#ffd7b8" : "#f1bf9a", stroke: "#9b6b4b", "stroke-width": 3 }));
    });
    return svg("0 0 100 140", parts, { class: "school-hand" });
  };
  if (value > 5) box.append(toHand(5), toHand(value - 5));
  else box.append(toHand(value));
  return box;
}
function tenframe(value, target = null) {
  const cells = [];
  for (let i = 0; i < 10; i++) {
    const x = 6 + (i % 5) * 38, y = 6 + Math.floor(i / 5) * 38;
    cells.push(s("rect", { x, y, width: 34, height: 34, rx: 6, fill: target !== null && i >= target ? "#eee" : "#fff", stroke: "#2b2b44", "stroke-width": 2.5 }));
    if (i < value) cells.push(s("circle", { cx: x + 17, cy: y + 17, r: 12, fill: "#e5484d" }));
  }
  return svg("0 0 198 86", cells, { class: "school-tenframe", "aria-label": "Boîte de dix avec " + value + " jetons" });
}

/* ---------- Collections ---------- */
function itemsGrid(visual) {
  const wrap = el("div", { class: "school-items", role: "group", "aria-label": visual.count + " images" });
  const total = visual.count + (visual.extra > 0 ? visual.extra : 0);
  for (let i = 0; i < total; i++) {
    const added = i >= visual.count;
    const crossed = visual.crossed && i >= visual.count - visual.crossed;
    const leaving = visual.extra < 0 && i === visual.count - 1;
    const item = el("button", { type: "button", class: "school-item" + (added ? " is-added" : "") + (crossed || leaving ? " is-crossed" : ""), "aria-pressed": "false", "aria-label": "Image " + (i + 1) }, visual.symbol);
    if (visual.tappable !== false) item.addEventListener("click", () => {
      const on = item.getAttribute("aria-pressed") !== "true";
      item.setAttribute("aria-pressed", String(on));
      item.classList.toggle("is-checked", on);
    });
    wrap.append(item);
  }
  return wrap;
}
function twoGroups(v) {
  const group = n => el("div", { class: "school-group" }, Array.from({ length: n }, () => el("span", { text: v.symbol })));
  return el("div", { class: "school-two-groups", role: "img", "aria-label": v.a + " et " + v.b }, [group(v.a), el("span", { class: "school-plus", text: "+" }), group(v.b)]);
}
function train(row) {
  return el("div", { class: "school-train", role: "img", "aria-label": "Un petit train" }, [el("span", { class: "school-train-loco", text: "🚂" }), ...row.map(a => el("span", { class: "school-train-car", text: a }))]);
}
function sequence(items) {
  return el("div", { class: "school-sequence", role: "img", "aria-label": "Une suite d’images" }, [...items.map(x => el("span", { text: x })), el("span", { class: "school-sequence-hole", text: "?" })]);
}

/* ---------- Numération ---------- */
function placeTable(value, highlight) {
  const digits = String(value).split("").reverse();
  const heads = ["u", "d", "c", "um", "dm", "cm", "u. millions", "d. millions", "c. millions"];
  const table = el("table", { class: "school-place-table" });
  const head = el("tr"), body = el("tr");
  for (let i = digits.length - 1; i >= 0; i--) {
    head.append(el("th", { text: heads[i], class: i === highlight ? "is-on" : "" }));
    body.append(el("td", { text: digits[i], class: i === highlight ? "is-on" : "" }));
  }
  table.append(el("thead", {}, head), el("tbody", {}, body));
  return el("div", { class: "school-place-wrap" }, table);
}
function blocks(tens, units) {
  const parts = [];
  for (let t = 0; t < tens; t++) {
    parts.push(s("rect", { x: 4 + t * 16, y: 4, width: 12, height: 100, rx: 2, fill: "#7cc4ff", stroke: "#2b5f8a", "stroke-width": 1.5 }));
    for (let k = 1; k < 10; k++) parts.push(s("line", { x1: 4 + t * 16, x2: 16 + t * 16, y1: 4 + k * 10, y2: 4 + k * 10, stroke: "#2b5f8a", "stroke-width": 0.8 }));
  }
  for (let u = 0; u < units; u++) parts.push(s("rect", { x: 10 + tens * 16 + (u % 3) * 13, y: 70 - Math.floor(u / 3) * 13 + 21, width: 11, height: 11, rx: 1.5, fill: "#ffd166", stroke: "#8a6a10", "stroke-width": 1.2 }));
  const w = 20 + tens * 16 + 42;
  return svg(`0 0 ${w} 108`, parts, { class: "school-blocks", "aria-label": tens + " barres de dix et " + units + " cubes" });
}
function classes(value) {
  const text = String(value).padStart(9, " ");
  const groups = [text.slice(0, 3), text.slice(3, 6), text.slice(6)].map(x => x.trim());
  const table = el("table", { class: "school-place-table" });
  table.append(el("thead", {}, el("tr", {}, ["millions", "mille", "unités"].map(h => el("th", { text: h })))), el("tbody", {}, el("tr", {}, groups.map(g => el("td", { text: g })))));
  return el("div", { class: "school-place-wrap" }, table);
}

/* ---------- Grandeurs ---------- */
function bars(list) {
  const parts = [s("line", { x1: 10, x2: 10, y1: 4, y2: 12 + list.length * 30, stroke: "#2b2b44", "stroke-width": 3, "stroke-dasharray": "4 3" })];
  list.forEach((b, i) => {
    parts.push(s("rect", { x: 10, y: 10 + i * 30, width: b.length * 22, height: 18, rx: 9, fill: b.color }));
  });
  return svg(`0 0 270 ${20 + list.length * 30}`, parts, { class: "school-bars", "aria-label": "Des rubans de couleur" });
}
function ruler(v) {
  const unit = 26, w = (v.max + 1) * unit + 20;
  const parts = [s("rect", { x: 6, y: 46, width: w - 12, height: 44, rx: 6, fill: "#fff6d8", stroke: "#8a6a10", "stroke-width": 2 })];
  for (let i = 0; i <= v.max; i++) {
    const x = 14 + i * unit;
    parts.push(s("line", { x1: x, x2: x, y1: 46, y2: 64, stroke: "#5a4508", "stroke-width": 2 }));
    parts.push(s("text", { x, y: 82, "text-anchor": "middle", "font-size": 13, fill: "#5a4508", "font-weight": 700 }, String(i)));
    if (i < v.max) parts.push(s("line", { x1: x + unit / 2, x2: x + unit / 2, y1: 46, y2: 56, stroke: "#5a4508", "stroke-width": 1 }));
  }
  parts.push(s("rect", { x: 14 + v.start * unit, y: 26, width: v.length * unit, height: 10, rx: 5, fill: "#e5484d" }));
  return svg(`0 0 ${w} 96`, parts, { class: "school-ruler", "aria-label": "Une règle graduée en centimètres et un trait rouge" });
}
function clock(h, m) {
  const parts = [s("circle", { cx: 60, cy: 60, r: 54, fill: "#fff", stroke: "#2b2b44", "stroke-width": 4 })];
  for (let i = 1; i <= 12; i++) {
    const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
    parts.push(s("text", { x: 60 + 41 * Math.cos(a), y: 65 + 41 * Math.sin(a), "text-anchor": "middle", "font-size": 13, "font-weight": 800, fill: "#2b2b44" }, String(i)));
  }
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * 2 * Math.PI;
    const r1 = i % 5 === 0 ? 48 : 51;
    parts.push(s("line", { x1: 60 + r1 * Math.sin(a), y1: 60 - r1 * Math.cos(a), x2: 60 + 53 * Math.sin(a), y2: 60 - 53 * Math.cos(a), stroke: "#2b2b44", "stroke-width": i % 5 === 0 ? 2 : 1 }));
  }
  const hourAngle = ((h % 12) + m / 60) * 30, minAngle = m * 6;
  const hand = (deg, len, width, color) => s("line", { x1: 60, y1: 60, x2: 60 + len * Math.sin(deg * Math.PI / 180), y2: 60 - len * Math.cos(deg * Math.PI / 180), stroke: color, "stroke-width": width, "stroke-linecap": "round" });
  parts.push(hand(hourAngle, 26, 6, "#e5484d"), hand(minAngle, 40, 3.5, "#243b73"), s("circle", { cx: 60, cy: 60, r: 4, fill: "#2b2b44" }));
  return svg("0 0 120 120", parts, { class: "school-clock", "aria-label": "Une horloge : petite aiguille rouge, grande aiguille bleue" });
}
function money(items) {
  return el("div", { class: "school-money", role: "img", "aria-label": items.join(" euros, ") + " euros" }, items.map(v => v >= 5
    ? el("span", { class: "school-bill school-bill-" + v, text: v + " €" })
    : el("span", { class: "school-coin school-coin-" + v, text: v + " €" })));
}
function polygonSides(v) {
  const label = (x, y, t) => s("text", { x, y, "text-anchor": "middle", "font-size": 13, "font-weight": 800, fill: "#243b73" }, t + " cm");
  const style = { fill: "#e9f4ff", stroke: "#2b2b44", "stroke-width": 3, "stroke-linejoin": "round" };
  if (v.shape === "triangle") {
    const [a, b, c] = v.sides;
    return svg("0 0 200 150", [s("polygon", { points: "30,125 170,125 95,25", ...style }), label(100, 143, a), label(150, 72, b), label(48, 72, c)], { class: "school-figure", "aria-label": `Triangle de côtés ${a}, ${b} et ${c} cm` });
  }
  const [L, l] = v.sides;
  const w = v.shape === "carré" ? 100 : 150, h = v.shape === "carré" ? 100 : 80;
  return svg("0 0 210 150", [s("rect", { x: 105 - w / 2, y: 70 - h / 2, width: w, height: h, ...style }), label(105, 70 + h / 2 + 18, L), label(105 + w / 2 + 22, 75, l)], { class: "school-figure", "aria-label": `${v.shape} de ${L} cm sur ${l} cm` });
}
function grid(w, h) {
  const c = Math.min(26, Math.floor(240 / w));
  const parts = [];
  for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) parts.push(s("rect", { x: 4 + i * c, y: 4 + j * c, width: c, height: c, fill: "#8be0a4", stroke: "#24704a", "stroke-width": 1.5 }));
  return svg(`0 0 ${w * c + 8} ${h * c + 8}`, parts, { class: "school-area", "aria-label": "Un rectangle quadrillé" });
}
function angle(deg) {
  const r = 70, cx = 30, cy = 110;
  const a = deg * Math.PI / 180;
  const parts = [
    s("line", { x1: cx, y1: cy, x2: cx + 120, y2: cy, stroke: "#2b2b44", "stroke-width": 4, "stroke-linecap": "round" }),
    s("line", { x1: cx, y1: cy, x2: cx + 100 * Math.cos(a), y2: cy - 100 * Math.sin(a), stroke: "#2b2b44", "stroke-width": 4, "stroke-linecap": "round" })
  ];
  if (deg === 90) parts.push(s("path", { d: `M${cx + 18},${cy} L${cx + 18},${cy - 18} L${cx},${cy - 18}`, fill: "none", stroke: "#e5484d", "stroke-width": 3 }));
  else parts.push(s("path", { d: `M${cx + 26},${cy} A26,26 0 0 0 ${cx + 26 * Math.cos(a)},${cy - 26 * Math.sin(a)}`, fill: "none", stroke: "#e5484d", "stroke-width": 3 }));
  return svg("-60 0 230 125", parts, { class: "school-angle", "aria-label": "Un angle" });
}
function grid2(v) {
  const c = 40, parts = [];
  const letters = "ABCDEF";
  for (let i = 0; i < v.cols; i++) parts.push(s("text", { x: 40 + i * c + c / 2, y: 18 + v.rows * c + 18, "text-anchor": "middle", "font-size": 15, "font-weight": 800, fill: "#243b73" }, letters[i]));
  for (let j = 0; j < v.rows; j++) parts.push(s("text", { x: 22, y: 18 + (v.rows - 1 - j) * c + c / 2 + 5, "text-anchor": "middle", "font-size": 15, "font-weight": 800, fill: "#243b73" }, String(j + 1)));
  for (let i = 0; i < v.cols; i++) for (let j = 0; j < v.rows; j++) parts.push(s("rect", { x: 40 + i * c, y: 18 + j * c, width: c, height: c, fill: (i + j) % 2 ? "#f4f8ff" : "#fff", stroke: "#9fb3d9", "stroke-width": 1.5 }));
  const [ax, ay] = v.at;
  parts.push(s("text", { x: 40 + ax * c + c / 2, y: 18 + (v.rows - 1 - ay) * c + c / 2 + 9, "text-anchor": "middle", "font-size": 26 }, v.symbol));
  return svg(`0 0 ${50 + v.cols * c} ${44 + v.rows * c}`, parts, { class: "school-grid2", "aria-label": "Un quadrillage avec des lettres en bas et des nombres à gauche" });
}
function lines(rel) {
  const st = { stroke: "#243b73", "stroke-width": 4, "stroke-linecap": "round" };
  let l1, l2;
  if (rel === "parallèles") { l1 = s("line", { x1: 10, y1: 40, x2: 210, y2: 20, ...st }); l2 = s("line", { x1: 10, y1: 100, x2: 210, y2: 80, ...st, stroke: "#e5484d" }); }
  else if (rel === "perpendiculaires") { l1 = s("line", { x1: 20, y1: 60, x2: 200, y2: 60, ...st }); l2 = s("line", { x1: 110, y1: 5, x2: 110, y2: 115, ...st, stroke: "#e5484d" }); }
  else { l1 = s("line", { x1: 15, y1: 90, x2: 205, y2: 30, ...st }); l2 = s("line", { x1: 40, y1: 10, x2: 170, y2: 115, ...st, stroke: "#e5484d" }); }
  return svg("0 0 220 120", [l1, l2], { class: "school-lines", "aria-label": "Deux droites" });
}
function chart(v) {
  const max = Math.max(...v.values), top = Math.max(5, Math.ceil(max / 5) * 5);
  const H = 150, W = 60 * v.names.length + 50;
  const parts = [];
  const step = top <= 10 ? 1 : top <= 20 ? 2 : 5;
  for (let y = 0; y <= top; y += step) {
    const py = 10 + H - (y / top) * H;
    parts.push(s("line", { x1: 36, x2: W, y1: py, y2: py, stroke: "#e2e6f0", "stroke-width": 1 }));
    parts.push(s("text", { x: 30, y: py + 4, "text-anchor": "end", "font-size": 11, fill: "#51586a" }, String(y)));
  }
  const colors = ["#7cc4ff", "#ff8fb8", "#ffd166", "#8be0a4"];
  v.values.forEach((val, i) => {
    const h = (val / top) * H;
    parts.push(s("rect", { x: 48 + i * 60, y: 10 + H - h, width: 38, height: h, rx: 5, fill: colors[i % 4], stroke: "#2b2b44", "stroke-width": 1.5 }));
    parts.push(s("text", { x: 67 + i * 60, y: H + 28, "text-anchor": "middle", "font-size": 12, "font-weight": 800, fill: "#2b2b44" }, v.names[i]));
  });
  return svg(`0 0 ${W} ${H + 36}`, parts, { class: "school-chart", "aria-label": "Diagramme en barres : nombre de " + v.unit });
}
function fractionShape(num, den, shape, size = 160) {
  const parts = [];
  if (shape === "disc") {
    for (let i = 0; i < den; i++) {
      const a1 = (i / den) * 2 * Math.PI - Math.PI / 2, a2 = ((i + 1) / den) * 2 * Math.PI - Math.PI / 2;
      const large = a2 - a1 > Math.PI ? 1 : 0;
      parts.push(s("path", { d: `M60,60 L${60 + 50 * Math.cos(a1)},${60 + 50 * Math.sin(a1)} A50,50 0 ${large} 1 ${60 + 50 * Math.cos(a2)},${60 + 50 * Math.sin(a2)} Z`, fill: i < num ? "#ff8fb8" : "#fff", stroke: "#2b2b44", "stroke-width": 2.5 }));
    }
    return svg("0 0 120 120", parts, { width: size, height: size, class: "school-fraction", "aria-label": "Un disque partagé en " + den + " parts égales" });
  }
  const w = 220 / den;
  for (let i = 0; i < den; i++) parts.push(s("rect", { x: 5 + i * w, y: 5, width: w, height: 50, fill: i < num ? "#7cc4ff" : "#fff", stroke: "#2b2b44", "stroke-width": 2.5 }));
  return svg("0 0 230 60", parts, { class: "school-fraction school-fraction-bar", "aria-label": "Une bande partagée en " + den + " parts égales" });
}
function bag(items) {
  return el("div", { class: "school-bag", role: "img", "aria-label": "Un sac de boules" }, [el("span", { class: "school-bag-icon", text: "👜" }), el("div", {}, items.flatMap(([emoji, n]) => Array.from({ length: n }, () => el("span", { text: emoji }))))]);
}

/** Représente « a/b » comme une vraie fraction (barre horizontale). */
export function fractionNode(text) {
  const [n, d] = String(text).split("/");
  return el("span", { class: "frac", "aria-label": n + " sur " + d }, [el("span", { class: "frac-num", text: n }), el("span", { class: "frac-den", text: d })]);
}
/** Remplace les « a/b » d’un texte par de vraies fractions. */
export function richText(text) {
  const wrap = el("span");
  const parts = String(text).split(/(\d+\/\d+)/g);
  for (const part of parts) {
    if (/^\d+\/\d+$/.test(part)) wrap.append(fractionNode(part));
    else if (part) wrap.append(document.createTextNode(part));
  }
  return wrap;
}

/** Contenu d’un bouton de réponse selon le style de la question. */
export function choiceContent(question, choice) {
  const style = question.choiceStyle;
  if (style === "shape") return el("span", { class: "choice-visual" }, [shapeSvg(choice, 74), el("span", { class: "choice-caption", text: choice })]);
  if (style === "solid") return el("span", { class: "choice-visual" }, [el("span", { class: "choice-emoji", text: SOLIDS[choice]?.emoji || "?" }), el("span", { class: "choice-caption", text: choice })]);
  if (style === "group") return el("span", { class: "choice-group", "aria-label": choice + " images" }, Array.from({ length: Number(choice) }, () => el("span", { text: question.visual?.symbol || "●" })));
  if (style === "color") {
    const colors = { rouge: "#e5484d", bleu: "#3b82f6", vert: "#22a06b", jaune: "#f2b705", violet: "#8e4ec6" };
    return el("span", { class: "choice-visual" }, [el("span", { class: "choice-swatch", style: "background:" + (colors[choice] || "#ccc") }), el("span", { class: "choice-caption", text: choice })]);
  }
  if (style === "scene") return scene(choice, question.visual?.symbol || "🐱");
  if (style === "fraction") return fractionNode(choice);
  if (style === "emoji") return el("span", { class: "choice-emoji", text: choice });
  if (style === "words") return el("span", { class: "choice-words", text: choice });
  return richText(choice);
}
function scene(position, animal) {
  const box = el("span", { class: "scene scene-" + position.replace(" ", "-"), "aria-label": POSITIONS[position] || position });
  box.append(el("span", { class: "scene-box", text: "📦" }), el("span", { class: "scene-animal", text: animal }));
  return box;
}

/** Illustration principale d’une question (ou null). */
export function renderVisual(visual) {
  if (!visual) return null;
  switch (visual.type) {
    case "items": return itemsGrid(visual);
    case "dice": return el("div", { class: "school-visual-center" }, dice(visual.value));
    case "fingers": return fingers(visual.value);
    case "tenframe": return el("div", { class: "school-visual-center" }, tenframe(visual.value, visual.target ?? null));
    case "twoGroups": return twoGroups(visual);
    case "train": return train(visual.row);
    case "sequence": return sequence(visual.items);
    case "placeTable": return placeTable(visual.value, visual.highlight);
    case "blocks": return el("div", { class: "school-visual-center" }, blocks(visual.tens, visual.units));
    case "classes": return classes(visual.value);
    case "bars": return el("div", { class: "school-visual-center" }, bars(visual.bars));
    case "ruler": return el("div", { class: "school-visual-scroll" }, ruler(visual));
    case "clock": return el("div", { class: "school-visual-center" }, clock(visual.h, visual.m));
    case "money": return money(visual.items);
    case "polygonSides": return el("div", { class: "school-visual-center" }, polygonSides(visual));
    case "grid": return el("div", { class: "school-visual-center" }, grid(visual.w, visual.h));
    case "angle": return el("div", { class: "school-visual-center" }, angle(visual.deg));
    case "shape": return el("div", { class: "school-visual-center" }, shapeSvg(visual.shape, 130));
    case "solidEmoji": return el("div", { class: "school-visual-center school-big-emoji", text: SOLIDS[visual.solid]?.emoji || "" });
    case "grid2": return el("div", { class: "school-visual-center" }, grid2(visual));
    case "lines": return el("div", { class: "school-visual-center" }, lines(visual.rel));
    case "chart": return el("div", { class: "school-visual-center" }, chart(visual));
    case "fraction": return el("div", { class: "school-visual-center" }, fractionShape(visual.num, visual.den, visual.shape));
    case "fractionCompare": return el("div", { class: "school-visual-stack" }, [fractionShape(visual.a, visual.b, "bar"), fractionShape(visual.c, visual.d, "bar")]);
    case "bag": return bag(visual.items);
    default: return null;
  }
}
