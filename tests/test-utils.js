const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

class TestElement {
  constructor(id = "") {
    this.id = id;
    this.children = [];
    this.disabled = false;
    this.innerHTML = "";
    this.textContent = "";
    this.style = {};
    this.listeners = {};
    this.classNames = new Set();
    this.classList = {
      add: (...names) => names.forEach(name => this.classNames.add(name)),
      remove: (...names) => names.forEach(name => this.classNames.delete(name)),
      contains: name => this.classNames.has(name),
      replace: (oldName, newName) => {
        this.classNames.delete(oldName);
        this.classNames.add(newName);
      },
      toggle: (name, force) => {
        const shouldAdd = force === undefined ? !this.classNames.has(name) : Boolean(force);
        if (shouldAdd) this.classNames.add(name);
        else this.classNames.delete(name);
        return shouldAdd;
      }
    };
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  getBoundingClientRect() {
    return { left: 0, top: 50, bottom: 90, width: 240, height: 40 };
  }
}

function createDocumentStub() {
  const elements = new Map();
  const allElements = [];

  function makeElement(id = "") {
    const el = new TestElement(id);
    allElements.push(el);
    return el;
  }

  function getElement(id) {
    if (!elements.has(id)) elements.set(id, makeElement(id));
    return elements.get(id);
  }

  const document = {
    body: makeElement("body"),
    createElement: tag => makeElement(tag),
    getElementById: getElement,
    querySelector: selector => {
      if (selector.startsWith("#")) return getElement(selector.slice(1));
      if (selector === ".game-container") return getElement("game-container");
      return getElement(selector);
    },
    querySelectorAll: selector => {
      if (selector.startsWith(".")) {
        const className = selector.slice(1);
        return allElements.filter(el => el.classList.contains(className));
      }
      return [];
    },
    addEventListener: () => {}
  };

  [
    "salary", "savings", "investments", "debt", "health", "happiness",
    "career", "marital-status", "dependents", "age", "life-path",
    "health-bar", "happiness-bar", "stat-diff-panel", "choice-tooltip",
    "question", "choices", "nextBtn", "choice-summary", "progress",
    "life-event-box", "life-event-text", "save-banner", "themeIcon",
    "game-container"
  ].forEach(getElement);

  return document;
}

function createGsapStub() {
  return {
    to: (target, options = {}) => {
      if (typeof options.onComplete === "function") options.onComplete();
      return {};
    },
    from: () => ({}),
    fromTo: () => ({}),
    isTweening: () => false,
    timeline: () => ({
      fromTo() { return this; },
      to(target, options = {}) {
        if (typeof options.onComplete === "function") options.onComplete();
        return this;
      }
    })
  };
}

function createStorageStub(initial = {}) {
  const storage = { ...initial };
  return {
    storage,
    localStorage: {
      getItem: key => Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null,
      setItem: (key, value) => { storage[key] = String(value); },
      removeItem: key => { delete storage[key]; }
    }
  };
}

function createDeterministicMath(randomValue = 0.99) {
  const math = Object.create(Math);
  math.random = () => randomValue;
  return math;
}

function toHostValue(value) {
  if (value === undefined || value === null) return value;
  if (typeof value !== "object") return value;
  return JSON.parse(JSON.stringify(value));
}

function createGameContext(options = {}) {
  const document = createDocumentStub();
  const { storage, localStorage } = createStorageStub(options.storage);
  const context = vm.createContext({
    console,
    document,
    localStorage,
    Math: createDeterministicMath(options.randomValue),
    requestAnimationFrame: fn => fn(),
    setTimeout: fn => fn(),
    window: {},
    gsap: createGsapStub()
  });

  const scriptPath = path.join(__dirname, "..", "script.js");
  const source = fs.readFileSync(scriptPath, "utf8").split("// ─── Event Delegation")[0];
  vm.runInContext(source, context, { filename: "script.js" });

  return {
    context,
    document,
    storage,
    run: code => toHostValue(vm.runInContext(code, context))
  };
}

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
  }
}

module.exports = {
  assert,
  createGameContext,
  test
};
