// BP08-070 Crimson Rose Queen (Evolved) — Abysscraft follower, 6/6. 魔界.
// On Evolve — Reveal your whole hand and recover PP equal to the number of cards with original cost
// 2; the number of cards revealed is not optional (ruling, CR 5.21).
// Whenever you play a card with original cost 2, choose: deal 2 to every enemy follower and leader
// +2; or deal 2 to each enemy leader. A multi-effect card still triggers once (ruling, CR 10.7.2).
import type { GameReader } from "../../engine/query";
import type { CardId } from "../../model/ids";
import { defineCard, onEvolve, whenYouPlay } from "../helpers";

const originallyCosts2 = (game: GameReader, card: CardId) => game.info(card).cost === 2;

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        const hand = fx.game.cards(fx.controller, "hand");
        yield* fx.reveal(hand);
        yield* fx.recoverPlayPoints(hand.filter((id) => fx.game.info(id).cost === 2).length);
      },
    }),
    whenYouPlay(
      {
        modes: [
          {
            id: "followers",
            label: "Deal 2 to each enemy follower; leader +2",
            *resolve(fx) {
              yield* fx.dealDamageEach(fx.game.followers(fx.game.opponent(fx.controller)), 2);
              yield* fx.giveLeaderDefense(fx.controller, 2);
            },
          },
          {
            id: "leader",
            label: "Deal 2 to each enemy leader",
            *resolve(fx) {
              yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 2);
            },
          },
        ],
      },
      originallyCosts2,
    ),
  ],
});
