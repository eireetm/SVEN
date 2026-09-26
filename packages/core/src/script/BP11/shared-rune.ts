// BP11 Runecraft abilities shared by a card and its evolved card (not a card).
import type { ActivatedAbility, AutomaticAbility } from "../types";
import { activated, whenCardEntersYourField } from "../helpers";
import { anotherYourFollower, enemyFollower } from "../targets";
import { mount, yourTurn } from "./shared";

/**
 * BP11-038 / 039 "During your turn, whenever a Mount card is put onto your field, select an enemy
 * follower on the field. Deal it 2 damage, draw a card, then discard a card." (Without an enemy
 * follower it isn't played at all — ruling.)
 */
export const gunslingerShot = (): AutomaticAbility =>
  whenCardEntersYourField(
    {
      triggerIf: yourTurn,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    },
    { filter: mount },
  );

/** BP11-042 / 043 "Activate, Earth Rite: Select another follower on your field and give it Rush, Bane, or Drain." */
export const arcanistRite = (): ActivatedAbility =>
  activated(
    {},
    {
      earthRite: { mode: "required" },
      targets: [anotherYourFollower()],
      *resolve(fx) {
        const [pick] = yield* fx.choose([
          { id: "rush", label: "Rush" },
          { id: "bane", label: "Bane" },
          { id: "drain", label: "Drain" },
        ]);
        yield* fx.giveKeyword(fx.targets[0]![0]!, pick === "bane" ? "bane" : pick === "drain" ? "drain" : "rush");
      },
    },
  );
