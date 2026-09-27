// CP02-031 Kirari Moroboshi — Swordcraft follower, 9, 9/9. デレマス・パッション.
// This card costs 3 less to play if there's a 1-cost follower on your field. (元のコスト; two of them still make it 3 less —
// ruling.)
// ----------
// Ward.
// {[fanfare]} Refresh each follower on your field. (A follower that already attacked may attack again — ruling.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  playCost: (g, _self, c) => (g.followers(c).some((id) => g.info(id).cost === 1) ? -3 : 0),
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.refresh(fx.game.followers(fx.controller));
      },
    }),
  ],
});
