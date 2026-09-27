import type { Keyword } from "../../model/keyword";
import type { AbilityDef } from "../../script/types";

/**
 * Abilities that a keyword itself stands for, beyond what the rules check directly.
 * They are listed after the card's own abilities, under the pseudo definition id "kw:<keyword>".
 */
export const KEYWORD_ABILITIES: Partial<Record<Keyword, readonly AbilityDef[]>> = {
  // CR 13.3.2.2 (third ability of Stack), cost as printed on BP01-T10:
  // "{[act]}{[engage]}: Select another amulet with Stack on your field and transfer all this
  // card's Stack counters to that card."
  stack: [
    {
      kind: "activated",
      cost: { engageSelf: true },
      targets: [
        {
          count: 1,
          candidates: (game, controller, self) =>
            game.cards(controller, "field").filter((id) => {
              const i = game.info(id);
              return id !== self && i.type === "amulet" && i.keywords.includes("stack");
            }),
        },
      ],
      *resolve(fx) {
        const n = fx.game.counters(fx.self, "stack");
        yield* fx.removeCounters(fx.self, "stack", n);
        yield* fx.addCounters(fx.targets[0]![0]!, "stack", n);
      },
    },
  ],
  // CR 12.13.2 Drain: "Whenever this follower deals attack damage, increase your leader's
  // defense by a value equal to the amount of damage it dealt." Attack damage is what the
  // attacking follower deals its attack target (12.13.2.1); damage dealt back to it, or by an
  // ability, does not count (12.13.2.2). An automatic ability (12.13.1), so it waits for the
  // next Confirmation Timing like any other.
  drain: [
    {
      kind: "automatic",
      timing: "other",
      trigger: (e, me) => !me.lookBack && e.type === "damageDealt" && e.source === me.card && e.kind === "attack" && e.amount > 0,
      *resolve(fx) {
        if (fx.event?.type === "damageDealt") yield* fx.giveLeaderDefense(fx.controller, fx.event.amount);
      },
    },
  ],
  // CR 14.4.6.2 Single Drive: "Strike - Perform a drive check."
  singleDrive: [
    {
      kind: "automatic",
      timing: "strike",
      trigger: (e, me) => !me.lookBack && e.type === "attackDeclared" && e.attacker === me.card,
      *resolve(fx) {
        yield* fx.driveCheck(fx.self);
      },
    },
  ],
  // CR 14.4.6.3 Twin Drive: "Strike - Perform 2 drive checks." One after the other: the first one's Trigger is resolved
  // and its card moved before the second (rulings).
  twinDrive: [
    {
      kind: "automatic",
      timing: "strike",
      trigger: (e, me) => !me.lookBack && e.type === "attackDeclared" && e.attacker === me.card,
      *resolve(fx) {
        yield* fx.driveCheck(fx.self);
        yield* fx.driveCheck(fx.self);
      },
    },
  ],
};

/** Keywords that stand for automatic abilities: checked after every event (triggers.ts). */
export const KEYWORD_TRIGGERS: readonly Keyword[] = (Object.keys(KEYWORD_ABILITIES) as Keyword[]).filter((k) =>
  KEYWORD_ABILITIES[k]!.some((a) => a.kind === "automatic"),
);

export const KEYWORD_DEF_PREFIX = "kw:";
