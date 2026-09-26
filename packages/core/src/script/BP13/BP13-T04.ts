// BP13-T04 Darkest Desire — Abysscraft spell token, 1. 死者・キラー.
// As an additional cost to play this card, bury 2 followers. (Followers on your field, CR 10.4.3; not
// playable without paying it — ruling.)
// ----------
// Deal 2 damage to each enemy leader. Give your leader {[defense]}+2.
import { buryFromYourField } from "../costs";
import { defineCard, spell } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  playOptionsRequired: true,
  playOptions: [{ id: "bury", label: "Bury 2 followers", ...buryFromYourField(isFollower, 2) }],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
