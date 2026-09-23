// BP01-083 Phoenix Roost — Dragoncraft amulet, 5.
// At the start of each player's main phase, that player looks at the top card of their deck. If
// it's a follower, they may put it onto their field.
// (Several Roosts each trigger; the active player's abilities resolve first — rulings, CR 10.5.2.)
import { atStartOfEachMainPhase, defineCard } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  abilities: [
    atStartOfEachMainPhase({
      *resolve(fx) {
        const player = fx.data!.player!;
        const [top] = fx.topCards(1, player);
        if (top === undefined || !isFollower(fx.game, top)) return;
        if (yield* fx.confirm(player, top)) yield* fx.putOntoField([top], player);
      },
    }),
  ],
});
