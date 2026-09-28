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
      // A set of reprints only (ETD01, PCS02, ...) has no definition of its own: its printings belong to earlier cards.
      const printed = ALL_CARDS.some((c) => c.printings.some((p) => p.startsWith(`${set}-`)));
      expect(SETS[set].cards.length > 0 || printed, set).toBe(true);
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
    // Evolved spells are evolve-deck resources, not evolved forms: Carrot (CR 14.2.1), Drive Point (14.4.9).
    for (const e of ALL_CARDS.filter((c) => c.evolved && c.type !== "spell")) {
      const same = db.named(e.name).filter((d) => !d.evolved && d.type === "follower");
      if (same.length === 1) continue;
      // "Unless specified otherwise": evolved into from a card whose text names a string this
      // card's name contains (BP03-056 evolves into BP03-058 "Lævateinn Dragon, Attack Form"),
      // or whose evolve ability names this card (the faces of a double-faced card, BP09-004).
      const hosts = ALL_CARDS.filter(
        (d) =>
          !d.evolved &&
          d.type === "follower" &&
          ((e.name.includes(d.name) && d.text.en.includes("in its name")) ||
            (ALL_SCRIPTS[d.id]?.abilities ?? []).some((a) => a.kind === "activated" && (a.evolveInto?.includes(e.name) ?? false))),
      );
      expect(hosts, e.id).toHaveLength(1);
    }
  });

  it("CR 2.14 — a double-faced card's back face is its own definition, linked to the front", () => {
    const front = db.get("BP09-005");
    const back = db.get("BP09-005_back");
    expect([front.name, front.backFace, back.name, back.frontFace]).toEqual([
      "Paula, Gentle Warmth",
      "BP09-005_back",
      "Paula, Passionate Warmth",
      "BP09-005",
    ]);
    // The back face's Japanese traits and text are transcribed from the card (data/fixes.ts).
    expect(back.traits).toEqual(["妖精"]);
    expect(back.text.ja).toMatch(/コンボ_3/);
    expect([back.evolved, back.attack, back.defense, back.printings]).toEqual([true, 3, 3, []]);
    // Every printing of the card is the front (the physical card).
    expect(db.ofPrinting("BP09-P02").id).toBe("BP09-005");
    expect(db.get("BP09-019_back").traits).toEqual(["指揮官", "キラー"]);
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
    // Reads every script file: about a second alone, much longer while the whole suite runs in parallel.
  }, 60_000);
});
