// CP01-005 Eat Fast! Yum Fast! — Forestcraft spell, 2. ウマ娘.
// Choose one of the following. (1) Search your deck for a follower with Storm, reveal it, and add it to your hand. (2) Select
// a follower with Storm on your field and give it {[attack]}+3. (Storm given by an ability counts on the field; in the deck
// Gold City has no Storm — rulings.)
import { defineCard, spell } from "../helpers";
import { isFollower, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "search",
          label: "(1) A follower with Storm from your deck",
          *resolve(fx) {
            yield* fx.search((id) => isFollower(fx.game, id) && fx.game.hasKeyword(id, "storm"));
          },
        },
        {
          id: "attack",
          label: "(2) +3/+0 to a follower with Storm on your field",
          targets: [yourFollower({ filter: (g, id) => g.hasKeyword(id, "storm") })],
          *resolve(fx) {
            yield* fx.giveStats(fx.targets[0]![0]!, 3, 0);
          },
        },
      ],
    }),
  ],
});
