// BP18-104 Unshakable Prayer — Havencraft amulet, 3. 透京・信仰.
// {[fanfare]} Look at the top 4 cards of your deck. From among them, you may reveal up to 1 Togh Keyoh card not named
// Unshakable Prayer and up to 1 Seishiro, Admonishing Faith and add them to your hand. Put the rest on the bottom of your
// deck in any order. The next Togh Keyoh card you play this turn costs 2 less. (Either one alone is fine — ruling.)
// {[act]} {[cost01]}, engage this, bury this: Give your leader {[defense]}+1.
import { activated, defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { SEISHIRO, toghKeyoh } from "./shared";

const unshakable = named("Unshakable Prayer");
const seishiro = named(SEISHIRO);

export default defineCard({
  nextPlay: { toghKeyoh: (g, card) => toghKeyoh(g, card) },
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const top = fx.topCards(4);
        const first = yield* fx.selectCards(top.filter((id) => toghKeyoh(g, id) && !unshakable(g, id)), 0, 1, fx.controller, top);
        const second = yield* fx.selectCards(top.filter((id) => seishiro(g, id) && !first.includes(id)), 0, 1, fx.controller, top);
        const taken = [...first, ...second];
        if (taken.length > 0) {
          yield* fx.reveal(taken);
          yield* fx.returnToHand(taken);
        }
        yield* fx.bottomInAnyOrder(top.filter((id) => g.card(id)?.zone === "deck"));
        yield* fx.nextPlayCostsLess("toghKeyoh", 2);
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* fx.giveLeaderDefense(fx.controller, 1);
        },
      },
    ),
  ],
});
