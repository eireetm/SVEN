// BP15-045 Melody's Return — Runecraft spell, 2. 絶傑・アイドル.
// As an additional cost to play this, banish a follower with "Lishenna" in its name from your cemetery.
// ----------
// If there are at least 2 Idolatry cards on your field, search your deck for a follower with "Lishenna" in its
// name, summon it, then shuffle.
import { banishFromYour } from "../costs";
import { defineCard, spell } from "../helpers";
import { countIn, idolatry, lishennaFollower } from "./shared";

export default defineCard({
  playOptionsRequired: true,
  playOptions: [{ id: "banish", label: "Banish a Lishenna follower from your cemetery", ...banishFromYour(["cemetery"], lishennaFollower) }],
  abilities: [
    spell({
      *resolve(fx) {
        if (countIn(fx.game, fx.controller, "field", idolatry) < 2) return;
        yield* fx.search((id) => lishennaFollower(fx.game, id), { to: "field" });
      },
    }),
  ],
});
