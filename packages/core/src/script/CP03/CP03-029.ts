// CP03-029 Knight of Friendship, Kay — Swordcraft follower, 3, 4/3. ヴァンガード・ロイヤルパラディン.
// When playing this card, turn a faceup evolved follower with "Blaster" in its name in your evolve deck facedown: This card
// costs 3 less to play.
// ----------
// Rush.
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard } from "../helpers";
import { isFollower, nameIncludes } from "../targets";

const faceUpBlasters = (g: GameReader, p: PlayerId): CardId[] =>
  g.faceUpEvolveDeck(p).filter((id) => isFollower(g, id) && nameIncludes("Blaster")(g, id));

export default defineCard({
  keywords: ["rush"],
  playOptions: [
    {
      id: "facedown",
      label: "Turn a faceup evolved Blaster follower in your evolve deck facedown: costs 3 less",
      costDelta: -3,
      canPay: (g, p) => faceUpBlasters(g, p).length > 0,
      *pay(fx) {
        yield* fx.turnFacedown(yield* fx.chooseCards(faceUpBlasters(fx.game, fx.controller), 1, 1));
      },
    },
  ],
});
