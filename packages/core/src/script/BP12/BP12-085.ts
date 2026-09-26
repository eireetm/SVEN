// BP12-085 Viper Lash — Abysscraft spell, 3. 魔界・ゴルゴーン.
// {[quick]}
// Select an enemy follower on the field. Deal it 5 damage, summon a Serpent token, and put a Serpent
// token into your EX area. (Not playable without a target; a Serpent summoned in the opponent's end
// phase can attack in your next turn — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        yield* fx.summon(["Serpent"]);
        yield* fx.tokensToEx(["Serpent"]);
      },
    }),
  ],
});
