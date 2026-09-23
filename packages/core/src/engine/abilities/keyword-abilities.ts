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
};

export const KEYWORD_DEF_PREFIX = "kw:";
