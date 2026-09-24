// BP02-061 Transmogrified Wyrm — Dragoncraft follower, 4, 5/5.
// {[fanfare]} Select a card in an EX area and transform it into a Dragon token. (Either player's EX
// area — ruling; CR 5.17.)
import { defineCard, fanfare } from "../helpers";
import { inAnyExArea } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [inAnyExArea()],
      *resolve(fx) {
        yield* fx.transform(fx.targets[0]!, "Dragon");
      },
    }),
  ],
});
