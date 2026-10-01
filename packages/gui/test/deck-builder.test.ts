import { ALL_CARDS } from "@sve/core/sets";
import { describe, expect, it } from "vitest";
import { ABILITIES, NO_FILTERS, filterPool, poolEntries, setOf, setsOf, type PoolCard } from "../src/decks/filters";
import { emptyDeck } from "../src/decks/format";
import { addCard, clearDeck, copiesOf, copiesOfDefinition, fileNameFor, isDeckCard, removeCard, sectionOf, sortDeck } from "../src/decks/model";

// The deck builder's pure parts: editing a deck, and the card pool's filters, on the real card pool.
const byId = new Map(ALL_CARDS.map((c) => [c.id, c]));
const defOf = (printing: string) => byId.get(printing) ?? ALL_CARDS.find((c) => c.printings.includes(printing));

describe("editing a deck", () => {
  it("adds copies next to their own, removes them one by one, and sorts like a deck list", () => {
    let deck = emptyDeck("Test");
    deck = addCard(deck, "main", "BP01-011");
    deck = addCard(deck, "main", "BP01-001");
    deck = addCard(deck, "main", "BP01-011");
    expect(copiesOf(deck, "main")).toEqual(["BP01-011", "BP01-011", "BP01-001"]);
    deck = removeCard(deck, "main", "BP01-011");
    expect(deck.main).toEqual({ "BP01-011": 1, "BP01-001": 1 });
    deck = removeCard(removeCard(deck, "main", "BP01-011"), "main", "BP01-011");
    expect(deck.main).toEqual({ "BP01-001": 1 });
    expect(clearDeck(addCard(deck, "evolve", "BP01-002"))).toMatchObject({ main: {}, evolve: {} });
  });

  it("puts evolved and advanced cards into the evolve deck, and keeps leaders, tokens and back faces out", () => {
    const evolved = ALL_CARDS.find((c) => c.evolved && !c.frontFace)!;
    const follower = ALL_CARDS.find((c) => c.type === "follower" && !c.evolved && !c.token)!;
    expect(sectionOf(evolved)).toBe("evolve");
    expect(sectionOf(follower)).toBe("main");
    expect(ALL_CARDS.filter((c) => c.advanced).every((c) => sectionOf(c) === "evolve")).toBe(true);
    expect(isDeckCard(ALL_CARDS.find((c) => c.type === "leader")!)).toBe(false);
    expect(isDeckCard(ALL_CARDS.find((c) => c.token)!)).toBe(false);
    expect(isDeckCard(ALL_CARDS.find((c) => c.frontFace !== undefined)!)).toBe(false);
  });

  it("sorts by type (followers, spells, amulets), then cost", () => {
    const spell = ALL_CARDS.find((c) => c.type === "spell" && !c.token && !c.evolved)!;
    const cheap = ALL_CARDS.find((c) => c.type === "follower" && !c.token && !c.evolved && c.cost === 1)!;
    const dear = ALL_CARDS.find((c) => c.type === "follower" && !c.token && !c.evolved && c.cost === 5)!;
    let deck = emptyDeck("Sort");
    for (const card of [spell, dear, cheap]) deck = addCard(deck, "main", card.id);
    expect(Object.keys(sortDeck(deck, defOf).main)).toEqual([cheap.id, dear.id, spell.id]);
  });

  it("sorts by cost, then type (followers, spells, amulets)", () => {
    const spell = ALL_CARDS.find((c) => c.type === "spell" && !c.token && !c.evolved && c.cost === 1)!;
    const cheap = ALL_CARDS.find((c) => c.type === "follower" && !c.token && !c.evolved && c.cost === 1)!;
    const dear = ALL_CARDS.find((c) => c.type === "follower" && !c.token && !c.evolved && c.cost === 5)!;
    let deck = emptyDeck("Sort");
    for (const card of [dear, spell, cheap]) deck = addCard(deck, "main", card.id);
    expect(Object.keys(sortDeck(deck, defOf, "cost").main)).toEqual([cheap.id, spell.id, dear.id]);
  });

  it("counts a card's copies over its printings, and makes file names from deck names", () => {
    const card = ALL_CARDS.find((c) => c.printings.length > 1 && !c.token && c.type !== "leader")!;
    let deck = addCard(emptyDeck("x"), "main", card.printings[0]!);
    deck = addCard(deck, "main", card.printings[1]!);
    expect(copiesOfDefinition(deck, card.printings)).toBe(2);
    expect(fileNameFor("My Deck: v2!")).toBe("My Deck v2.json");
    expect(fileNameFor("  ")).toBe("deck.json");
  });
});

