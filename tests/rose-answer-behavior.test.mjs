import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../src/child/rose-activities.js", import.meta.url), "utf8")
  .replace(/^import[^\n]*\n/gm, "")
  .replace(/^export\s+/gm, "");

class FakeElement {
  constructor(tag, text = "") {
    this.tagName = tag.toUpperCase();
    this._text = text;
    this.children = [];
    this.parentNode = null;
    this.className = "";
    this.attributes = {};
    this.disabled = false;
    this.classList = { add: name => { if (!this.className.split(/\s+/).includes(name)) this.className = (this.className + " " + name).trim(); } };
  }
  set textContent(value) { this.replaceChildren(); this._text = String(value ?? ""); }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(""); }
  append(...nodes) { for (const node of nodes.flat()) { if (node == null) continue; if (node.parentNode) node.remove(); node.parentNode = this; this.children.push(node); } }
  replaceChildren(...nodes) { for (const child of this.children) child.parentNode = null; this.children = []; this._text = ""; this.append(...nodes); }
  insertBefore(node, before) { if (node.parentNode) node.remove(); const index = this.children.indexOf(before); node.parentNode = this; this.children.splice(index < 0 ? this.children.length : index, 0, node); }
  remove() { if (!this.parentNode) return; const siblings = this.parentNode.children; const index = siblings.indexOf(this); if (index >= 0) siblings.splice(index, 1); this.parentNode = null; }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  querySelectorAll(selector) {
    const found = [];
    const matches = node => selector === "button" ? node.tagName === "BUTTON" : selector.startsWith(".") ? node.className.split(/\s+/).includes(selector.slice(1)) : false;
    const visit = node => { for (const child of node.children) { if (matches(child)) found.push(child); visit(child); } };
    visit(this); return found;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  click() { if (!this.disabled) this.onClick?.(); }
}

function makeHarness() {
  const app = new FakeElement("div");
  const document = {
    body: new FakeElement("body"),
    querySelector: selector => selector === "#app" ? app : null,
    querySelectorAll: () => [],
  };
  const spoken = [], answers = [], sessions = [];
  const context = {
    document,
    Math: Object.create(Math),
    el(tag, attrs = {}, children = []) {
      const node = new FakeElement(tag);
      for (const [key, value] of Object.entries(attrs)) {
        if (key === "class") node.className = value;
        else if (key === "text") node.textContent = value;
        else node[key] = value;
      }
      node.append(...(Array.isArray(children) ? children : [children]).filter(child => child instanceof FakeElement));
      return node;
    },
    button(label, fn, cls = "button-primary") {
      const node = new FakeElement("button", label); node.className = cls; node.onClick = fn; return node;
    },
    card(children = [], cls = "card") { const node = new FakeElement("section"); node.className = cls; node.append(...children); return node; },
    screen(title, content) { const node = new FakeElement("section"); node.append(new FakeElement("h1", title), content); return node; },
    replaceApp(node) { app.replaceChildren(node); },
    chooseExercise: (_instruction, action) => action,
    getState: () => ({ settings: { voice: true, sounds: false } }),
    recordAnswer: (child, correct) => answers.push({ child, correct }),
    recordSession: child => sessions.push(child),
    speak: message => spoken.push(message),
    cheer: () => {}, gentleOops: () => {},
    successPraise: (_child, _voice, message) => spoken.push(message),
    sessionPraise: () => {}, go: () => {}, startActivity: () => {}, syllableGame: () => {},
    console,
  };
  context.Math.random = () => 0;
  vm.runInNewContext(source, context, { filename: "rose-activities.js" });
  return { context, app, answers, spoken, sessions };
}

for (const mode of ["patterns", "colors", "shapes"]) {
  test("Rose · " + mode + " : une mauvaise réponse puis la bonne font progresser le jeu", () => {
    const { context, app, answers, spoken } = makeHarness();
    const correct = vm.runInNewContext('createRoseQuestion("' + mode + '", () => 0).answer', context);
    context.startRoseActivity(mode);

    let choices = app.querySelector(".answer-grid").querySelectorAll("button");
    assert.equal(choices.length, 3, "Trois réponses doivent être proposées.");
    const wrong = choices.find(choice => !choice.textContent.includes(correct));
    assert.ok(wrong, "Le test doit identifier une mauvaise réponse.");
    assert.doesNotThrow(() => wrong.click(), "Une mauvaise réponse ne doit pas interrompre le gestionnaire.");
    assert.ok(app.querySelector(".feedback")?.textContent, "Une erreur doit produire un retour bienveillant.");
    assert.equal(app.querySelectorAll(".rose-question-next").length, 0, "Pas de bouton suivant après une mauvaise réponse.");

    choices = app.querySelector(".answer-grid").querySelectorAll("button");
    const right = choices.find(choice => choice.textContent.includes(correct));
    assert.ok(right, "La bonne réponse doit être présente.");
    assert.doesNotThrow(() => right.click(), "Une bonne réponse ne doit pas déclencher d'exception.");
    assert.ok(app.querySelector(".feedback")?.textContent, "La réussite doit afficher un retour.");
    assert.equal(app.querySelectorAll(".rose-question-next").length, 1, "Un seul bouton suivant doit apparaître.");
    assert.ok(choices.every(choice => choice.disabled), "Les réponses doivent être désactivées après réussite.");
    assert.equal(answers.filter(item => item.correct).length, 1, "La réussite doit être comptabilisée une seule fois.");
    assert.ok(spoken.length > 0, "Le jeu doit déclencher un retour vocal.");

    app.querySelector(".rose-question-next").click();
    assert.match(app.textContent, /Petit jeu 2 sur 5/, "Le bouton suivant doit afficher la question suivante.");
    assert.equal(app.querySelectorAll(".rose-question-next").length, 0, "L'ancien bouton suivant doit disparaître.");
  });
}
