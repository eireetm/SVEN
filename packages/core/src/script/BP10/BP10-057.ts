// BP10-057 Lævateinn Dragon, Dual Form α — Dragoncraft advanced follower, 6, 6/6. 竜族・武装.
// Rush.
// Strike - Select an enemy follower on the field. Deal it 4 damage and give your leader {[defense]}+2.
// (Without a target none of it happens — ruling.)
// {[lastwords]} Select a Lævateinn Dragon in your cemetery and put it onto your field engaged. (This
// card itself goes to the evolve deck, CR 9.2.2.)
import { defineCard, lastWords, strike } from "../helpers";
import { enemyFollower, inYourZone, named } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    strike({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
    lastWords({
      targets: [inYourZone("cemetery", { filter: named("Lævateinn Dragon") })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!, undefined, { engaged: true });
      },
    }),
  ],
});
