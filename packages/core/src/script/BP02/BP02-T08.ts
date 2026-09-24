// BP02-T08 Ephemeral Moon — Havencraft amulet token, 3.
// While this card is on your field, during your turn, your followers named Kaguya don't take damage.
// (A replacement effect, CR 5.14.2.)
// At the start of your main phase, banish this card.
import { atStartOfYourMainPhase, defineCard } from "../helpers";

export default defineCard({
  field: {
    damageToFollower(g, self, d) {
      const me = g.controller(self);
      const kaguya = g.controller(d.target) === me && g.info(d.target).name === "Kaguya";
      return g.activePlayer === me && kaguya ? -d.amount : 0;
    },
  },
  abilities: [
    atStartOfYourMainPhase({
      *resolve(fx) {
        yield* fx.banish([fx.self]);
      },
    }),
  ],
});