describe("the card pool", () => {
  const pool = ALL_CARDS as readonly PoolCard[];

  it("lists deck cards only: no leaders, no tokens", () => {
    const all = filterPool(pool, NO_FILTERS);
    expect(all.length).toBeGreaterThan(2000);
    expect(all.every((c) => c.type !== "leader" && !c.token)).toBe(true);
  });

  it("filters by class, type, cost, set, universe and trait", () => {
    const forest = filterPool(pool, { ...NO_FILTERS, class: "Forestcraft", type: "follower", cost: "2" });
    expect(forest.length).toBeGreaterThan(10);
    expect(forest.every((c) => c.class === "Forestcraft" && c.type === "follower" && !c.evolved && c.cost === 2)).toBe(true);
    const evolve = filterPool(pool, { ...NO_FILTERS, type: "evolve" });
    expect(evolve.every((c) => c.evolved || c.advanced)).toBe(true);
    const bp05 = filterPool(pool, { ...NO_FILTERS, set: "BP05" });
    expect(bp05.length).toBeGreaterThan(50);
    expect(bp05.every((c) => c.printings.some((p) => setOf(p) === "BP05"))).toBe(true);
    const uma = filterPool(pool, { ...NO_FILTERS, universe: "umamusume" });
    expect(uma.length).toBeGreaterThan(50);
    expect(filterPool(pool, { ...NO_FILTERS, universe: "none" }).every((c) => c.universe === undefined)).toBe(true);
    const fairies = filterPool(pool, { ...NO_FILTERS, trait: "妖精" });
    expect(fairies.length).toBeGreaterThan(5);
    expect(filterPool(pool, { ...NO_FILTERS, cost: "10" }).every((c) => (c.cost ?? 0) >= 10)).toBe(true);
    expect(setsOf(pool).slice(0, 3)).toEqual(["BP01", "BP02", "BP03"]);
  });

  it("searches words in names, numbers and text; every word must match and '-word' must not", () => {
    const goblins = filterPool(pool, { ...NO_FILTERS, text: "goblin" });
    expect(goblins.length).toBeGreaterThan(0);
    expect(filterPool(pool, { ...NO_FILTERS, text: "BP01-011" }).map((c) => c.id)).toContain("BP01-011");
    const ward = filterPool(pool, { ...NO_FILTERS, text: "ward fanfare" });
    const wardOnly = filterPool(pool, { ...NO_FILTERS, text: "ward -fanfare" });
    expect(ward.length).toBeGreaterThan(0);
    expect(wardOnly.length).toBeGreaterThan(0);
    expect(wardOnly.some((c) => ward.includes(c))).toBe(false);
    const byCost = filterPool(pool, { ...NO_FILTERS, class: "Swordcraft", sort: "cost" });
    expect(byCost.map((c) => c.cost ?? 99)).toEqual([...byCost.map((c) => c.cost ?? 99)].sort((a, b) => a - b));
  });

  it("filters by an ability the card text names, and every ability finds cards", () => {
    const byAbility = (ability: (typeof ABILITIES)[number]) => filterPool(pool, { ...NO_FILTERS, ability });
    const fanfare = byAbility("fanfare");
    expect(fanfare.length).toBeGreaterThan(500);
    expect(fanfare.filter((c) => !c.preview).every((c) => c.text.en.includes("{[fanfare]}"))).toBe(true);
    // A pre-release card (BP22: a placeholder English text) is found by its Japanese text.
    expect(fanfare.map((c) => c.id)).toContain("BP22-009");
    expect([byAbility("act"), byAbility("quick"), byAbility("onSuperEvolve")].map((cs) => cs.some((c) => ["BP22-001", "BP22-018", "BP22-022"].includes(c.id)))).toEqual([true, true, true]);
    expect(byAbility("storm").map((c) => c.id)).not.toContain("BP22-009");
    expect(byAbility("ward").map((c) => c.id)).toContain("BP10-105");
    expect(byAbility("sanguine").map((c) => c.id)).toContain("BP01-112");
    for (const ability of ABILITIES) expect(byAbility(ability).length, ability).toBeGreaterThan(0);
  });

  it("lists one tile per card, or every printing of it (alternate arts) next to each other", () => {
    const rose = { ...NO_FILTERS, text: "BP01-001" };
    expect(poolEntries(pool, rose, false).map((e) => e.printing)).toEqual(["BP01-001"]);
    expect(poolEntries(pool, { ...NO_FILTERS, class: "Forestcraft" }, true).slice(0, 3).map((e) => e.printing)).toEqual(["BP01-001", "BP01-SL01", "BP01-U01"]);
    // A typed number or the set picks printings; a name keeps them all.
    expect(poolEntries(pool, { ...NO_FILTERS, text: "BP01-U01" }, true).map((e) => e.printing)).toEqual(["BP01-U01"]);
    expect(poolEntries(pool, { ...NO_FILTERS, set: "PR" }, true).every((e) => setOf(e.printing) === "PR")).toBe(true);
    const named = poolEntries(pool, { ...NO_FILTERS, text: "rose queen" }, true).filter((e) => e.card.id === "BP01-001");
    expect(named.map((e) => e.printing)).toEqual(["BP01-001", "BP01-SL01", "BP01-U01"]);
  });
});
