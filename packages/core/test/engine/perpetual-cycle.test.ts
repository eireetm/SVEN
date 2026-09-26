import { describe, expect, it } from "vitest";
import { createEngine, script } from "../../src";
import { PERPETUAL_CYCLE_LIMIT } from "../../src/engine/abilities/confirmation";
import { drive, testAmulet, testSpell } from "../../src/testing";
import { TEST_CARDS, TEST_SCRIPTS } from "../helpers";

const { defineCard, spell, whenYourLeaderGainsDefense } = script;

// ECHO: "Whenever your leader gains defense, give your leader +1 defense" — every resolution
// triggers it again, and no player can stop it.
const engine = createEngine({
  cards: [...TEST_CARDS, testAmulet("ECHO", 1), testSpell("HEAL", 0)],
  scripts: {
    ...TEST_SCRIPTS,
    ECHO: defineCard({
      abilities: [
        whenYourLeaderGainsDefense({
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 1);
          },
        }),
      ],
    }),
    HEAL: defineCard({
      abilities: [
        spell({
          *resolve(fx) {
            yield* fx.giveLeaderDefense(fx.controller, 1);
          },
        }),
      ],
    }),
  },
});

describe("CR 15.2 perpetual cycles", () => {
  it("15.2.1.3 — a cycle of automatic abilities nobody can stop ends the game in a draw", () => {
    const t = drive(engine, { me: { field: ["ECHO"], hand: ["HEAL"], playPoints: 1 } }).play("HEAL");
    expect(t.game.result).toEqual({
      winner: null,
      losses: [
        { player: 0, reason: "perpetualCycle" },
        { player: 1, reason: "perpetualCycle" },
      ],
    });
    expect(t.decision).toBeNull();
    // HEAL itself, then one +1 for each ECHO resolution up to the limit.
    expect(t.leader()).toBe(20 + 1 + PERPETUAL_CYCLE_LIMIT);
  });

  it("an ordinary chain of the same ability is not cut short", () => {
    const t = drive(engine, { me: { field: ["ECHO"], hand: ["HEAL"], playPoints: 1 } });
    expect(t.game.result).toBeNull();
    expect(t.canPlay("HEAL")).toBe(true);
  });
});
