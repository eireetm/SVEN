// BP19-059 Masamune, One-Eyed Dragon — Dragoncraft follower, 2, 2/3. 竜使い・武闘竜人.
// Assail. Bane.
// {[fanfare]} If there are at least 3 Draconic Duelist cards on your field, give this Storm. (It counts.)
import { defineCard, fanfare } from "../helpers";
import { draconicDuelist } from "./shared";

export default defineCard({
  keywords: ["assail", "bane"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const n = fx.game.cards(fx.controller, "field").filter((id) => draconicDuelist(fx.game, id)).length;
        if (n >= 3 && fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
