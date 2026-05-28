const R = 0.082057;

const pressureUnits = {
  atm: {
    label: "atm",
    step: "0.01",
    toBase: (value) => value,
    fromBase: (value) => value,
  },
  torr: {
    label: "torr",
    step: "1",
    toBase: (value) => value / 760,
    fromBase: (value) => value * 760,
  },
  kPa: {
    label: "kPa",
    step: "0.1",
    toBase: (value) => value / 101.325,
    fromBase: (value) => value * 101.325,
  },
};

const temperatureUnits = {
  K: {
    label: "K",
    step: "0.01",
    toBase: (value) => value,
    fromBase: (value) => value,
  },
  C: {
    label: "degrees C",
    step: "0.1",
    toBase: (value) => value + 273.15,
    fromBase: (value) => value - 273.15,
  },
};

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

const sliders = {
  P: document.getElementById("PInput"),
  V: document.getElementById("VInput"),
  n: document.getElementById("nInput"),
  T: document.getElementById("TInput"),
};

const numberInputs = {
  P: document.getElementById("PNumber"),
  V: document.getElementById("VNumber"),
  n: document.getElementById("nNumber"),
  T: document.getElementById("TNumber"),
};

const unitSelects = {
  P: document.getElementById("PUnit"),
  T: document.getElementById("TUnit"),
};

const solveFor = document.getElementById("solveFor");
const pvValue = document.getElementById("pvValue");
const nrtValue = document.getElementById("nrtValue");
const balanceStatus = document.getElementById("balanceStatus");
const substitutionText = document.getElementById("substitutionText");
const resultText = document.getElementById("resultText");
const factorInput = document.getElementById("factorInput");
const factorOut = document.getElementById("factorOut");
const massInput = document.getElementById("massInput");
const molarMassText = document.getElementById("molarMassText");
const loadSample = document.getElementById("loadSample");

const formulaText = {
  P: "P = nRT / V",
  V: "V = nRT / P",
  n: "n = PV / RT",
  T: "T = PV / nR",
};

function clampToInputRange(key, value) {
  const input = sliders[key];
  const min = Number(input.min);
  const max = Number(input.max);
  return Math.min(max, Math.max(min, value));
}

function getUnitConfig(key) {
  if (key === "P") {
    return pressureUnits[unitSelects.P.value];
  }

  if (key === "T") {
    return temperatureUnits[unitSelects.T.value];
  }

  return {
    label: units[key],
    step: numberInputs[key].step,
    toBase: (value) => value,
    fromBase: (value) => value,
  };
}

function toBaseValue(key, value) {
  return getUnitConfig(key).toBase(value);
}

function fromBaseValue(key, value) {
  return getUnitConfig(key).fromBase(value);
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
}

function formatValue(value, digits = 2) {
  return Number(value).toFixed(digits);
}

function formatPreciseValue(value, digits = 4) {
  if (Math.abs(value) > 0 && Math.abs(value) < 0.01) {
    return Number(value.toPrecision(4)).toString();
  }

  return Number(value.toFixed(digits)).toString();
}

function formatControlValue(key, value) {
  const displayValue = fromBaseValue(key, value);
  if (key === "n") {
    return formatPreciseValue(displayValue, 6);
  }

  return formatPreciseValue(displayValue, 4);
}

function formatResultValue(key, value) {
  if (key === "n") {
    return formatPreciseValue(value, 6);
  }

  return formatPreciseValue(value, 4);
}

function updateDisplayRanges() {
  ["P", "T"].forEach((key) => {
    const input = numberInputs[key];
    const unit = getUnitConfig(key);
    input.min = formatPreciseValue(unit.fromBase(Number(sliders[key].min)), 4);
    input.max = formatPreciseValue(unit.fromBase(Number(sliders[key].max)), 4);
    input.step = unit.step;
    input.setAttribute("aria-label", `${labels[key]} in ${unit.label}`);
  });
}

