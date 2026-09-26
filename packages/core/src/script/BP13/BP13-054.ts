// BP13-054 Drache, Fiery Dragonlord — Dragoncraft follower, 4, 4/3. 荒野・ドラゴニュート・武闘竜人.
// {[evolve]} {[cost04]}: Evolve this follower.
// Rush.
// {[fanfare]} The next Draconic Duelist card you play this turn costs 3 less to play.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { draconicDuelist } from "./shared";

export default defineCard({
  keywords: ["rush"],
  nextPlay: { duelist: (g, card) => draconicDuelist(g, card) },
  abilities: [
    evolveAbility(4),
    fanfare({
      *resolve(fx) {
        yield* fx.nextPlayCostsLess("duelist", 3);
      },
    }),
  ],
});
