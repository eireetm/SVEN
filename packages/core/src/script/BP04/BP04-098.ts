// BP04-098 Aether of the White Wing — Havencraft follower, 7, 3/5. 信仰・先導・光輝.
// Ward.
// {[fanfare]} Search your deck for a Havencraft follower with a different name from this card that
// costs less than your maximum play points and put it onto your field.
import { defineCard, fanfare } from "../helpers";
import { isClass, isFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const max = fx.game.state.players[fx.controller].maxPlayPoints;
        const mine = fx.game.info(fx.self).name;
        yield* fx.search(
          (id) =>
            isFollower(fx.game, id) &&
            isClass("Havencraft")(fx.game, id) &&
            fx.game.info(id).name !== mine &&
            (fx.game.info(id).cost ?? 99) < max,
          { to: "field" },
        );
      },
    }),
  ],
});
