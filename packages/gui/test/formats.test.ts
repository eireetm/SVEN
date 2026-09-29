import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createEngine } from "@sve/core";
import { ALL_CARDS, ALL_SCRIPTS } from "@sve/core/sets";
import { describe, expect, it } from "vitest";
import { Catalog, cardName } from "../src/app/catalog";
import { migrateSettings } from "../src/app/settings";
import { deckFromText, deckToText, parseDeckFile, toDeckList, type DeckFile } from "../src/decks/format";
import type { FormatId } from "../src/engine/protocol";
import { formatProblemText, formatProblems, leadersFor, type FormatProblem } from "../src/formats/formats";
import { RESTRICTION_LISTS, listsFor, restrictionList } from "../src/formats/lists";
import { translate } from "../src/i18n";

// Formats and restriction lists: the lists' files, and a deck's problems in standard, Cross Craft (CR Appendix B-2) and
// unlimited, with the real engine's checks underneath.

const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
const catalog = new Catalog(engine.db.all().map((def) => ({ ...def, status: engine.implementationStatus(def.id) })));
const sample = (name: string): DeckFile => parseDeckFile(JSON.parse(readFileSync(join(__dirname, "..", "decks", "samples", `${name}.json`), "utf8")));

/** What the GUI finds: the engine's check (as check.ts asks it) and the format's own. */
function problems(deck: DeckFile, format: FormatId, listId: string | null = null): FormatProblem[] {
  const { leader } = leadersFor(deck, format, catalog);
  const engineProblems = engine.validateDeck(toDeckList(deck, leader), { deckRestrictions: format !== "unlimited" });
  return formatProblems(deck, format, restrictionList(listId), catalog, engineProblems);
}
const kinds = (list: readonly FormatProblem[]) => list.map((p) => (p.kind === "engine" ? `engine: ${p.text}` : p.kind));

describe("restriction lists", () => {
  it("are the four official lists, each for its format, newest first", () => {
    expect(RESTRICTION_LISTS.map((l) => l.id)).toEqual(["09_26_EN_CROSS", "08_26_EN", "05_26_JPN_CROSS", "01_26_JPN"]);
    expect(listsFor("standard").map((l) => l.id)).toEqual(["08_26_EN", "01_26_JPN"]);
    expect(listsFor("crossCraft").map((l) => l.id)).toEqual(["09_26_EN_CROSS", "05_26_JPN_CROSS"]);
    expect(listsFor("unlimited")).toEqual([]);
    expect(restrictionList("gone")).toBeNull();
  });

  it("name real cards: each number's Japanese (Asia) or English (English site) name is the one the list gives", () => {
    const wrong = RESTRICTION_LISTS.flatMap((list) =>
      [...list.banned, ...list.limited].flatMap((entry) => {
        const card = catalog.printing(entry.card);
        const name = card ? (list.region === "asia" ? card.names.ja : card.name) : undefined;
        return name === entry.name && entry.since <= list.updated ? [] : [`${list.id}: ${entry.card} ${entry.name} (${name ?? "no such card"})`];
      }),
    );
    expect(wrong).toEqual([]);
  });
});

describe("standard", () => {
  it("is the engine's deck construction (CR 6.1), and a list's banned and limited cards", () => {
    expect(problems(sample("sd01"), "standard")).toEqual([]);
    expect(problems(sample("csd03a"), "standard")).toEqual([]);
    // Asia bans Stardust Trumpeter (3 in the CSD03a sample); the English list doesn't.
    expect(problems(sample("csd03a"), "standard", "01_26_JPN")).toEqual([{ kind: "banned", card: "CSD03a-016", list: "01_26_JPN" }]);
    expect(problems(sample("csd03a"), "standard", "08_26_EN")).toEqual([]);
    // Limited to 1: every printing of the card counts, and a second copy is one too many.
    const rites = catalog.def("BP02-062")!;
    const dragon = { ...sample("sd04"), main: { ...sample("sd04").main, [rites.printings[0]!]: 1, [rites.printings[1]!]: 1 } };
    expect(problems(dragon, "standard", "01_26_JPN").filter((p) => p.kind !== "engine")).toEqual([{ kind: "limited", card: "BP02-062", copies: 2, list: "01_26_JPN" }]);
    // The engine's own problems stay: a Forestcraft card in a Swordcraft deck (CR 6.1.1.5.1).
    expect(kinds(problems({ ...sample("sd02"), main: { ...sample("sd02").main, "SD01-001": 1 } }, "standard"))[0]).toMatch(/does not match the leader class/);
  });
});

