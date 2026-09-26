// BP21-035 Aggressive Advance — Swordcraft spell, 2. 兵士.
// When playing this, engage an Officer follower on your field: This costs 1 less. (CR 10.4.7.3; a reserved one, 10.4.6.)
// Select an enemy follower on the field. Deal it 4 damage and summon a Knight token. (Not playable without a target — ruling.)
import { engageYourCards } from "../costs";
import { defineCard, spell } from "../helpers";
import { enemyFollower, isFollower } from "../targets";
import { officer } from "./shared";

export default defineCard({
  playOptions: [{ id: "officer", label: "Engage an Officer follower on your field: 1 less", ...engageYourCards((g, id) => isFollower(g, id) && officer(g, id)), costDelta: -1 }],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.summon(["Knight"]);
      },
    }),
  ],
});
