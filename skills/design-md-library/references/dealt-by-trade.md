# Palettes and type dealt by trade

Left to choose, a model gives every client the same look: a warm off-white, a
serif display, one muted accent. The fix is to tie the colour and the type to
the client's trade, and to deal from a short list made for that trade instead
of choosing by taste. Two bakeries then differ from each other, and both differ
from a garage.

This page is written for Hallmark builds and redesigns. Hallmark's Floor wins
over anything here (section 6).

## 1. Name the trade

Before any colour, write one trade on the plan, taken from the brief's own
nouns. The first row that fits wins.

| Trade | The brief says |
|---|---|
| Food and drink | cafe, bakery, restaurant, bar, roastery, winery |
| Stay | hotel, guesthouse, cabin, campsite |
| Body and care | nail salon, hairdresser, barber, spa, gym, yoga |
| Health | clinic, dentist, vet, pharmacy, optician |
| Workshop | garage, mechanic, towing, tyres, joinery, metalwork, repair |
| Hire and events | tent or marquee rental, equipment hire, wedding venue, catering |
| Shop | florist, bookshop, grocer, boutique, web shop |
| Advice | lawyer, notary, accountant, insurance broker |
| Studio | design, architecture, photography, agency |
| Community | parish, church, club, school, library, non-profit |
| Software | an app, a SaaS product, a developer tool, an internal tool |
| Money | payments, banking, invoicing, bookkeeping software |

## 2. What each trade lends

The palette comes from what the trade handles every day: its materials, its
light, its signs and vehicles. The type group is a starting point for the
display face.

| Trade | Ground from | One accent from | Type group | Hallmark themes to try (at `407fa68`) |
|---|---|---|---|---|
| Food and drink | flour, linen, crust, slate | the oven, a glaze, the fruit | a serif | `vellum`, `solstice`, `garden`, `spore`, `hedgerow` |
| Stay | stone, timber, water, snow | shutters, a lamp, the sign | a serif or a quiet sans | `refract`, `piste`, `hedgerow` |
| Body and care | pale skin tones, clay, polished white | the polish, the oil, one saturated colour | a soft sans | `refract`, `atelier`, `sport` |
| Health | clean white, a cool grey | one calm, legible colour | a plain sans | `dose` |
| Workshop | steel, concrete, tarmac | a beacon, a safety colour, the brand on the van | a plain sans, often condensed | `formwork`, `blueprint`, `wayfind` |
| Hire and events | canvas, grass, daylight | the bunting, the poster | a plain or a display sans | `broadside`, `overprint`, `pasteup` |
| Shop | the paper bag, the shelf | the product's own packaging | a plain sans | `squeeze`, `halftone`, `sticker` |
| Advice | paper, a dark ink | one restrained colour | a plain sans or a sober serif | `grid`, `dusk` |
| Studio | the studio's own work | the work's own colour | the studio's own face | `studio`, `specimen`, `darkroom`, `terrazzo` |
| Community | paper, stone, whitewash | a liturgical or civic colour the brief names | a serif | `ink`, `vellum`, `almanac` |
| Software | the product's surfaces | the product's action colour | from the category | `cobalt`, `coral`, `console`, `lumen`, `terminal` |
| Money | paper or a dark ground | one colour of trust, used sparingly | a plain sans with tabular figures | `dusk`, `coral` |

The theme column lists Hallmark themes whose keywords fit the trade at the
pinned commit. A re-pin can rename or add themes. Check
`skills/hallmark/references/themes/index.json` before trusting a row.

## 3. Deal, don't choose

1. **Put the trade's words in the deal.** `theme.mjs deal` matches the prompt
   against each theme's keywords, and with `--log` it skips what the repo's
   last builds used:
   `node <skill-dir>/scripts/theme.mjs deal --genre <genre> --prompt "<trade>: <what the business is>" --log .hallmark/log.json`.
2. **Take the first theme whose material the trade can carry.** Move to the next
   only when the first clashes with the client's own colours or photographs.
   Never re-deal for taste.
3. **Say why it fits, in one sentence**, in the Picks block's Theme row, from
   what the trade really has: "a tarmac-grey ground and the amber of a tow
   truck's beacon". Never a fact the brief does not give.
4. **The client's own colours replace the deal**: a logo, a painted shopfront,
   a van's livery, a colour the brief names. In Hallmark that is
   `theme.mjs scaffold --brand`, with values read from the project's files or
   the brief, never from memory (`references/brand-truth.md`).
5. **Two clients in one trade never share a ground and an accent.** Hallmark's
   log sees only its own repo. When one repo holds several client sites, or two
   repos serve the same trade, compare their tokens by hand before you deal.
6. **On a custom run** (`references/direction.md`), the trade still anchors
   the colour. Start the anchor hue from the trade's material, then mix the
   scale in OKLCH.

## 4. Type by trade

- **A serif** for food and drink, stay and community: trades with a history or
  a table.
- **A plain sans** for workshop, health, advice, shop and hire: trades where a
  visitor scans for a price, an hour or a phone number.
- **A soft sans** for body and care, and for a cafe.
- **Software and money** follow their category, and the dealt theme's faces
  decide.

When a theme is dealt, its faces win, because a theme is a material. If its
display face sits outside the trade's group, name that in the Picks block. It
can be right (a heavy sans for a bakery that sells to students), but it should
be a decision you made, not something that happened. Two families at most, as
Hallmark says.

## 5. App screens

The estate's apps are app screens (Hallmark's `flow.md`, App screens). The theme
lends a palette, faces, a radius and surfaces, never a layout. The trade is
usually software, and an app keeps its role token names (`surface`, `ink`,
`accent`, `line`, `danger`). Dealing by trade matters most for client
business sites and parish sites, each designed with one look.

## 6. What wins

Hallmark's Floor and gates win over every row here:

- every colour goes through a token named by its role (Floor 1, gate 48);
- contrast is 4.5:1 for body text and 3:1 for large text, icons, focus rings
  and field edges (gates 40, 41, 26a);
- no framework stock swatch (gate 74) and no purple-to-blue gradient (gate 2a);
- the cream, high-contrast serif and terracotta look only when the trade's
  keywords ask for it (gate 65).

## Source

Adopted from taste-skill 2.5 ([Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)
at `f6b7657`, MIT). Its idea is a palette library tagged with the trades each
palette suits, dealt for the trade with a history so that two clients differ,
plus one sentence on why the palette fits. This page was written fresh for
Hallmark. No text, palette values or palette names were copied.
