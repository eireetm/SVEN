// BP16-085 Yuna, Occult Hunter — Abysscraft follower, 1, 2/2. 吸血鬼・キラー.
// {[fanfare]} Put 2 Ghost or Forest Bat tokens into your EX area. (2 of one of them.)
import { defineCard, fanfare } from "../helpers";
import { FOREST_BAT, GHOST } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const [pick] = yield* fx.choose([
          { id: GHOST, label: "2 Ghosts" },
          { id: FOREST_BAT, label: "2 Forest Bats" },
        ]);
        const token = pick === FOREST_BAT ? FOREST_BAT : GHOST;
        yield* fx.tokensToEx([token, token]);
      },
    }),
  ],
});
