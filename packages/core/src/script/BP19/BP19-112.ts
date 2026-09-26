// BP19-112 Eudie, Maiden Reborn — Neutral follower, 2, 2/3. 超克.
// Ward.
// {[fanfare]} Draw a card. If you don't have a Super Evolution Point, give this follower {[attack]}+2/{[defense]}+2 and
// give your leader {[defense]}+2. (Each player starts with 1 SEP — ruling, CR 12.2.4.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        if (fx.game.state.players[fx.controller].superEvolutionPoints !== 0) return;
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 2);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
