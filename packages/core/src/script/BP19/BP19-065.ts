// BP19-065 Hotheaded Marauder (Evolved) — 3/3.
// On Evolve - Search your deck for a 1-cost Condemned follower, summon it, then shuffle. (元のコスト.)
// {[lastwords]} Put this into its owner's EX area.
import { defineCard, onEvolve } from "../helpers";
import { condemnedFollower } from "./shared";
import { backToEx } from "./shared-dragon";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => condemnedFollower(fx.game, id) && fx.game.info(id).cost === 1, { to: "field" });
      },
    }),
    backToEx,
  ],
});
