// BP03-030 Kiss of the Princess — Swordcraft spell, 1. プリンセス・童話.
// (BP03-031 is the same card.)
// If a Princess follower is on your field, this card costs 1 less.
// Choose: (1) +1 attack to your follower; you may put a Fable counter on it.
// (2) Return up to 3 Swordcraft followers from your cemetery to your deck, shuffle, draw 1.
import type { CardId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import { defineCard, spell } from "../helpers";
import { hasTrait, inYourZone, isClass, isFollower, yourFollower } from "../targets";

const princess = (g: GameReader, id: CardId) => isFollower(g, id) && hasTrait("プリンセス")(g, id);

export default defineCard({
  playCost: (g, _self, p) => (g.followers(p).some((id) => princess(g, id)) ? -1 : 0),
  abilities: [
    spell({
      modes: [
        {
          id: "buff",
          label: "+1 attack; you may put a Fable counter",
          targets: [yourFollower()],
          *resolve(fx) {
            const id = fx.targets[0]![0]!;
            yield* fx.giveStats(id, 1, 0);
            if (yield* fx.confirm()) yield* fx.addCounters(id, "fable", 1);
          },
        },
        {
          id: "return",
          label: "Return up to 3 Swordcraft followers, shuffle, draw",
          targets: [inYourZone("cemetery", { count: 3, upTo: true, filter: (g, id) => isFollower(g, id) && isClass("Swordcraft")(g, id) })],
          *resolve(fx) {
            const cards = fx.targets[0] ?? [];
            if (cards.length > 0) yield* fx.putOnDeck(cards, "bottom");
            yield* fx.shuffleDeck();
            yield* fx.draw(1);
          },
        },
      ],
    }),
  ],
});
