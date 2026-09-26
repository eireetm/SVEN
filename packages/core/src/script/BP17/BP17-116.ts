// BP17-116 Guild Assembly — Neutral spell, 2. 機械・魔法使い・獣.
// {[quick]}
// As an additional cost to play this, turn a facedown evolved follower in your evolve deck faceup.
// ----------
// Select an enemy follower on the field and deal it 3 damage.
// (It can't be played without paying it, nor without a target; Drive Points and advanced cards aren't evolved followers
// — rulings, CR 4.6.3, 9.2.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, isEvolvedFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  playOptionsRequired: true,
  playOptions: [
    {
      id: "faceup",
      label: "Turn a facedown evolved follower in your evolve deck faceup",
      canPay: (g, c) => g.faceDownEvolveDeck(c).some((id) => isEvolvedFollower(g, id)),
      *pay(fx) {
        const candidates = fx.game.faceDownEvolveDeck(fx.controller).filter((id) => isEvolvedFollower(fx.game, id));
        yield* fx.turnFaceup(yield* fx.chooseCards(candidates, 1, 1));
      },
    },
  ],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
