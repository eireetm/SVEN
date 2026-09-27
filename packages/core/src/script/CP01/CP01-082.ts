// CP01-082 Aoi Kiryuin [Trainers' Teamwork] — Neutral follower, 2, 1/3. トレセン学園.
// Ward.
// {[fanfare]} Select a faceup Carrot in your evolve deck. Turn it facedown and draw a card. (Faceup cards there are public, CR
// 4.2.3.1; not playable without one — ruling.)
// Whenever one of your followers races, give it {[attack]}+1/{[defense]}+1. (Once per race: 3 races give +3/+3 — ruling.)
import type { TargetSpec } from "../types";
import { defineCard, fanfare, whenYourFollowerRaces } from "../helpers";

const faceUpCarrot: TargetSpec = {
  count: 1,
  candidates: (g, c) => g.faceUpEvolveDeck(c).filter((id) => g.info(id).name === "Carrot"),
};

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [faceUpCarrot],
      *resolve(fx) {
        yield* fx.turnFacedown(fx.targets[0]!);
        yield* fx.draw(1);
      },
    }),
    whenYourFollowerRaces({
      *resolve(fx) {
        const card = fx.data?.card;
        if (card && fx.game.card(card)?.zone === "field") yield* fx.giveStats(card, 1, 1);
      },
    }),
  ],
});
