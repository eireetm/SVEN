// BP18-098 Seishiro, Admonishing Faith (Evolved) — 4/4.
// On Evolve - You may summon a Togh Keyoh follower that costs 3 or less or {[havencraft]} amulet that costs 3 or less from
// your hand. (元のコスト.)
// On Super-Evolve - Put a Righteous Conviction token into your EX area.
// Whenever your leader gains {[defense]}, select an enemy follower on the field and deal it 2 damage.
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { costAtMost, isAmulet, isClass } from "../targets";
import { judgment, toghKeyohFollower } from "./shared-haven";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        const ok = g
          .cards(fx.controller, "hand")
          .filter((id) => costAtMost(3)(g, id) && (toghKeyohFollower(g, id) || (isAmulet(g, id) && isClass("Havencraft")(g, id))));
        yield* fx.putOntoField(yield* fx.chooseCards(ok, 0, Math.min(1, ok.length)));
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Righteous Conviction"]);
      },
    }),
    judgment,
  ],
});
