// BP19-049 Astral Dancer — Runecraft follower, 5, 4/4. 魔法使い・ダンサー.
// Ward.
// {[fanfare]} Select a follower on your field. Reveal the top card of your deck and give the selected follower {[defense]}+X.
// X equals the revealed card's cost. Draw a card. (元のコスト; the card drawn is the revealed one — ruling.)
import { defineCard, fanfare } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [yourFollower()],
      *resolve(fx) {
        const top = fx.topCards(1);
        if (top.length > 0) {
          yield* fx.reveal(top);
          const x = fx.game.info(top[0]!).cost ?? 0;
          const target = fx.targets[0]![0]!;
          if (x > 0 && fx.game.card(target)?.zone === "field") yield* fx.giveStats(target, 0, x);
        }
        yield* fx.draw(1);
      },
    }),
  ],
});
