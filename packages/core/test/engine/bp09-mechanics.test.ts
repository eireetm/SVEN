import { describe, expect, it } from "vitest";
import { createEngine, type CardScript, type PlayerId } from "../../src";
import { ALL_CARDS, ALL_SCRIPTS } from "../../src/sets";
import { drive, testSpell, type Driver, type DriveSpec } from "../../src/testing";
import { TEST_CARDS, TEST_SCRIPTS } from "../helpers";

// Engine behaviour added for BP09 that the card tests do not show directly. V1 is 1c 2/2, V3 3c
// 3/4, V5 5c 5/5; QUICK-SAC destroys a follower of yours (0); BUFF-SOME gives up to 2 of your
// followers +1/+1 this turn (0). EVOLVE-IT (below) evolves one of your followers by an effect.
const EVOLVE_IT: CardScript = {
  abilities: [
    {
      kind: "spell",
      targets: [{ count: 1, candidates: (g, c: PlayerId) => g.followers(c) }],
      *resolve(fx) {
        yield* fx.evolve(fx.targets[0]![0]!);
      },
    },
  ],
};
const E = createEngine({
  cards: [...ALL_CARDS, ...TEST_CARDS, testSpell("EVOLVE-IT", 0, { text: "Select one of your followers and evolve it." })],
  scripts: { ...ALL_SCRIPTS, ...TEST_SCRIPTS, "EVOLVE-IT": EVOLVE_IT },
});
const d = (spec: DriveSpec) => drive(E, spec);

/** The evolved cards (faces) the legal evolve actions of a follower reveal. */
function evolveFaces(t: Driver, ref: string): string[] {
  const dec = t.decision;
  if (dec?.type !== "mainPhase") return [];
  const faces = dec.actions.flatMap((a) => {
    if (a.type !== "evolve" || a.useEvolutionPoint || a.card !== t.id(ref)) return [];
    const def = t.game.state.cards[a.evolveCard]!.def;
    return [a.backFace ? E.db.get(def).backFace! : def];
  });
  return [...new Set(faces)];
}