describe("Cross Craft", () => {
  const cross = sample("cross-sd01-sd02");

  it("takes two leaders of different classes and their cards (the sample: 20 Forestcraft, 20 Swordcraft)", () => {
    expect(problems(cross, "crossCraft")).toEqual([]);
    expect(problems(cross, "crossCraft", "05_26_JPN_CROSS")).toEqual([]);
    expect(problems(cross, "crossCraft", "09_26_EN_CROSS")).toEqual([]);
    // In standard, the second class is out.
    expect(kinds(problems(cross, "standard")).some((k) => /does not match the leader class/.test(k))).toBe(true);
  });

  it("needs both leaders, of two different classes, not Neutral (CR B-2 6.1.1.1)", () => {
    const { leader2: _, ...one } = cross;
    expect(kinds(problems(one, "crossCraft"))).toContain("twoLeaders");
    expect(kinds(problems({ ...cross, leader2: "SD01-LD01" }, "crossCraft"))).toContain("leaderClasses");
  });

  it("keeps the cards to the leaders' classes and Neutral, each class in the main deck (the English site: 9 of each)", () => {
    const rune = { ...cross, main: { ...cross.main, "SD03-001": 1 } };
    expect(problems(rune, "crossCraft")).toEqual([{ kind: "cardClass", card: "SD03-001", cardClass: "Runecraft", classes: ["Forestcraft", "Swordcraft"] }]);
    // 5 Swordcraft cards: enough for the rules (at least 1), not for the English site (9).
    const sword = Object.entries(cross.main).filter(([p]) => catalog.printing(p)!.class === "Swordcraft");
    let left = 5;
    const few = Object.fromEntries(
      Object.entries(cross.main).flatMap(([p, n]) => {
        if (!sword.some(([s]) => s === p)) return [[p, n]];
        const keep = Math.min(n, left);
        left -= keep;
        return keep > 0 ? [[p, keep]] : [];
      }),
    );
    const small = { ...cross, main: { ...few, ...Object.fromEntries(Object.entries(sample("sd01").main).slice(-6)) } };
    expect(problems(small, "crossCraft", "05_26_JPN_CROSS").filter((p) => p.kind === "perClass")).toEqual([]);
    expect(problems(small, "crossCraft", "09_26_EN_CROSS").filter((p) => p.kind === "perClass")).toEqual([
      { kind: "perClass", cardClass: "Swordcraft", have: 5, need: 9, list: "09_26_EN_CROSS" },
    ]);
  });

  it("gives the engine a leader without a universe (a Cross Craft deck isn't based on one, CR B-2 6.1.1.5)", () => {
    const uma = { ...cross, leader: "CSD01-LD01" };
    expect(leadersFor(uma, "crossCraft", catalog)).toEqual({ leader: "SD02-LD01", second: "CSD01-LD01" });
    expect(leadersFor(cross, "crossCraft", catalog)).toEqual({ leader: "SD01-LD01", second: "SD02-LD01" });
    expect(leadersFor(cross, "standard", catalog)).toEqual({ leader: "SD01-LD01", second: null });
  });
});

describe("unlimited", () => {
  it("only keeps out what the engine can't play", () => {
    expect(problems({ ...sample("sd02"), main: { ...sample("sd02").main, "SD01-001": 1 } }, "unlimited")).toEqual([]);
    expect(kinds(problems({ ...sample("sd02"), main: { "XX-000": 1 } }, "unlimited"))).toEqual(["engine: main deck: unknown card number XX-000"]);
  });
});

describe("problems in the interface language", () => {
  it("name the cards in the card text's language and the classes in the interface's", () => {
    const zh = { catalog, lang: "cn" as const, t: (k: Parameters<typeof translate>[1], p?: Record<string, string | number>) => translate("zh", k, p) };
    const trumpeter = cardName(catalog.def("CSD03a-016"), "cn");
    expect(formatProblemText({ kind: "banned", card: "CSD03a-016", list: "01_26_JPN" }, zh)).toBe(`${trumpeter}（CSD03a-016） 是禁止卡（01_26_JPN）`);
    expect(formatProblemText({ kind: "perClass", cardClass: "Swordcraft", have: 5, need: 9, list: "09_26_EN_CROSS" }, zh)).toBe(
      "主牌组至少要有 9 张皇家护卫的卡，现在是 5 张（09_26_EN_CROSS）",
    );
    expect(formatProblemText({ kind: "twoLeaders" }, zh)).toBe("双职业需要两张主战者卡（CR B-2 6.1.1.1）");
  });
});

describe("deck files and settings", () => {
  it("keep a Cross Craft deck's second leader (JSON and text)", () => {
    const cross = sample("cross-sd01-sd02");
    expect(cross.leader2).toBe("SD02-LD01");
    expect(parseDeckFile(JSON.parse(JSON.stringify(cross)))).toEqual(cross);
    const text = deckToText(cross);
    expect(text).toContain("leader2: SD02-LD01\n");
    expect(deckFromText(text).deck).toEqual(cross);
    expect(toDeckList(cross).leader).toBe("SD01-LD01");
  });

  it("turn the old deck restrictions switch into a format", () => {
    expect(migrateSettings({ setupRestrictions: false } as never).format).toBe("unlimited");
    expect(migrateSettings({ setupRestrictions: true } as never).format).toBe("standard");
    expect(migrateSettings({ setupRestrictions: false, format: "crossCraft" } as never).format).toBe("crossCraft");
    expect("setupRestrictions" in migrateSettings({ setupRestrictions: false } as never)).toBe(false);
  });
});
