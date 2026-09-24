// BP04-014 Starry Elf — Forestcraft follower, 3, 3/3. エルフ族・星神.
// {[fanfare]} Search your deck for an amulet, reveal it, and add it to your hand.
import { defineCard, fanfare } from "../helpers";
import { isAmulet } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.search((id) => isAmulet(fx.game, id));
      },
    }),
  ],
});
