// BP20-041 Axia, Heir to Destruction (Evolved) — 3/3.
// Once per turn, whenever an Idolatry amulet is put onto your field, select an enemy follower on the field and deal it 2
// damage. (On the opponent's turn too — ruling.)
// On Evolve - Bury another Idolatry card on your field: Search your deck for a follower with "Lishenna" in its name, reveal
// it, add it to your hand, then shuffle. (CR 10.4.7.4.)
// On Super Evolve - Deal each enemy leader damage equal to the number of Idolatry cards on your field.
import { defineCard, onEvolve, onSuperEvolve, whenCardEntersYourField } from "../helpers";
import { enemyFollower, isFollower, nameIncludes } from "../targets";
import { idolatry } from "./shared";
import { buryAnotherIdolatry, idolatryOnField } from "./shared-rune";

export default defineCard({
  abilities: [
    {
      ...whenCardEntersYourField(
        {
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 2);
          },
        },
        { type: "amulet", filter: idolatry },
      ),
      oncePerTurn: true,
    },
    onEvolve({
      cost: buryAnotherIdolatry,
      *resolve(fx) {
        yield* fx.search((id) => isFollower(fx.game, id) && nameIncludes("Lishenna")(fx.game, id));
      },
    }),
    onSuperEvolve({
      *resolve(fx) {
        const n = idolatryOnField(fx.game, fx.controller);
        if (n > 0) yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), n);
      },
    }),
  ],
});
