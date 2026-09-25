// BP07-064 Lightning Velociraptor — Dragoncraft follower, 2, 3/2. 自然・竜族.
// {[fanfare]} Summon a Naterran Great Tree token. If Overflow is active for you, summon up to 2
// instead and give this follower Rush. (Up to 2 includes 0; Rush either way — ruling.)
import { defineCard, fanfare } from "../helpers";
import { TREE, upToTrees } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (!fx.game.overflow(fx.controller)) {
          yield* fx.summon([TREE]);
          return;
        }
        yield* upToTrees(fx, 2);
        yield* fx.giveKeyword(fx.self, "rush");
      },
    }),
  ],
});
