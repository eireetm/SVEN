// BP17-006 Lococo, Little Puppeteer (Evolved) — Forestcraft follower, 3/3. 人形.
// On Evolve - Destroy each other follower on the field. Each player summons a Lococo's Teddy Bear token for every
// follower on their field destroyed this way. (One that isn't destroyed gives none; the bears come before the Last
// Words resolve — rulings.)
import type { PlayerId } from "../../model/ids";
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        const players: PlayerId[] = [fx.controller, g.opponent(fx.controller)];
        const before = players.map((p) => g.followers(p).filter((id) => id !== fx.self));
        yield* fx.destroy(before.flat());
        for (const [i, p] of players.entries()) {
          const destroyed = before[i]!.filter((id) => g.card(id)?.zone !== "field").length;
          if (destroyed > 0) yield* fx.summon(Array<string>(destroyed).fill("Lococo's Teddy Bear"), { player: p });
        }
      },
    }),
  ],
});
