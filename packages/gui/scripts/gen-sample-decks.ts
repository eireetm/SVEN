// Writes the sample decks in decks/samples/ (npx tsx packages/gui/scripts/gen-sample-decks.ts). Each is made of one starter
// or deck product's own printings: its leader, 40 main deck cards (the cheaper ones get the extra copies, at most 3 of a card,
// CR 6.1.1.4) and its evolve deck. Only decks the engine accepts with deck restrictions on are written (CR 6.1).
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createEngine, type CardDefinition } from "@sve/core";
import { ALL_CARDS, ALL_SCRIPTS } from "@sve/core/sets";
import { DECK_FORMAT, toDeckList, type DeckFile } from "../src/decks/format";

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
