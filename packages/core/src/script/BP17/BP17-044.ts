// BP17-044 Nefarious Invasion — Runecraft spell, 3. 機械・超克.
// This can't be played unless there are at least 3 Machina cards in your EX area. (Played from the EX area, it counts
// itself — ruling.)
// You may play this for 2 more play points. (CR 10.4.7.3.)
// ----------
// Search your deck for a follower with "Belphomet" in its name, reveal it, add it to your hand, then shuffle. Summon an
// Armored Tentacle token. If you played this for 2 more play points, summon an Assault Tentacle token. (The tentacles even
// if none is found; a full field takes nothing — rulings.)
import { defineCard, spell } from "../helpers";
import { isFollower, nameIncludes } from "../targets";
import { machinaInEx } from "./shared";

export default defineCard({
  playableIf: (g, _self, p) => machinaInEx(g, p) >= 3,
  playOptions: [{ id: "plus2", label: "Play it for 2 more play points", canPay: () => true, *pay() {}, costDelta: 2 }],
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.search((id) => isFollower(fx.game, id) && nameIncludes("Belphomet")(fx.game, id));
        yield* fx.summon(["Armored Tentacle"]);
        if (fx.playOption === "plus2") yield* fx.summon(["Assault Tentacle"]);
      },
    }),
  ],
});