describe("BP09 mechanics", () => {
  it("CR 2.14 / 4.6.4 — an evolve ability reveals either face of a double-faced card; the follower has that face's information", () => {
    const t = d({ me: { field: ["BP09-004"], evolveDeck: ["BP09-005"], playPoints: 1 } });
    expect(evolveFaces(t, "BP09-004")).toEqual(["BP09-005", "BP09-005_back"]);
    t.evolve("BP09-004", { into: "BP09-005_back" });
    const info = t.game.reader().info(t.id("BP09-004"));
    expect([info.name, info.traits, info.evolved, info.cost, t.stats("BP09-004")]).toEqual([
      "Paula, Passionate Warmth",
      ["妖精"],
      true,
      2, // CR 5.16.1.2 — the base card's cost
      [3, 3],
    ]);
    // The evolve-zone card shows its back face to both players.
    const zone = t.game.view(1).players[0].evolveZone[0]!;
    expect([zone.def, zone.backFace, zone.name]).toEqual(["BP09-005", true, "Paula, Passionate Warmth"]);
  });

  it("each evolve ability names its face and cost (BP09-018 Celia: 1 for the front, 4 for the back)", () => {
    expect(evolveFaces(d({ me: { field: ["BP09-018"], evolveDeck: ["BP09-019"], playPoints: 1, evolutionPoints: 0 } }), "BP09-018")).toEqual(["BP09-019"]);
    const t = d({ me: { field: ["BP09-018"], evolveDeck: ["BP09-019"], playPoints: 4 } });
    expect(evolveFaces(t, "BP09-018")).toEqual(["BP09-019", "BP09-019_back"]);
    t.evolve("BP09-018", { into: "BP09-019_back" });
    expect([t.pp(), t.keywords("BP09-018"), t.field()]).toEqual([0, ["storm"], ["BP09-018", "BP01-T07", "BP01-T05"]]);
  });

  it("CR 5.16.1.1 — an effect evolves a follower only into an evolved card with its name, so not Paula, Icy Warmth", () => {
    const t = d({ me: { field: ["BP09-004"], hand: ["EVOLVE-IT"], evolveDeck: ["BP09-005"] } }).play("EVOLVE-IT");
    expect([t.game.reader().info(t.id("BP09-004")).evolved, t.zone("me", "evolveDeck")]).toEqual([false, ["BP09-005"]]);
  });

  it("CR 11.6.1 / 2.14.2.1 — when the follower leaves the field, the card goes faceup to the evolve deck with its front's information", () => {
    const t = d({ me: { field: [{ card: "BP09-004", evolvedInto: "BP09-005_back" }], hand: ["QUICK-SAC"] } });
    expect(t.game.reader().info(t.id("BP09-004")).name).toBe("Paula, Passionate Warmth");
    t.play("QUICK-SAC");
    const card = t.game.state.cards[t.id("BP09-005@evolveDeck")]!;
    expect([card.faceUp, card.backFace, t.game.reader().info(card.id).name]).toEqual([true, false, "Paula, Gentle Warmth"]);
  });

  it("CR 5.18 — an activated ability with options: an option without targets can't be chosen; one option left is chosen by itself", () => {
    // BP09-006 "{[engage]}, discard a card: (1) 4 damage to an enemy follower (2) 2 damage to each enemy leader".
    const noTarget = d({ me: { field: ["BP09-006"], hand: ["V1"] } }).activate("BP09-006");
    expect([noTarget.leader("opp"), noTarget.hand(), noTarget.engaged("BP09-006")]).toEqual([18, [], true]);
    const t = d({ me: { field: ["BP09-006"], hand: ["V1"] }, opp: { field: ["V5"] } }).activate("BP09-006").choose("follower");
    expect([t.stats("opp:V5"), t.leader("opp")]).toEqual([[5, 1], 20]);
    // BP09-071 Arcus: its cost needs another follower on your field; once per turn.
    expect(d({ me: { field: ["BP09-071"] } }).canActivate("BP09-071")).toBe(false);
    const arcus = d({ me: { field: ["BP09-071", "V1", "V1"], deck: ["V3"] } }).activate("BP09-071").choose("draw").pick("V1");
    expect([arcus.hand(), arcus.cemetery(), arcus.canActivate("BP09-071")]).toEqual([["V3"], ["V1"], false]);
  });

  it("CR 8.4.3.2.1 — a card on either field can forbid other followers to attack (BP09-040: cost 3 or less)", () => {
    const t = d({ me: { field: ["V3", "V5", "BP09-040"] }, opp: { field: ["BP09-040"] } });
    expect([t.attackTargets("V3"), t.attackTargets("V5")]).toEqual([[], ["opp:leader"]]);
  });

  it("CR 6.1.2 — a card's own deck limit replaces 3 copies (BP09-049 Onion Patch: 50)", () => {
    const onions = Array.from({ length: 49 }, () => "BP09-049");
    const rules = { deckRestrictions: true };
    expect(E.validateDeck({ leader: "BP01-LD05", main: [...onions, "BP09-042"], evolve: [] }, rules)).toEqual([]);
    expect(E.validateDeck({ leader: "BP01-LD05", main: [...onions.slice(4), "BP09-042", "BP09-042", "BP09-042", "BP09-042"], evolve: [] }, rules)).toEqual([
      'main deck: 4 copies of "Bergent, Onion Patchmaster", at most 3 (6.1.1.4)',
    ]);
  });

  it("a passive reads the card's current attack (GameReader.statsOf): BP09-003 has Ward at 4, Storm at 7 and ignores Ward at 10", () => {
    const buffs = Array.from({ length: 7 }, () => "BUFF-SOME");
    const t = d({ me: { field: [{ card: "BP09-002", evolvedInto: "BP09-003" }], hand: buffs }, opp: { field: [{ card: "V1", engaged: true }, { card: "WARD", engaged: true }] } });
    expect([t.keywords("BP09-002"), t.attackTargets("BP09-002")]).toEqual([[], ["WARD"]]);
    t.play("BUFF-SOME").pick("BP09-002");
    expect(t.keywords("BP09-002")).toEqual(["ward"]);
    for (let i = 0; i < 3; i++) t.play("BUFF-SOME").pick("BP09-002");
    expect([t.stats("BP09-002")[0], t.keywords("BP09-002")]).toEqual([7, ["ward", "storm"]]);
    for (let i = 0; i < 3; i++) t.play("BUFF-SOME").pick("BP09-002");
    expect(t.attackTargets("BP09-002")).toEqual(["V1", "WARD", "opp:leader"]);
  });
});
