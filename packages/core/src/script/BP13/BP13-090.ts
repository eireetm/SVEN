// BP13-090 Jatelant, God of Prosperity — Havencraft follower, 6, 5/5. 信仰・獣.
// {[fanfare]} Banish 2 amulets from your cemetery: Select an enemy follower on the field. Banish it, deal 3
// damage to its leader, and give your leader {[defense]}+3. (The English text reads "anish"; not played
// without a target — ruling.)
// Activate Bury an amulet: You may summon a {[havencraft]} follower or amulet that costs 3 or less from
// your hand. Activate only once per turn. (An amulet on your field, CR 10.4.3; 元のコスト. What it
// summons has its Fanfare triggered — ruling.)
import { banishFromYour, buryFromYourField } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { and, costAtMost, enemyFollower, isAmulet, isClass, isFollower } from "../targets";

const cheapHavenCard = and(isClass("Havencraft"), costAtMost(3), (g, id) => isFollower(g, id) || isAmulet(g, id));

export default defineCard({
  abilities: [
    fanfare({
      cost: banishFromYour(["cemetery"], isAmulet, 2),
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.banish([target]);
        yield* fx.dealDamage(leader, 3);
        yield* fx.giveLeaderDefense(fx.controller, 3);
      },
    }),
    activated(
      { custom: buryFromYourField(isAmulet) },
      {
        oncePerTurn: true,
        *resolve(fx) {
          const cards = fx.game.cards(fx.controller, "hand").filter((id) => cheapHavenCard(fx.game, id));
          yield* fx.putOntoField(yield* fx.chooseCards(cards, 0, 1));
        },
      },
    ),
  ],
});
