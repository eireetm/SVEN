// BP10-035 Ernesta, Weapons Hawker — Swordcraft follower, 1, 1/1. 兵士・商人.
// {[fanfare]} Select another {[swordcraft]} follower on your field. Give it {[attack]}+1 and Assail.
// At the start of your end phase, if there's a Merchant follower not named Ernesta, Weapons Hawker on
// your field, deal 2 damage to each enemy leader.
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { anotherYourFollower, isClass } from "../targets";
import { otherMerchantOnField } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [anotherYourFollower({ filter: isClass("Swordcraft") })],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.giveStats(target, 1, 0);
        yield* fx.giveKeyword(target, "assail");
      },
    }),
    atStartOfYourEndPhase({
      condition: (g, p) => otherMerchantOnField(g, p, "Ernesta, Weapons Hawker"),
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
      },
    }),
  ],
});
