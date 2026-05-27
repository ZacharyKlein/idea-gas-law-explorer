from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "og-image.png"

WIDTH = 1200
HEIGHT = 630

INK = "#1d2630"
MUTED = "#657386"
PAPER = "#fbfaf7"
LINE_RED = "#f0dedb"
LINE_TEAL = "#dceceb"
PRESSURE = "#c3423f"
VOLUME = "#247b7b"
TEMPERATURE = "#d88728"
AMOUNT = "#4d66c4"
IDEAL = "#263238"
WHITE = "#ffffff"


def font(path, size):
    return ImageFont.truetype(path, size=size)


FONT_DIR = Path("/System/Library/Fonts/Supplemental")
SANS_BOLD = font(FONT_DIR / "Arial Bold.ttf", 34)
SANS_BLACK = font(FONT_DIR / "Arial Black.ttf", 82)
SANS_BODY = font(FONT_DIR / "Arial.ttf", 30)
SANS_NODE = font(FONT_DIR / "Arial Bold.ttf", 25)
SANS_SMALL = font(FONT_DIR / "Arial Bold.ttf", 19)
SERIF_EQUATION = font(FONT_DIR / "Georgia Bold.ttf", 66)


def draw_text(draw, xy, text, fill, font_obj, **kwargs):
    draw.text(xy, text, fill=fill, font=font_obj, **kwargs)


def draw_grid(draw):
    for x in range(0, WIDTH, 38):
        draw.line((x, 0, x, HEIGHT), fill=LINE_TEAL, width=1)
    for y in range(0, HEIGHT, 38):
        draw.line((0, y, WIDTH, y), fill=LINE_RED, width=1)


def draw_equation(draw):
    x, y, w, h = 758, 86, 370, 220
    draw.rounded_rectangle((x + 12, y + 18, x + w + 12, y + h + 18), radius=18, fill=(32, 45, 61, 30))
    draw.rounded_rectangle((x, y, x + w, y + h), radius=18, fill="#fffdf8", outline="#9aa4ad", width=4)

    parts = [("P", PRESSURE), ("V", VOLUME), (" = ", INK), ("n", AMOUNT), ("R", INK), ("T", TEMPERATURE)]
    widths = [draw.textlength(text, font=SERIF_EQUATION) for text, _ in parts]
    start_x = x + (w - sum(widths)) / 2
    baseline_y = y + 75

    cursor = start_x
    for text, color in parts:
        draw_text(draw, (cursor, baseline_y), text, color, SERIF_EQUATION)
        cursor += draw.textlength(text, font=SERIF_EQUATION)


def draw_node(draw, xy, title, formula, color):
    x, y = xy
    w, h = 198, 92
    draw.rounded_rectangle((x + 6, y + 10, x + w + 6, y + h + 10), radius=14, fill=(32, 45, 61, 20))
    draw.rounded_rectangle((x, y, x + w, y + h), radius=14, fill=WHITE, outline=color, width=4)
    draw_text(draw, (x + 18, y + 17), title, INK, SANS_NODE)
    draw_text(draw, (x + 18, y + 52), formula, MUTED, SANS_SMALL)


def main():
    image = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
    draw = ImageDraw.Draw(image, "RGBA")

    draw_grid(draw)

    draw_text(draw, (72, 62), "INTERACTIVE GAS LAWS MAP", MUTED, SANS_BOLD)
    draw_text(draw, (72, 110), "Ideal Gas Law", INK, SANS_BLACK)
    draw_text(draw, (72, 188), "Explorer", INK, SANS_BLACK)
    draw_text(
        draw,
        (72, 312),
        "Connect Boyle's, Charles', Gay-Lussac's, and\nAvogadro's laws to the equation that unifies them.",
        "#3f4b59",
        SANS_BODY,
        spacing=12,
    )

    draw_equation(draw)

    draw.line((798, 355, 800, 392), fill=PRESSURE, width=7)
    draw.line((940, 355, 1015, 392), fill=VOLUME, width=7)
    draw.line((814, 355, 800, 502), fill=TEMPERATURE, width=7)
    draw.line((948, 355, 1015, 502), fill=AMOUNT, width=7)

    draw_node(draw, (710, 402), "Boyle", "PV = k", PRESSURE)
    draw_node(draw, (930, 402), "Charles", "V/T = k", VOLUME)
    draw_node(draw, (710, 512), "Gay-Lussac", "P/T = k", TEMPERATURE)
    draw_node(draw, (930, 512), "Avogadro", "V/n = k", AMOUNT)

    draw.rounded_rectangle((74, 534, 474, 578), radius=22, fill=IDEAL)
    draw_text(draw, (96, 541), "PV = nRT", WHITE, SANS_BOLD)

    OUT.parent.mkdir(exist_ok=True)
    image.save(OUT, format="PNG", optimize=True)
    print(f"Wrote {OUT} ({WIDTH}x{HEIGHT})")


if __name__ == "__main__":
    main()
