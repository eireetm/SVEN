import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CardDatabase, createEngine } from "../../src";
import { BP01_CARDS, BP01_SCRIPTS } from "../../src/sets/bp01";

const db = new CardDatabase(BP01_CARDS);

describe("BP01 card data", () => {
  it("merges 273 printings into 209 card definitions", () => {
    expect(BP01_CARDS).toHaveLength(209);
    expect(BP01_CARDS.reduce((n, c) => n + c.printings.length, 0)).toBe(273);
    expect(BP01_CARDS.filter((c) => c.printings.length > 1)).toHaveLength(59);
  });

  it("CR 2.1.1 — alternate printings share one definition, canonical number first", () => {
    const roseQueen = db.ofPrinting("BP01-U01");
    expect(roseQueen.id).toBe("BP01-001");
    expect(roseQueen.printings).toEqual(["BP01-001", "BP01-SL01", "BP01-U01"]);
    expect(db.ofPrinting("BP01-SL01")).toBe(roseQueen);
  });

  it("uses the canonical printing's official English text when reprints differ in wording", () => {
    // BP01-P16 prints the pre-rename keyword "Piercing Attack" (now Assail, CR 12.11).
    expect(db.ofPrinting("BP01-P16").text.en).toBe("Assail.\n{[lastwords]} Increase your maximum play points by 1.");
  });

  it("CR 5.16.1.1.1 — every evolved card has a base card with the same name", () => {
    const evolved = BP01_CARDS.filter((c) => c.evolved);
    expect(evolved).toHaveLength(31);
    for (const e of evolved) {
      expect(e.name.endsWith("(Evolved)")).toBe(false);
      expect(e.cost).toBeNull();
      const bases = db.named(e.name).filter((d) => !d.evolved && d.type === "follower");
      expect(bases, e.id).toHaveLength(1);
    }
  });

  it("parses stats and special types", () => {
    const goblin = db.get("BP01-171");
    expect(goblin).toMatchObject({ name: "Goblin", type: "follower", cost: 1, attack: 2, defense: 2, evolved: false, class: "Neutral" });
    expect(db.get("BP01-172")).toMatchObject({ name: "Goblin", evolved: true, cost: null, attack: 4, defense: 4 });
    expect(db.get("BP01-T01")).toMatchObject({ name: "Thorn Burst", type: "spell", token: true, cost: 2, attack: null });
    const leaders = BP01_CARDS.filter((c) => c.type === "leader");
    expect(leaders).toHaveLength(12);
    for (const l of leaders) expect([l.cost, l.attack, l.defense, l.traits]).toEqual([null, null, null, []]);
  });

  it("CR 2.4 — traits are the Japanese originals only", () => {
    expect(db.get("BP01-001").traits).toEqual(["植物族"]);
    expect(db.get("BP01-T03").traits).toEqual(["妖精"]);
    expect(db.get("BP01-T07").traits).toEqual(["兵士"]);
    expect(db.get("BP01-T11").traits).toEqual(["竜族"]);
    for (const c of BP01_CARDS) for (const t of c.traits) expect(t, c.id).not.toMatch(/[A-Za-z・]/);
  });

  it("every trait a script names exists on some card (catches untranslated trait names)", () => {
    const known = new Set(BP01_CARDS.flatMap((c) => c.traits));
    const dir = join(__dirname, "../../src/script/BP01");
    let checked = 0;
    for (const file of readdirSync(dir)) {
      for (const [, trait] of readFileSync(join(dir, file), "utf8").matchAll(/hasTrait\("([^"]*)"\)/g)) {
        expect(known.has(trait!), `${file}: hasTrait("${trait}")`).toBe(true);
        checked += 1;
      }
    }
    expect(checked).toBe(8);
  });

  it("CR 9.1.2.3 — tokens are found by name", () => {
    expect(db.tokenNamed("Thorn Burst")?.id).toBe("BP01-T01");
    expect(db.tokenNamed("Fairy")?.id).toBe("BP01-T03");
    expect(db.tokenNamed("Goblin")).toBeUndefined();
  });

  it("keeps Chinese and Japanese names / text for display", () => {
    const c = db.get("BP01-006");
    expect(c.names).toEqual({ en: "Robin Hood", cn: "罗宾汉", ja: "ロビンフッド" });
    expect(c.text.cn).toContain("4点伤害");
  });

  it("reports which cards are implemented", () => {
    const engine = createEngine({ cards: db, scripts: BP01_SCRIPTS });
    // No card text -> vanilla; scripted evolve abilities; everything else is still missing.
    expect(engine.implementationStatus("BP01-042")).toBe("vanilla");
    expect(engine.implementationStatus("BP01-173")).toBe("vanilla");
    expect(engine.implementationStatus("BP01-172")).toBe("vanilla");
    expect(engine.implementationStatus("BP01-LD01")).toBe("vanilla");
    expect(engine.implementationStatus("BP01-171")).toBe("scripted");
    expect(engine.implementationStatus("BP01-174")).toBe("scripted");
    expect(engine.implementationStatus("BP01-SL01")).toBe("scripted"); // alternate art -> BP01-001
    expect(BP01_CARDS.filter((c) => c.text.en === "")).toHaveLength(22);
  });
});
