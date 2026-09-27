// CP04-087 Kuuka — Abysscraft follower, 2, 2/3. プリコネ・ヴァイスフリューゲル.
// {[ub]} Activate {[engage]} this: Give this Ward.
// While this is on the field, your opponents must select it for abilities if able. (As many such requirements as the count allows,
// CR 1.3.2.3; not attacks, discards, costs, or cards elsewhere; not through Aura — rulings.)
import { activated, defineCard, ub } from "../helpers";

export default defineCard({
  mustBeSelected: true,
  abilities: [
    ub(
      activated(
        { engageSelf: true },
        {
          *resolve(fx) {
            if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveKeyword(fx.self, "ward");
          },
        },
      ),
    ),
  ],
});
