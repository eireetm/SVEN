// SD05-001 Queen Vampire — Abysscraft follower, 6, 5/5. 吸血鬼.
// {[fanfare]} Summon 2 Forest Bat tokens.
// Activate {[engage]}, give your leader {[defense]}-1: Summon 2 Forest Bat tokens.
// Whenever a Forest Bat token is put onto your field, give it {[attack]}+1 and Ward. (Two of these give +2 — ruling.)
import { activated, defineCard, fanfare, whenCardEntersYourField } from "../helpers";
import { BAT, forestBat } from "./shared";
import type { EffectContext } from "../../engine/effects/context";

function* twoBats(fx: EffectContext) {
  yield* fx.summon([BAT, BAT]);
}

export default defineCard({
  abilities: [
    fanfare({ resolve: twoBats }),
    activated({ engageSelf: true, leaderDefense: 1 }, { resolve: twoBats }),
    whenCardEntersYourField(
      {
        *resolve(fx) {
          const bat = fx.data!.card!;
          if (fx.game.card(bat)?.zone !== "field") return;
          yield* fx.giveStats(bat, 1, 0);
          yield* fx.giveKeyword(bat, "ward");
        },
      },
      { filter: forestBat },
    ),
  ],
});
