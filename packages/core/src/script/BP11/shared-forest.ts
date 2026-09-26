// BP11 Forestcraft abilities shared by a card and its evolved card (not a card).
import type { AutomaticAbility } from "../types";
import { whenCardPutIntoYourEx } from "../helpers";
import { enemyFollower } from "../targets";
import { mount, yourTurn } from "./shared";

/** BP11-008 / 009 "During your turn, whenever a Mount card is put into your EX area, ... 3 damage." */
export const varmintShot = (): AutomaticAbility =>
  whenCardPutIntoYourEx(
    {
      triggerIf: yourTurn,
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    },
    mount,
  );
