// BP21-018 Wild Profusion — Forestcraft amulet, 2. 妖精.
// {[fanfare]} Summon a Fairy token.
// Activate {[engage]} this, bury this: Select an enemy follower on the field and deal it X damage. X equals the total number of
// Pixie token followers on your field and in your EX area.
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { FAIRY, pixieTokenFollower } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon([FAIRY]);
      },
    }),
    activated(
      { engageSelf: true, burySelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          const g = fx.game;
          const x = [...g.cards(fx.controller, "field"), ...g.cards(fx.controller, "ex")].filter((id) => pixieTokenFollower(g, id)).length;
          if (x > 0) yield* fx.dealDamage(fx.targets[0]![0]!, x);
        },
      },
    ),
  ],
});
