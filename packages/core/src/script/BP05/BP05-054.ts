// BP05-054 Electromagical Rhino — Dragoncraft follower, 5, 0/7. 巨人・超克.
// Storm.
// {[fanfare]} Give this follower {[attack]}+3. Put the top 4 cards of your deck into your cemetery.
// If an Electromagical Rhino was put into your cemetery by this ability, repeat this {[fanfare]}.
// {[lastwords]} Select any number of cards named Electromagical Rhino in your cemetery (including
// this one). Return them to your deck and shuffle it.
// Rulings: +3 even with an empty deck; one repeat however many Rhinos were milled; it repeats as
// long as a Rhino is milled.
import { defineCard, fanfare, lastWords } from "../helpers";
import { ANY, inYourZone, named } from "../targets";

const RHINO = "Electromagical Rhino";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      *resolve(fx) {
        for (;;) {
          yield* fx.giveStats(fx.self, 3, 0);
          const milled = yield* fx.mill(4);
          if (!milled.some((id) => named(RHINO)(fx.game, id))) return;
        }
      },
    }),
    lastWords({
      targets: [inYourZone("cemetery", { count: ANY, upTo: true, filter: named(RHINO) })],
      *resolve(fx) {
        yield* fx.putOnDeck(fx.targets[0] ?? [], "top");
        yield* fx.shuffleDeck();
      },
    }),
  ],
});
