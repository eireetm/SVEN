// CSD02c-002 Aiko Takamori [Handmade Happiness] — Forestcraft follower, 4, 4/4. デレマス・パッション.
// Activate {[engage]} 3 Passion followers on your field: You may summon a Passion follower from your hand and give it "At the start
// of your end phase, return this card to its owner's hand." (This card may be one of the three — ruling. The given ability stays
// with the summoned follower, like BP08-106's.)
import { engageYourCards } from "../costs";
import { activated, defineCard } from "../helpers";
import { followerThat, passion } from "../CP02/shared";
import { maySummonFromHand } from "../ECP02/shared";

export default defineCard({
  abilities: [
    activated(
      { custom: engageYourCards(followerThat(passion), 3) },
      {
        *resolve(fx) {
          const [summoned] = yield* maySummonFromHand(fx, followerThat(passion));
          if (summoned !== undefined && fx.game.card(summoned)?.zone === "field") yield* fx.grant(summoned, "returnToHandAtEnd");
        },
      },
    ),
  ],
});
