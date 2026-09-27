// CP04-099 Chika — Havencraft follower, 2, 2/2. プリコネ・カルミナ.
// {[evolve]} {[cost01]}: Evolve this.
// Activate {[engage]} an amulet on your field: Select another follower on your field and give it Rush, Bane or Ward.
import { engageYourCards } from "../costs";
import { activated, defineCard, evolveAbility } from "../helpers";
import { anotherYourFollower, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(1),
    activated(
      { custom: engageYourCards(isAmulet, 1) },
      {
        targets: [anotherYourFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          const [keyword] = yield* fx.choose([
            { id: "rush", label: "Rush" },
            { id: "bane", label: "Bane" },
            { id: "ward", label: "Ward" },
          ]);
          if (keyword === "rush" || keyword === "bane" || keyword === "ward") yield* fx.giveKeyword(target, keyword);
        },
      },
    ),
  ],
});
