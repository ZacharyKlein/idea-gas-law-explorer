# Ideal Gas Law Explorer

A static, browser-based learning app for exploring how the Ideal Gas Law connects to Boyle's, Charles', Gay-Lussac's, and Avogadro's laws.

Live site: https://zacharyklein.github.io/idea-gas-law-explorer/

## What It Shows

- A visual equation map connecting the simple gas laws to `PV = nRT`
- Interactive pressure, volume, mole, and temperature inputs
- Unit-aware pressure input for `atm`, `torr`, and `kPa`
- Temperature input in `K` or `C`
- Step-by-step substitution for the selected unknown
- Cause-and-effect cards for the simple gas laws
- A molar mass calculator using `M = m / n`

## How To Use

1. Choose the variable to solve for from the **Solve for** menu.
2. Enter the known gas-state values using either the sliders or the numeric inputs.
3. Use the unit selectors when a problem gives pressure in `torr` or `kPa`, or temperature in Celsius.
4. Read the **Substitution** box to follow the algebra and see the calculated result.
5. To calculate molar mass, enter the gas mass in grams in the **Molar Mass** panel. The app uses the solved mole amount to compute `M = m / n`.

## Sample Problem

The **Use sample problem** button fills in this example:

> What is the molar mass of a gas if 0.0494 g of the gas occupies a volume of 0.100 L at a temperature of 26 C and a pressure of 307 torr?

The app converts the values into Ideal Gas Law units, solves for moles, then calculates:

```text
n = 0.001646 mol
M = 30.02 g/mol
```

## Local Development

This is a plain static site. You can open `index.html` directly, or run a local server from the repo root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/
```

## Social Preview Asset

The Open Graph preview image is committed at `assets/og-image.png`. To regenerate it after design or copy changes:

```bash
python3 tools/generate-og-image.py
```

The generator uses Pillow and local system fonts.
