import { describe, expect, it } from "vitest";
import { DeckFormatError, deckFromText, deckToText, emptyDeck, parseDeckFile, toDeckList, type DeckFile } from "../src/decks/format";

// The deck file and the editor's text form (src/decks/format.ts).
const deck: DeckFile = {
  format: "sve-deck",
  version: 1,
  name: "Test deck",
  leader: "SD01-LD01",
  main: { "SD01-011": 3, "SD01-012": 1 },
  evolve: { "SD01-004": 2 },
  notes: "First line\nSecond line",
};

describe("deck text", () => {
  it("round-trips a deck, with card names as comments and whole-line comments as notes", () => {
    const text = deckToText(deck, (id) => (id === "SD01-011" ? "Goblin" : undefined));
    expect(text).toContain("3 SD01-011  ; Goblin\n");
    expect(text).toContain("1 SD01-012\n");
    expect(text).toContain("; First line\n; Second line\n");
    const { deck: back, errors } = deckFromText(text);
    expect(errors).toEqual([]);
    expect(back).toEqual(deck);
  });

  it("accepts the other ways of writing a count, adds repeated cards, and reports bad lines", () => {
    const { deck: parsed, errors } = deckFromText("[main]\n3x A-1\nA-1 x2\nB-2\n\n[evolve]\n2 C-3 ; note\nthis is wrong\n", "Mine");
    expect(parsed.name).toBe("Mine");
    expect(parsed.main).toEqual({ "A-1": 5, "B-2": 1 });
    expect(parsed.evolve).toEqual({ "C-3": 2 });
    expect(errors).toEqual(['line 8: "this is wrong" is not "COUNT CARD"']);
  });

  it("lists every copy for the engine", () => {
    expect(toDeckList(deck)).toEqual({ leader: "SD01-LD01", main: ["SD01-011", "SD01-011", "SD01-011", "SD01-012"], evolve: ["SD01-004", "SD01-004"] });
    expect(toDeckList(emptyDeck("x"))).toEqual({ main: [], evolve: [] });
  });
});

describe("deck file", () => {
  it("checks the shape of a file", () => {
    expect(parseDeckFile(JSON.parse(JSON.stringify(deck)))).toEqual(deck);
    expect(() => parseDeckFile({ ...deck, format: "other" })).toThrow(DeckFormatError);
    expect(() => parseDeckFile({ ...deck, main: { "A-1": 1.5 } })).toThrow(DeckFormatError);
    expect(parseDeckFile({ ...deck, main: { "A-1": 0 } }).main).toEqual({});
  });
});
