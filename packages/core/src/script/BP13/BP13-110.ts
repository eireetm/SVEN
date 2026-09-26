// BP13-110 Grimnir, Voidwrought Wind — Neutral follower, 3, 3/4. 光輝・キラー.
// {[fanfare]} Select an enemy follower on the field. If there are at least 3 faceup evolved followers in
// your evolve deck, deal 5 damage to it and 3 damage to its leader. (Not advanced followers or evolved
// amulets — rulings. The leader damage is part of the "if" in the English text; the Japanese text has it as
// a sentence of its own. Not played without a target — ruling.)
import { defineCard, fanfare } from "../helpers";
import { enemyFollower, isEvolvedFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const g = fx.game;
        if (g.faceUpEvolveDeck(fx.controller).filter((id) => isEvolvedFollower(g, id)).length < 3) return;
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamages([
          { target, amount: 5 },
          { target: g.leader(g.controller(target)), amount: 3 },
        ]);
      },
    }),
  ],
});
