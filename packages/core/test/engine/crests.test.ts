import { describe, expect, it } from "vitest";
import { createEngine, script, type CardDefinition, type CardScript } from "../../src";
import { inOpponentZone, inYourZone } from "../../src/script/targets";
import { drive, testCrest, testFollower, testSpell, type DriveSpec } from "../../src/testing";
import { TEST_CARDS, TEST_SCRIPTS } from "../helpers";

// Crests (CR 2.3.2, 9.1.4.2, 9.1.5, 10.3.6; BP20), with synthetic cards. V1 is 1c 2/2, V3 3c 3/4; KILL (1) destroys an
// enemy follower. Crests are named "Crest: <id>" (C-ACT, C-END ...).
const { activated, atStartOfYourEndPhase, crestsInEx, defineCard, spell } = script;
const crest = (id: string) => testCrest(id, { name: `Crest: ${id}` });
const CARDS: CardDefinition[] = [
  crest("C-ACT"), // {[act]} (0): 1 damage to each enemy leader; once per turn
  crest("C-END"), // at the start of your end phase, draw a card
  crest("C-WARD"), // your followers have Ward
  crest("C-ANY"), // if you would choose 1 or more options, choose any number instead
  crest("C-CHEAP"), // your spells cost 1 less
  testFollower("GIVER", 1, 1, 1), // your other followers have Ward (a follower's passive: not from the EX area)
  testSpell("MAKE-END", 0), // put a Crest: END into your EX area
  testSpell("MAKE-TWO", 0), // put two Crest: END into your EX area
  testSpell("MAKE-MIX", 0), // put a Crest: END and a Crest: ACT into your EX area
  testSpell("SUMMON-CREST", 0), // summon a Crest: END (a crest can't be on the field)
  testSpell("BANISH-EX", 0), // select a card in your EX area and banish it
  testSpell("EX-TO-HAND", 0), // select a card in your EX area and put it into your hand
  testSpell("TAKE-EX", 0), // select a card in the opponent's EX area and put it into your EX area
  testSpell("OPTIONS3", 0), // choose 1: (1) draw, (2) leader +1, (3) 1 damage to each enemy leader
  testSpell("CREST-X", 0), // X damage to each enemy leader, X = crests in your EX area
];
const SCRIPTS: Record<string, CardScript> = {
  "C-ACT": defineCard({
    abilities: [
      activated(
        { playPoints: 0 },
        {
          oncePerTurn: true,
          *resolve(fx) {
            yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1);
          },
        },
      ),
    ],
  }),
  "C-END": defineCard({
    abilities: [
      atStartOfYourEndPhase({
        *resolve(fx) {
          yield* fx.draw(1);
        },
      }),
    ],
  }),
  "C-WARD": defineCard({
    field: {
      keywordsFor: (g, self, card) => {
        const c = g.card(card);
        return c?.zone === "field" && c.controller === g.card(self)!.controller && g.typeAndTraits(card).type === "follower" ? ["ward"] : [];
      },
    },
  }),
  "C-ANY": defineCard({ field: { chooseAnyNumberOfOptions: true } }),
  "C-CHEAP": defineCard({
    field: { playCostOf: (g, self, card, player) => (player === g.card(self)!.controller && g.info(card).type === "spell" ? -1 : 0) },
  }),
  GIVER: defineCard({
    field: {
      keywordsFor: (g, self, card) => {
        const c = g.card(card);
        return card !== self && c?.zone === "field" && c.controller === g.card(self)!.controller ? ["ward"] : [];
      },
    },
  }),
  "MAKE-END": defineCard({ abilities: [spell({ *resolve(fx) { yield* fx.tokensToEx(["Crest: C-END"]); } })] }),
  "MAKE-TWO": defineCard({ abilities: [spell({ *resolve(fx) { yield* fx.tokensToEx(["Crest: C-END", "Crest: C-END"]); } })] }),
  "MAKE-MIX": defineCard({ abilities: [spell({ *resolve(fx) { yield* fx.tokensToEx(["Crest: C-END", "Crest: C-ACT"]); } })] }),
  "SUMMON-CREST": defineCard({ abilities: [spell({ *resolve(fx) { yield* fx.summon(["Crest: C-END"]); } })] }),
  "BANISH-EX": defineCard({
    abilities: [spell({ targets: [inYourZone("ex")], *resolve(fx) { yield* fx.banish(fx.targets[0]!); } })],
  }),
  "EX-TO-HAND": defineCard({
    abilities: [spell({ targets: [inYourZone("ex")], *resolve(fx) { yield* fx.returnToHand(fx.targets[0]!); } })],
  }),
  "TAKE-EX": defineCard({
    abilities: [spell({ targets: [inOpponentZone("ex")], *resolve(fx) { yield* fx.putIntoEx(fx.targets[0]!, fx.controller); } })],
  }),
  OPTIONS3: defineCard({
    abilities: [
      spell({
        modes: [
          { id: "draw", label: "(1) Draw", *resolve(fx) { yield* fx.draw(1); } },
          { id: "leader", label: "(2) Leader +1", *resolve(fx) { yield* fx.giveLeaderDefense(fx.controller, 1); } },
          { id: "ping", label: "(3) 1 damage", *resolve(fx) { yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 1); } },
        ],
      }),
    ],
  }),
  "CREST-X": defineCard({
    abilities: [spell({ *resolve(fx) { yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), crestsInEx(fx.game, fx.controller)); } })],
  }),
};
const E = createEngine({ cards: [...TEST_CARDS, ...CARDS], scripts: { ...TEST_SCRIPTS, ...SCRIPTS } });
const d = (spec: DriveSpec) => drive(E, spec);

