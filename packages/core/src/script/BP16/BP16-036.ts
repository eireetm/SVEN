// BP16-036 Ironcrown Majesty — Swordcraft spell, 3. 指揮官・貴族.
// Choose 1. If a follower on your field evolved this turn, choose up to 2 instead. (1) Summon a Steelclad Knight,
// Shield Guardian, and Knight token. (2) Give each Officer token follower on your field {[attack]}+1/{[defense]}+1.
// (With less room the player picks which; a super-evolution counts; each option once — rulings.)
import { defineCard, spell } from "../helpers";
import { KNIGHT, SHIELD_GUARDIAN, STEELCLAD } from "./shared";
import { officerTokenFollower } from "./shared-sword";

export default defineCard({
  abilities: [
    spell({
      modeCount: (g, p) => (g.followerEvolvedThisTurn(p) ? 2 : 1),
      modes: [
        {
          id: "summon",
          label: "(1) A Steelclad Knight, Shield Guardian and Knight",
          *resolve(fx) {
            yield* fx.summon([STEELCLAD, SHIELD_GUARDIAN, KNIGHT]);
          },
        },
        {
          id: "buff",
          label: "(2) +1/+1 to your Officer token followers",
          *resolve(fx) {
            for (const id of fx.game.followers(fx.controller)) if (officerTokenFollower(fx.game, id)) yield* fx.giveStats(id, 1, 1);
          },
        },
      ],
    }),
  ],
});
