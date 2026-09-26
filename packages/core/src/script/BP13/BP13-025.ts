// BP13-025 Levin Justice — Swordcraft spell, 3. 指揮官・レヴィオン.
// You may play this card for 2 more play points. (CR 10.4.7.3)
// ----------
// Select an enemy follower on the field. Deal it 3 damage and search your deck for a Yurius, Levin Duke,
// summon it, then shuffle. If you played this card for 2 more play points, also search your deck for an
// Albert, Levin Saber, summon it, then shuffle. (Each may be left unfound; not playable without a target
// — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  playOptions: [{ id: "plus2", label: "Play for 2 more play points", canPay: () => true, *pay() {}, costDelta: 2 }],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        yield* fx.search((id) => named("Yurius, Levin Duke")(fx.game, id), { to: "field" });
        if (fx.playOption === "plus2") yield* fx.search((id) => named("Albert, Levin Saber")(fx.game, id), { to: "field" });
      },
    }),
  ],
});
