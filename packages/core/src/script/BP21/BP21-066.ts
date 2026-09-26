// BP21-066 Charlotte, Dragonewt — Dragoncraft follower, 10, 4/9. 竜使い・ドラゴニュート.
// Storm. Ward.
// {[fanfare]} Reveal the top card of your deck. If it's a {[dragoncraft]} follower, summon it. Otherwise, draw the revealed
// card. (The card drawn is the revealed one — ruling; CR 5.21.)
import { defineCard, fanfare } from "../helpers";
import { isClass, isFollower } from "../targets";

export default defineCard({
  keywords: ["storm", "ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const [top] = fx.topCards(1);
        if (top === undefined) return;
        yield* fx.reveal([top]);
        if (isFollower(g, top) && isClass("Dragoncraft")(g, top)) yield* fx.putOntoField([top]);
        else yield* fx.draw(1);
      },
    }),
  ],
});
