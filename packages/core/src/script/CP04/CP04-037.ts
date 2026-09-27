// CP04-037 Karyl — Runecraft follower, 4, 3/4. プリコネ・美食殿.
// {[ub]}{[fanfare]} Discard a spell: Select an enemy follower on the field. Deal it 3 damage and draw a card. (Without an enemy
// follower it can't be played — ruling.)
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} {[cost02]} Equip this with a Chaos Grimoire token.
import { discardA } from "../costs";
import { defineCard, equipFanfare, evolveAbility, fanfare, ub } from "../helpers";
import { enemyFollower, isSpell } from "../targets";

export default defineCard({
  abilities: [
    ub(
      fanfare({
        cost: discardA(isSpell),
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
          yield* fx.draw(1);
        },
      }),
    ),
    evolveAbility(1),
    equipFanfare("Chaos Grimoire", 2),
  ],
});
