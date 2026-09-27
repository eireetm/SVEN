// ECP02-046 Star of the Show — Dragoncraft spell, 3. デレマス・クール.
// You may play this for 3 more play points. (CR 10.4.7.3.)
// ----------
// Select an enemy follower on the field. Destroy it and, if you played this for 3 more play points, search your deck for a follower
// with "Tsukasa Kiryu" in its name, summon it, then shuffle. (Not playable without an enemy follower to select — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { followerNamed } from "./shared";

export default defineCard({
  playOptions: [{ id: "plus3", label: "Play for 3 more play points", canPay: () => true, *pay() {}, costDelta: 3 }],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        if (fx.playOption === "plus3") yield* fx.search((id) => followerNamed("Tsukasa Kiryu")(fx.game, id), { to: "field" });
      },
    }),
  ],
});
