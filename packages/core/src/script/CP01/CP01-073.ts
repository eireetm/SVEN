// CP01-073 Fate's Forecast — Havencraft amulet, 4. ウマ娘.
// {[fanfare]} Select an enemy follower on the field and destroy it.
// Activate {[engage]}, put this card into its owner's cemetery: Look at the top card of your deck. If it costs 7 play points,
// you may reveal it and add it to your hand. (Not taken: it stays on top, unrevealed — ruling.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { mayTakeTopCard } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        *resolve(fx) {
          yield* mayTakeTopCard(fx, (g, id) => g.info(id).cost === 7);
        },
      },
    ),
  ],
});
