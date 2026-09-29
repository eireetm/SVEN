// Writes the sample decks in decks/samples/ (npx tsx packages/gui/scripts/gen-sample-decks.ts). Each is made of one starter
// or deck product's own printings: its leader, 40 main deck cards (the cheaper ones get the extra copies, at most 3 of a card,
// CR 6.1.1.4) and its evolve deck. Only decks the engine accepts with deck restrictions on are written (CR 6.1). Also a Cross
// Craft sample (CR Appendix B-2): half of SD01's and half of SD02's, with both leaders, written if it meets Cross Craft.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createEngine, type CardDefinition } from "@sve/core";
import { ALL_CARDS, ALL_SCRIPTS } from "@sve/core/sets";
import { Catalog } from "../src/app/catalog";
import { DECK_FORMAT, toDeckList, type DeckFile } from "../src/decks/format";
import { formatProblems, leadersFor } from "../src/formats/formats";

const SETS = ["SD01", "SD02", "SD03", "SD04", "SD05", "SD06", "SD07", "SD08", "CSD01", "CSD02a", "CSD02b", "CSD02c", "CSD03a", "CSD03b", "DSD01a", "DSD01b", "PCS01"];
const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "decks", "samples");
const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });

/** The set's own printings with regular numbers (not the P / SL / SP / U / SSP alternate arts), one per definition. */
function printingsOf(set: string): { printing: string; def: CardDefinition }[] {
  const seen = new Set<string>();
  const out: { printing: string; def: CardDefinition }[] = [];
  for (const def of ALL_CARDS) {
    for (const printing of def.printings) {
      if (!printing.startsWith(`${set}-`) || /-(P|SL|SP|U|SSP)\d/.test(printing) || seen.has(def.id)) continue;
      seen.add(def.id);
      out.push({ printing, def });
    }
  }
  return out.sort((a, b) => a.printing.localeCompare(b.printing));
}

function sampleDeck(set: string): DeckFile {
  const cards = printingsOf(set);
  // A set without a leader of its own (PCS01) takes one of its universe's (CR 6.1.1.5).
  const universe = cards.find((c) => c.def.universe)?.def.universe;
  const universeLeader = ALL_CARDS.find((d) => d.type === "leader" && universe !== undefined && d.universe === universe);
  const leader = cards.find((c) => c.def.type === "leader") ?? (universeLeader ? { printing: universeLeader.printings[0]!, def: universeLeader } : undefined);
  const main = cards.filter((c) => c.def.type !== "leader" && !c.def.token && !c.def.evolved && !c.def.advanced);
  const evolved = cards.filter((c) => c.def.evolved || c.def.advanced);
  // 40 cards: as many copies of each as fit, the cheaper cards first for the rest.
  const copies = new Map(main.map((c) => [c.printing, Math.min(3, Math.floor(40 / main.length))]));
  const byCost = [...main].sort((a, b) => (a.def.cost ?? 0) - (b.def.cost ?? 0) || a.printing.localeCompare(b.printing));
  let total = [...copies.values()].reduce((a, b) => a + b, 0);
  for (let round = 0; round < 3 && total < 40; round++) {
    for (const c of byCost) {
      if (total >= 40) break;
      const n = copies.get(c.printing)!;
      if (n < 3) {
        copies.set(c.printing, n + 1);
        total += 1;
      }
    }
  }
  // Evolve deck (at most 10, CR 6.1.1.3): 2 of each evolved follower, then the universe's resources (Carrot, Drive Point).
  const evolve: Record<string, number> = {};
  let evolveTotal = 0;
  for (const c of evolved.filter((e) => e.def.type !== "spell")) {
    const n = Math.min(2, 10 - evolveTotal);
    if (n > 0) (evolve[c.printing] = n), (evolveTotal += n);
  }
  for (const c of evolved.filter((e) => e.def.type === "spell")) {
    const n = Math.min(3, 10 - evolveTotal);
    if (n > 0) (evolve[c.printing] = n), (evolveTotal += n);
  }
  const name = `${set} — ${leader?.def.name ?? "sample"} (sample)`;
  return {
    format: DECK_FORMAT,
    version: 1,
    name,
    ...(leader ? { leader: leader.printing } : {}),
    main: Object.fromEntries(main.map((c) => [c.printing, copies.get(c.printing)!])),
    evolve,
    notes: `Made by scripts/gen-sample-decks.ts from ${set}'s own printings (not the official list).`,
  };
}

/** The first `n` cards of a deck section, in its order. */
function first(cards: Record<string, number>, n: number): Record<string, number> {
  const out: Record<string, number> = {};
  let left = n;
  for (const [printing, copies] of Object.entries(cards)) {
    if (left <= 0) break;
    out[printing] = Math.min(copies, left);
    left -= out[printing];
  }
  return out;
}

/** Cross Craft (CR Appendix B-2): 20 + 20 main deck cards and 5 + 5 evolve cards of two samples, with both their leaders. */
function crossSample(a: DeckFile, b: DeckFile): DeckFile {
  return {
    format: DECK_FORMAT,
    version: 1,
    name: "Cross Craft — Arisa & Erika (sample)",
    ...(a.leader ? { leader: a.leader } : {}),
    ...(b.leader ? { leader2: b.leader } : {}),
    main: { ...first(a.main, 20), ...first(b.main, 20) },
    evolve: { ...first(a.evolve, 5), ...first(b.evolve, 5) },
    notes: "Made by scripts/gen-sample-decks.ts: a Cross Craft sample (CR Appendix B-2), half of SD01's sample and half of SD02's.",
  };
}

mkdirSync(outDir, { recursive: true });
for (const set of SETS) {
  const deck = sampleDeck(set);
  const errors = engine.validateDeck(toDeckList(deck), { deckRestrictions: true });
  if (errors.length > 0) {
    console.log(`${set}: not written — ${errors.join("; ")}`);
    continue;
  }
  const file = join(outDir, `${set.toLowerCase()}.json`);
  writeFileSync(file, JSON.stringify(deck, null, 2) + "\n", "utf8");
  console.log(`${set}: ${file}`);
}

const catalog = new Catalog(engine.db.all().map((def) => ({ ...def, status: engine.implementationStatus(def.id) })));
const cross = crossSample(sampleDeck("SD01"), sampleDeck("SD02"));
const crossProblems = formatProblems(
  cross,
  "crossCraft",
  null,
  catalog,
  engine.validateDeck(toDeckList(cross, leadersFor(cross, "crossCraft", catalog).leader), { deckRestrictions: true }),
);
if (crossProblems.length > 0) console.log(`Cross Craft: not written — ${JSON.stringify(crossProblems)}`);
else {
  const file = join(outDir, "cross-sd01-sd02.json");
  writeFileSync(file, JSON.stringify(cross, null, 2) + "\n", "utf8");
  console.log(`Cross Craft: ${file}`);
}