function updateControls() {
  const unknown = solveFor.value;
  updateDisplayRanges();
  Object.keys(sliders).forEach((key) => {
    const isUnknown = key === unknown;
    sliders[key].disabled = isUnknown;
    numberInputs[key].disabled = isUnknown;
    sliders[key].value = state[key];
    if (isUnknown || document.activeElement !== numberInputs[key]) {
      numberInputs[key].value = formatControlValue(key, state[key]);
    }
  });
}

function updateBalance() {
  const pv = state.P * state.V;
  const nrt = state.n * R * state.T;
  const delta = Math.abs(pv - nrt);
  const isBalanced = delta < 0.03;

  pvValue.textContent = formatValue(pv);
  nrtValue.textContent = formatValue(nrt);
  balanceStatus.textContent = isBalanced ? "Balanced" : "Limited by input range";
  balanceStatus.classList.toggle("off", !isBalanced);
}

function updateSubstitution() {
  const unknown = solveFor.value;
  const values = {
    P: `${formatResultValue("n", state.n)} * ${R} * ${formatPreciseValue(state.T)} / ${formatPreciseValue(state.V)}`,
    V: `${formatResultValue("n", state.n)} * ${R} * ${formatPreciseValue(state.T)} / ${formatPreciseValue(state.P)}`,
    n: `${formatPreciseValue(state.P)} * ${formatPreciseValue(state.V)} / (${R} * ${formatPreciseValue(state.T)})`,
    T: `${formatPreciseValue(state.P)} * ${formatPreciseValue(state.V)} / (${formatResultValue("n", state.n)} * ${R})`,
  };

  substitutionText.textContent = `${formulaText[unknown]} = ${values[unknown]}`;
  resultText.textContent = `${labels[unknown]} = ${formatResultValue(unknown, state[unknown])} ${units[unknown]}`;
}

function updateMolarMass() {
  const mass = Number(massInput.value);
  if (!Number.isFinite(mass) || mass <= 0 || state.n <= 0) {
    molarMassText.textContent = "Enter a positive mass and mole amount to calculate M = m / n.";
    return;
  }

  const molarMass = mass / state.n;
  molarMassText.textContent =
    `M = m / n = ${formatPreciseValue(mass, 4)} g / ${formatResultValue("n", state.n)} mol = ${formatPreciseValue(molarMass, 2)} g/mol`;
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
  updateMolarMass();
  updateEffects();
}

function updateVariableFromControl(key, control) {
  if (control.value === "") {
    return;
  }

  const nextValue = Number(control.value);
  if (!Number.isFinite(nextValue)) {
    return;
  }

  state[key] = clampToInputRange(key, toBaseValue(key, nextValue));
  render();
}

function updateVariableFromSlider(key, control) {
  const nextValue = Number(control.value);
  if (!Number.isFinite(nextValue)) {
    return;
  }

  state[key] = clampToInputRange(key, nextValue);
  render();
}

Object.entries(sliders).forEach(([key, input]) => {
  input.addEventListener("input", () => {
    updateVariableFromSlider(key, input);
  });
});

Object.entries(numberInputs).forEach(([key, input]) => {
  input.addEventListener("input", () => {
    updateVariableFromControl(key, input);
  });

  input.addEventListener("change", () => {
    input.value = formatControlValue(key, state[key]);
    render();
  });
});

Object.values(unitSelects).forEach((select) => {
  select.addEventListener("change", render);
});

massInput.addEventListener("input", updateMolarMass);

loadSample.addEventListener("click", () => {
  unitSelects.P.value = "torr";
  unitSelects.T.value = "C";
  solveFor.value = "n";
  state.P = pressureUnits.torr.toBase(307);
  state.V = 0.1;
  state.T = temperatureUnits.C.toBase(26);
  massInput.value = "0.0494";
  render();
});

solveFor.addEventListener("change", render);
factorInput.addEventListener("input", updateEffects);

render();
