// CP04-074 Illya (Evolved) — Abysscraft, 3/3. プリコネ・ディアボロス.
// {[ub]} Activate {[engage]} this, banish 5 cards from your cemetery: Select an enemy follower on the field. Deal it 3 damage and
// give your leader {[defense]}+3.
// On Evolve - Search your deck for a PriConne card, bury it, then shuffle. (It may find none — ruling.)
// On Super-Evolve - Select an enemy follower on the field and deal it 5 damage. (The English text has "Onn".)
import { banishFromYour } from "../costs";
import { activated, defineCard, onEvolve, onSuperEvolve, ub } from "../helpers";
import { enemyFollower } from "../targets";
import { priconne } from "./shared";

export default defineCard({
  abilities: [
    ub(
      activated(
        { engageSelf: true, custom: banishFromYour(["cemetery"], () => true, 5) },
        {
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 3);
            yield* fx.giveLeaderDefense(fx.controller, 3);
          },
        },
      ),
    ),
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => priconne(fx.game, id), { to: "cemetery" });
      },
    }),
    onSuperEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
  ],
});
