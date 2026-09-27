// CP01-076 Mejiro Ardan — Havencraft follower, 1, 3/3. ウマ娘・メジロ家.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// Ward.
// At the start of your main phase, if there are no Mejiro Family followers with a different name from this card on your field,
// return this card to its owner's hand.
import { atStartOfYourMainPhase, defineCard, serveAbility } from "../helpers";
import { named } from "../targets";
import { mejiro } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    serveAbility(1, 1),
    atStartOfYourMainPhase({
      *resolve(fx) {
        const g = fx.game;
        if (g.card(fx.self)?.zone !== "field") return;
        const partner = g.followers(fx.controller).some((id) => mejiro(g, id) && !named("Mejiro Ardan")(g, id));
        if (!partner) yield* fx.returnToHand([fx.self]);
      },
    }),
  ],
});