describe("crests (CR 2.3.2, 9.1.4.2, 9.1.5, 10.3.6)", () => {
  it("CR 10.3.6 — a crest's activated ability works in the EX area (once per turn here); a crest can't be played (CR 8.2.1)", () => {
    const t = d({ me: { ex: ["C-ACT"], playPoints: 5 } });
    expect([t.canActivate("C-ACT"), t.canPlay("C-ACT@ex")]).toEqual([true, false]);
    t.activate("C-ACT");
    expect([t.leader("opp"), t.canActivate("C-ACT")]).toEqual([19, false]);
  });

  it("CR 10.3.6 — a crest's automatic ability triggers in the EX area", () => {
    expect(d({ me: { ex: ["C-END"], deck: ["V1", "V3"] }, opp: { deck: ["V1"] } }).end().hand()).toEqual(["V1"]);
  });

  it("CR 10.3.6 — a crest's passive abilities work from the EX area; a follower's don't work there (10.3.5)", () => {
    expect(d({ me: { ex: ["C-WARD"], field: ["V1"] } }).keywords("V1")).toEqual(["ward"]);
    expect(d({ me: { ex: ["GIVER"], field: ["V1"] } }).keywords("V1")).toEqual([]);
    expect(d({ me: { ex: ["C-CHEAP"], hand: ["KILL"], playPoints: 0 }, opp: { field: ["V3"] } }).canPlay("KILL")).toBe(true);
    expect(d({ me: { hand: ["KILL"], playPoints: 0 }, opp: { ex: ["C-CHEAP"], field: ["V3"] } }).canPlay("KILL")).toBe(false);
  });

  it("CR 9.1.5.1.1 / 9.1.5.1.2 — one crest per name in an EX area: not created again, one of two created together", () => {
    const t = d({ me: { hand: ["MAKE-END", "MAKE-END", "MAKE-TWO", "MAKE-MIX"] } }).play("MAKE-END");
    expect(t.ex()).toEqual(["C-END"]);
    t.play("MAKE-END").play("MAKE-TWO");
    expect(t.ex()).toEqual(["C-END"]);
    t.play("MAKE-MIX");
    expect(t.ex()).toEqual(["C-END", "C-ACT"]);
    expect(d({ me: { hand: ["MAKE-TWO"] } }).play("MAKE-TWO").ex()).toEqual(["C-END"]);
    expect(d({ me: { hand: ["MAKE-END"] }, opp: { ex: ["C-END"] } }).play("MAKE-END").ex()).toEqual(["C-END"]);
  });

  it("CR 4.8.3 / 9.1.1.1 — crests take room in the EX area and count as its cards", () => {
    expect(d({ me: { hand: ["MAKE-END"], ex: ["V1", "V1", "V1", "V1", "V1"] } }).play("MAKE-END").ex()).toEqual(["V1", "V1", "V1", "V1", "V1"]);
    const t = d({ me: { hand: ["CREST-X"], ex: ["C-ACT", "C-END", "V1"] } }).play("CREST-X");
    expect(t.leader("opp")).toBe(18);
  });

  it("CR 9.1.4.2 / 9.1.4.4 — a crest leaving the EX area is eliminated; it can be selected as a card there (BP21-P70 ruling)", () => {
    const b = d({ me: { hand: ["BANISH-EX"], ex: ["C-END", "V1"] } }).play("BANISH-EX").pick("C-END");
    expect([b.ex(), b.zone("me", "banished")]).toEqual([["V1"], []]);
    const h = d({ me: { hand: ["EX-TO-HAND"], ex: ["C-END", "V1"] } }).play("EX-TO-HAND").pick("C-END");
    expect([h.ex(), h.hand()]).toEqual([["V1"], []]);
    expect(d({ me: { hand: ["SUMMON-CREST"] } }).play("SUMMON-CREST").field()).toEqual([]);
  });

  it("CR 9.1.5.1.3 — a crest is not moved into an EX area that already has one with the same name", () => {
    const blocked = d({ me: { hand: ["TAKE-EX"], ex: ["C-END"] }, opp: { ex: ["C-END"] } }).play("TAKE-EX");
    expect([blocked.ex(), blocked.ex("opp")]).toEqual([["C-END"], ["C-END"]]);
    const moved = d({ me: { hand: ["TAKE-EX"], ex: ["C-ACT"] }, opp: { ex: ["C-END"] } }).play("TAKE-EX");
    expect([moved.ex(), moved.ex("opp")]).toEqual([["C-ACT", "C-END"], []]);
  });

  it("CR 5.18 — with a crest saying so, its controller chooses 1 to all performable options (BP20-T06 ruling)", () => {
    const t = d({ me: { hand: ["OPTIONS3"], ex: ["C-ANY"], deck: ["V1"] } }).play("OPTIONS3");
    expect(t.decision).toMatchObject({ type: "choose", min: 1, max: 3 });
    t.choose("draw", "leader", "ping");
    expect([t.hand(), t.leader(), t.leader("opp")]).toEqual([["V1"], 21, 19]);
    expect(d({ me: { hand: ["OPTIONS3"], deck: ["V1"] }, opp: { ex: ["C-ANY"] } }).play("OPTIONS3").decision).toMatchObject({ type: "choose", min: 1, max: 1 });
  });
});
