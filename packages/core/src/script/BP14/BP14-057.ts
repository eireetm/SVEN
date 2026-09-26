// BP14-057 Frostbite Dragon (Evolved) — Dragoncraft follower, 6/6. 竜族.
// On Evolve - Each enemy follower on the field doesn't refresh during its controller's next start phase. (Those
// on the field when it resolves; later ones refresh — ruling. CR 7.2.3.)
// {[lastwords]} Destroy each engaged enemy follower on the field.
import { defineCard, lastWords, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        for (const id of fx.game.followers(fx.game.opponent(fx.controller))) yield* fx.skipNextRefresh(id);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.destroy(fx.game.followers(fx.game.opponent(fx.controller)).filter((id) => fx.game.card(id)?.engaged === true));
      },
    }),
  ],
});
