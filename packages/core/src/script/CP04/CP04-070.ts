// CP04-070 Ayane — Dragoncraft follower, 2, 3/2. プリコネ・サレンディア救護院.
// {[ub]} Follower Strike - Put the attack target into its owner's EX area. (The Japanese text is a Strike whose effect applies "if
// it attacks a follower": attacking a leader, it is played and executed too — ruling. An evolved follower goes there without its
// evolved card, a token stays a token, and a full EX area keeps it on the field — rulings, CR 4.8.3.2.)
// While there's another Sarendia Orphanage follower on your field, this follower has Rush.
import { defineCard, strike, ub } from "../helpers";
import { anotherOnYourField, traitOf } from "./shared";

export default defineCard({
  abilities: [
    ub(
      strike({
        *resolve(fx) {
          const e = fx.event;
          if (e?.type !== "attackDeclared" || fx.game.card(e.target)?.zone !== "field") return;
          yield* fx.putIntoEx([e.target]);
        },
      }),
    ),
  ],
  field: {
    keywordsFor: (g, self, card) => (card === self && anotherOnYourField(g, self, traitOf("サレンディア救護院")) ? ["rush"] : []),
  },
});
