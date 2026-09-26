// BP11-015 Nature's Warden — Forestcraft follower, 4, 4/5. 狩人・獣.
// Ward.
// {[fanfare]} Search your deck for a follower with Ward, reveal it, add it to your hand, then shuffle.
// {[fanfare]} {[cost05]} You may summon a follower with Ward from your hand. (The two Fanfares resolve
// in either order — ruling.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { inYourZone, isFollower } from "../targets";
import type { GameReader } from "../../engine/query";
import type { CardId } from "../../model/ids";

const wardFollower = (g: GameReader, id: CardId): boolean => isFollower(g, id) && g.hasKeyword(id, "ward");

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => wardFollower(fx.game, id));
      },
    }),
    fanfare({
      cost: playPointsCost(5),
      targets: [inYourZone("hand", { filter: wardFollower })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
  ],
});
