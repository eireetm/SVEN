// CP04-091 Saren — Havencraft follower, 5, 3/3. プリコネ・サレンディア救護院.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Choose 1. If your leader's defense is 10 or less, choose up to 2 instead. (1) Equip this with a Glorious Feather token.
// (2) Search your deck for up to 2 Sarendia Orphanage followers that cost a total of 3 or less, summon them, then shuffle.
// (元のコスト.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { followerThat, sarendia } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      modeCount: (g, c) => (g.state.players[c].leaderDefense <= 10 ? 2 : 1),
      modes: [
        {
          id: "1",
          label: "Equip this with a Glorious Feather token",
          *resolve(fx) {
            yield* fx.equip(fx.self, "Glorious Feather");
          },
        },
        {
          id: "2",
          label: "Summon up to 2 Sarendia Orphanage followers with a total cost of 3 or less",
          *resolve(fx) {
            yield* fx.search((id) => followerThat(sarendia)(fx.game, id), { max: 2, to: "field", totalCostAtMost: 3 });
          },
        },
      ],
    }),
  ],
});
