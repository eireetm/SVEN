// BP13-034 Icyclone — Swordcraft follower, 2, 1/4. 兵士・ヒーロー.
// {[fanfare]} Select an enemy follower on the field and deal it 1 damage. If there's another Heroic follower
// on your field, deal it 4 damage instead.
// {[lastwords]} Look at the top card of your deck. If it's a Heroic card, you may put it into your EX area.
// (Otherwise it stays on top.)
import { defineCard, fanfare, lastWords } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

const heroic = hasTrait("ヒーロー");

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        const another = fx.game.followers(fx.controller).some((id) => id !== fx.self && heroic(fx.game, id));
        yield* fx.dealDamage(fx.targets[0]![0]!, another ? 4 : 1);
      },
    }),
    lastWords({
      *resolve(fx) {
        const top = fx.topCards(1);
        yield* fx.putIntoEx(yield* fx.selectCards(top.filter((id) => heroic(fx.game, id)), 0, 1, fx.controller, top));
      },
    }),
  ],
});
