// BP12-028 King's Welcome — Swordcraft spell, 2. メイド・貴族.
// If there's a Commander follower and Officer follower on your field, draw 2 cards. (Playable without
// them; one follower with both traits is enough — rulings.)
import { defineCard, spell } from "../helpers";
import { hasTrait } from "../targets";

const commander = hasTrait("指揮官");
const officer = hasTrait("兵士");

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const followers = fx.game.followers(fx.controller);
        if (followers.some((id) => commander(fx.game, id)) && followers.some((id) => officer(fx.game, id))) yield* fx.draw(2);
      },
    }),
  ],
});
