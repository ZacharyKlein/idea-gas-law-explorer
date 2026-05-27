const R = 0.082057;

const state = {
  P: 1,
  V: 24.47,
  n: 1,
  T: 298.15,
};

const units = {
  P: "atm",
  V: "L",
  n: "mol",
  T: "K",
};

const labels = {
  P: "Pressure",
  V: "Volume",
  n: "Moles",
  T: "Temperature",
};

const inputs = {
  P: document.getElementById("PInput"),
  V: document.getElementById("VInput"),
  n: document.getElementById("nInput"),
  T: document.getElementById("TInput"),
};

const outputs = {
  P: document.getElementById("POut"),
  V: document.getElementById("VOut"),
  n: document.getElementById("nOut"),
  T: document.getElementById("TOut"),
};

const solveFor = document.getElementById("solveFor");
const pvValue = document.getElementById("pvValue");
const nrtValue = document.getElementById("nrtValue");
const balanceStatus = document.getElementById("balanceStatus");
const substitutionText = document.getElementById("substitutionText");
const resultText = document.getElementById("resultText");
const factorInput = document.getElementById("factorInput");
const factorOut = document.getElementById("factorOut");

const formulaText = {
  P: "P = nRT / V",
  V: "V = nRT / P",
  n: "n = PV / RT",
  T: "T = PV / nR",
};

function clampToInputRange(key, value) {
  const input = inputs[key];
  const min = Number(input.min);
  const max = Number(input.max);
  return Math.min(max, Math.max(min, value));
}

function solveUnknown() {
  const unknown = solveFor.value;
  let value = state[unknown];

  if (unknown === "P") {
    value = (state.n * R * state.T) / state.V;
  } else if (unknown === "V") {
    value = (state.n * R * state.T) / state.P;
  } else if (unknown === "n") {
    value = (state.P * state.V) / (R * state.T);
  } else if (unknown === "T") {
    value = (state.P * state.V) / (state.n * R);
  }

  state[unknown] = clampToInputRange(unknown, value);
  inputs[unknown].value = state[unknown];
}

function formatValue(value, digits = 2) {
  return Number(value).toFixed(digits);
}

function updateControls() {
  const unknown = solveFor.value;
  Object.keys(inputs).forEach((key) => {
    inputs[key].disabled = key === unknown;
    outputs[key].value = formatValue(state[key]);
  });
}

function updateBalance() {
  const pv = state.P * state.V;
  const nrt = state.n * R * state.T;
  const delta = Math.abs(pv - nrt);
  const isBalanced = delta < 0.03;

  pvValue.textContent = formatValue(pv);
  nrtValue.textContent = formatValue(nrt);
  balanceStatus.textContent = isBalanced ? "Balanced" : "Limited by slider";
  balanceStatus.classList.toggle("off", !isBalanced);
}

function updateSubstitution() {
  const unknown = solveFor.value;
  const values = {
    P: `${formatValue(state.n)} * ${R} * ${formatValue(state.T)} / ${formatValue(state.V)}`,
    V: `${formatValue(state.n)} * ${R} * ${formatValue(state.T)} / ${formatValue(state.P)}`,
    n: `${formatValue(state.P)} * ${formatValue(state.V)} / (${R} * ${formatValue(state.T)})`,
    T: `${formatValue(state.P)} * ${formatValue(state.V)} / (${formatValue(state.n)} * ${R})`,
  };

  substitutionText.textContent = `${formulaText[unknown]} = ${values[unknown]}`;
  resultText.textContent = `${labels[unknown]} = ${formatValue(state[unknown])} ${units[unknown]}`;
}

function updateEffects() {
  const factor = Number(factorInput.value);
  const inverse = 1 / factor;
  factorOut.value = formatValue(factor);

  document.getElementById("boyleEffect").textContent =
    `If V becomes ${formatValue(factor)}x, P becomes ${formatValue(inverse)}x.`;
  document.getElementById("charlesEffect").textContent =
    `If T becomes ${formatValue(factor)}x, V becomes ${formatValue(factor)}x.`;
  document.getElementById("gayEffect").textContent =
    `If T becomes ${formatValue(factor)}x, P becomes ${formatValue(factor)}x.`;
  document.getElementById("avogadroEffect").textContent =
    `If n becomes ${formatValue(factor)}x, V becomes ${formatValue(factor)}x.`;
}

function render() {
  solveUnknown();
  updateControls();
  updateBalance();
  updateSubstitution();
  updateEffects();
}

Object.entries(inputs).forEach(([key, input]) => {
  input.addEventListener("input", () => {
    state[key] = Number(input.value);
    render();
  });
});

solveFor.addEventListener("change", render);
factorInput.addEventListener("input", updateEffects);

render();
