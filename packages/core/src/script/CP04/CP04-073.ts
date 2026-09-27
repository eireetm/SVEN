// CP04-073 Illya — Abysscraft follower, 2, 2/2. プリコネ・ディアボロス.
// {[ub]} Activate {[engage]} this, banish 5 cards from your cemetery: Select an enemy follower on the field. Deal it 3 damage and
// give your leader {[defense]}+3. (Without an enemy follower it can't be activated — ruling.)
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} {[cost02]} Equip this with a Dark Axe Nachtfang token.
import { banishFromYour } from "../costs";
import { activated, defineCard, equipFanfare, evolveAbility, ub } from "../helpers";
import { enemyFollower } from "../targets";

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
    evolveAbility(1),
    equipFanfare("Dark Axe Nachtfang", 2),
  ],
});
