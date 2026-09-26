// BP21-058 Lumiore, Prestigious Gold — Dragoncraft follower, 6, 4/4. ドラゴニュート.
// At the start of your end phase, if there are at least 3 Dragonewt followers on your field, deal 3 damage to each enemy
// leader and enemy follower on the field.
// {[fanfare]} Discard a card: Search your deck for a 2-cost Dragonewt follower and a 1-cost Dragonewt follower, summon them,
// then shuffle. (元のコスト; either one alone — ruling; CR 10.4.7.4.)
import { discardCardsCost } from "../costs";
import { atStartOfYourEndPhase, defineCard, fanfare } from "../helpers";
import { isFollower } from "../targets";
import { dragonewt } from "./shared";

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      *resolve(fx) {
        const g = fx.game;
        if (g.followers(fx.controller).filter((id) => dragonewt(g, id)).length < 3) return;
        const opponent = g.opponent(fx.controller);
        yield* fx.dealDamageEach([g.leader(opponent), ...g.followers(opponent)], 3);
      },
    }),
    fanfare({
      cost: discardCardsCost(1),
      *resolve(fx) {
        const g = fx.game;
        const dragonewtCosting = (n: number) => (id: string) => isFollower(g, id) && dragonewt(g, id) && g.info(id).cost === n;
        yield* fx.searchEach([dragonewtCosting(2), dragonewtCosting(1)], { to: "field" });
      },
    }),
  ],
});
