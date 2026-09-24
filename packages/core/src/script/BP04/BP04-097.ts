// BP04-097 Venomous Bite — Abysscraft spell, 1. 魔界.
// Summon a Serpent token. If there is a Gorgon follower on your field, give that Serpent Rush and
// Assail (only the one this spell summoned — ruling).
import { defineCard, spell } from "../helpers";
import { hasTrait } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const [serpent] = yield* fx.summon(["Serpent"]);
        if (!serpent || !fx.game.followers(fx.controller).some((id) => hasTrait("ゴルゴーン")(fx.game, id))) return;
        yield* fx.giveKeyword(serpent, "rush");
        yield* fx.giveKeyword(serpent, "assail");
      },
    }),
  ],
});
