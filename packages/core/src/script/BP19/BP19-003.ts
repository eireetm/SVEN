// BP19-003 Wimael, Redolent Enforcer — Forestcraft follower, 6, 4/5. 八獄・植物族・虫族.
// {[fanfare]} Select an enemy follower on the field and deal it 4 damage.
// {[lastwords]} Summon this. (The card in the cemetery, CR 4.1.4.1; its Fanfare triggers again, CR 12.4.3.)
import { defineCard, fanfare, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
    lastWords({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.putOntoField([fx.self]);
      },
    }),
  ],
});
