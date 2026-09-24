// BP04-005 King Elephant — Forestcraft follower, 6, 1/1. 狩人・獣.
// {[evolve]} {[cost04]}: Evolve this follower. Storm.
// {[fanfare]} Select any number of cards on your field. Return them to their owners' hands and
// give this follower +X/+X. X equals the number of cards in your hand.
// Rulings: selecting none is allowed; returned tokens are removed at once and are not counted; it
// may return itself (then it gets nothing); abilities the returns trigger resolve after this one.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { ANY, yourCardOnField } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    evolveAbility(4),
    fanfare({
      targets: [yourCardOnField({ count: ANY, upTo: true })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0] ?? []);
        if (fx.game.card(fx.self)?.zone !== "field") return;
        const x = fx.game.cards(fx.controller, "hand").length;
        yield* fx.giveStats(fx.self, x, x);
      },
    }),
  ],
});
