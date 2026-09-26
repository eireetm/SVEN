// Shared pieces of BP08 card scripts.
import type { PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { banishThisFromCemetery } from "../costs";
import { whenEnemyFollowerToCemetery, whenFollowerEntersYourField, type TimingSpec } from "../helpers";
import { hasTrait, named } from "../targets";
import type { AutomaticAbility } from "../types";

/** The number of Puppetry (人形) cards in the player's cemetery (BP08-002, 010). */
export const puppetryInCemetery = (g: GameReader, p: PlayerId): number =>
  g.cards(p, "cemetery").filter((id) => hasTrait("人形")(g, id)).length;

/**
 * "When [an Omen] is put onto your field, banish this card from your cemetery: [effect]"
 * (BP08-041, 068). Valid only in the cemetery (CR 10.3.5): a copy that the Omen's own Fanfare
 * discards was still in the hand when the Omen entered, so it doesn't trigger (BP08-041 ruling).
 * Paying the cost is optional (CR 10.4.7.4).
 */
export function whenOmenEntersYourField(omen: string, spec: Pick<TimingSpec, "targets" | "resolve">): AutomaticAbility {
  return {
    ...whenFollowerEntersYourField({ ...spec, cost: banishThisFromCemetery }, { filter: named(omen) }),
    validIn: ["cemetery"],
  };
}

/**
 * Sweet-Tooth Medusa (BP08-035 / 036): "During your turn, whenever an enemy follower is put from the
 * field into the cemetery, summon a Serpent token." Once per follower (four at once: four Serpents
 * — ruling).
 */
export const medusaSerpent: AutomaticAbility = whenEnemyFollowerToCemetery(
  {
    *resolve(fx) {
      yield* fx.summon(["Serpent"]);
    },
  },
  { onlyYourTurn: true },
);
