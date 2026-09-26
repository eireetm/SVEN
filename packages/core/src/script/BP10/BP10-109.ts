// BP10-109 XXI. Zelgenea, The World — Neutral follower, 5, 5/5. アルカナ・大神.
// {[fanfare]} Select an enemy follower on the field. If there are no other followers on your field,
// destroy it and draw a card. (With another follower, neither happens; an indestructible target still
// gives the draw; without a target none of it happens — rulings.)
// {[fanfare]} If your leader's defense is 10 or less, give it {[defense]}+5. (Checked when it resolves:
// a Last Words resolved before it can make it true — ruling.)
// {[act]} {[cost10]}, banish this card from your cemetery: You may put a XXI. Zelgenea, O Great World
// from your evolve deck into your EX area. (Valid in the cemetery — ruling, CR 10.3.5. An advanced
// card, CR 9.2.)
import { banishThisFromCemetery } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.followers(fx.controller).some((id) => id !== fx.self)) return;
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.draw(1);
      },
    }),
    fanfare({
      condition: (g, p) => (g.info(g.leader(p)).defense ?? 0) <= 10,
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 5);
      },
    }),
    activated(
      { playPoints: 10, custom: banishThisFromCemetery },
      {
        validIn: ["cemetery"],
        *resolve(fx) {
          yield* fx.fromEvolveDeck((id) => named("XXI. Zelgenea, O Great World")(fx.game, id), { to: "ex" });
        },
      },
    ),
  ],
});
