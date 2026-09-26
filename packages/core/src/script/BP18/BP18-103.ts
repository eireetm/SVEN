// BP18-103 Imina, Mad Eidolon — Havencraft follower, 4, 1/5. 狂信・偶像.
// Bane.
// {[fanfare]} Each player summons a Totem of Madness token. (Its player controls it; the turn player first, CR 1.3.4.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["bane"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const first = fx.game.activePlayer;
        for (const p of [first, fx.game.opponent(first)]) yield* fx.summon(["Totem of Madness"], { player: p });
      },
    }),
  ],
});
