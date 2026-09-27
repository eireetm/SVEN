// CP04-100 Chika (Evolved) — Havencraft, 3/3. プリコネ・カルミナ.
// {[ub]} On Evolve - Search your deck for a Carmina card, reveal it, add it to your hand, then shuffle. (Finding none, it is still
// executed — ruling. The English text has "Search for your deck".)
// Activate {[engage]} an amulet on your field: Select another follower on your field and give it Rush, Bane or Ward.
import { engageYourCards } from "../costs";
import { activated, defineCard, onEvolve, ub } from "../helpers";
import { anotherYourFollower, isAmulet } from "../targets";
import { carmina } from "./shared";

export default defineCard({
  abilities: [
    ub(
      onEvolve({
        *resolve(fx) {
          yield* fx.search((id) => carmina(fx.game, id));
        },
      }),
    ),
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
