// CP01-055 Rice Shower — Abysscraft follower, 5, 3/5. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Ward.
// {[fanfare]} Select an enemy follower on the field. Deal it 3 damage and put the top 2 cards of your deck into your cemetery.
// (Not playable without a target — ruling.)
// {[lastwords]} Select an Umamusume follower with a different name from this card in your cemetery and add it to your hand. (A
// follower destroyed at the same time can be selected — ruling.)
import { defineCard, fanfare, lastWords, serveAbility } from "../helpers";
import { enemyFollower, inYourZone, named } from "../targets";
import { umamusumeFollower } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    serveAbility(1, 1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        yield* fx.mill(2);
      },
    }),
    lastWords({
      targets: [inYourZone("cemetery", { filter: (g, id) => umamusumeFollower(g, id) && !named("Rice Shower")(g, id) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
