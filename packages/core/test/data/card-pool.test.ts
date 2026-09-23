import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CardDatabase } from "../../src";
import { ALL_CARDS, ALL_SCRIPTS, SETS, SUPPORTED_SETS } from "../../src/sets";

// The whole card pool: cards of every supported set with their printings in all sets.
const db = new CardDatabase(ALL_CARDS);

describe("card pool (all supported sets)", () => {
  it("every supported set has its data and script registry", () => {
    for (const set of SUPPORTED_SETS) {
      expect(SETS[set].cards.length, set).toBeGreaterThan(0);
      for (const id of Object.keys(SETS[set].scripts)) expect(db.get(id).id.startsWith(`${set}-`), id).toBe(true);
    }
    expect(Object.keys(ALL_SCRIPTS).length).toBe(SUPPORTED_SETS.reduce((n, s) => n + Object.keys(SETS[s].scripts).length, 0));
  });

  it("printings of other sets join their card: reprinted tokens, starter decks, promos", () => {
    expect(db.ofPrinting("BP02-T11").id).toBe("BP01-T03"); // Fairy
    expect(db.ofPrinting("SD01-007").id).toBe("BP01-017"); // Elf Metallurgist
    expect(db.ofPrinting("PR-088").id).toBe("BP01-009"); // Elven Princess Mage
    // Data fix (data/fixes.ts): ETD02-007 is Soul Conversion despite its English name.
    expect(db.ofPrinting("ETD02-007").id).toBe("BP01-116");
  });

  it("CR 2.13 — alternate-name printings belong to the card they are treated as", () => {
    const vania = db.ofPrinting("BP02-070");
    expect([vania.id, vania.name]).toEqual(["BP02-069", "Vania, Vampire Princess"]);
    expect(vania.alternateNames?.["BP02-070"]?.en).toBe("La+ Darkness, Laplace's Demon");
    expect(db.ofPrinting("BP02-082").id).toBe("BP02-081");
    expect(db.named("La+ Darkness, Laplace's Demon")).toEqual([]);
  });

  it("uses effect_en where the scraped official English text belongs to another card", () => {
    // BP02-091's official field holds another card's fanfare; the card's own text is effect_en.
    expect(db.get("BP02-091").text.en).toMatch(/prayer counter/);
    expect(db.get("BP02-091").text.ja).toMatch(/祈りカウンター/);
  });

  it("CR 5.16.1.1.1 — every evolved card has exactly one base follower with the same name", () => {
    for (const e of ALL_CARDS.filter((c) => c.evolved)) {
      expect(db.named(e.name).filter((d) => !d.evolved && d.type === "follower"), e.id).toHaveLength(1);
    }
  });

  it("every trait a script names exists on some card (catches untranslated trait names)", () => {
    const known = new Set(ALL_CARDS.flatMap((c) => c.traits));
    const root = join(__dirname, "../../src/script");
    let checked = 0;
    for (const set of readdirSync(root).filter((d) => statSync(join(root, d)).isDirectory())) {
      for (const file of readdirSync(join(root, set))) {
        for (const [, trait] of readFileSync(join(root, set, file), "utf8").matchAll(/hasTrait\("([^"]*)"\)/g)) {
          expect(known.has(trait!), `${set}/${file}: hasTrait("${trait}")`).toBe(true);
          checked += 1;
        }
      }
    }
    expect(checked).toBeGreaterThanOrEqual(8);
  });
});
