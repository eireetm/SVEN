// CP01-045 King Halo — Dragoncraft follower, 6, 4/4. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[fanfare]} Choose one of the following. (1) Put the top card of your deck into your EX area. Do this 3 times. (2) Search your
// deck for a Kawakami Princess and put it onto your field. (Only the putting is repeated; with less room, fewer — rulings.)
import { defineCard, fanfare, serveAbility } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    fanfare({
      modes: [
        {
          id: "ex",
          label: "(1) The top card of your deck into your EX area, 3 times",
          *resolve(fx) {
            for (let i = 0; i < 3; i++) yield* fx.topToEx(1);
          },
        },
        {
          id: "kawakami",
          label: "(2) A Kawakami Princess from your deck onto your field",
          *resolve(fx) {
            yield* fx.search((id) => named("Kawakami Princess")(fx.game, id), { to: "field" });
          },
        },
      ],
    }),
  ],
});
