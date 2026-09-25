// BP09-061 Galua of Two Breaths — Dragoncraft follower, 4, 5/5. 竜族.
// {[fanfare]} {[cost02]}: Select an enemy card on the field and destroy it. (CR 10.4.7.4: the player
// may pay 2 play points as the Fanfare resolves.)
import { playPointsCost } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { enemyCardOnField } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: playPointsCost(2),
      targets: [enemyCardOnField()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
      },
    }),
  ],
});
