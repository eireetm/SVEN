// DSD01b-T01 Aftershock — Dragoncraft amulet token, 3. ドラゴニュート・武闘竜人.
// Whenever a Draconic Duelist follower is put onto your field, place a lightning counter on this card. (Once for each; also in the
// opponent's turn — rulings.)
// {[act]} {[engage]}: Select a {[dragoncraft]} follower on your field and give it {[attack]}+2. Activate only if this card has at least
// 5 lightning counters.
// {[act]} {[engage]}: Select an enemy follower on the field. Destroy it and deal 3 damage to its leader. Activate only if this card has
// at least 10 lightning counters.
import { activated, defineCard, whenFollowerEntersYourField } from "../helpers";
import { enemyFollower, isClass, yourFollower } from "../targets";
import { LIGHTNING, draconicDuelist } from "./shared";

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.addCounters(fx.self, LIGHTNING, 1);
        },
      },
      { filter: draconicDuelist },
    ),
    activated(
      { engageSelf: true },
      {
        condition: (g, _c, self) => g.counters(self, LIGHTNING) >= 5,
        targets: [yourFollower({ filter: isClass("Dragoncraft") })],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 2, 0);
        },
      },
    ),
    activated(
      { engageSelf: true },
      {
        condition: (g, _c, self) => g.counters(self, LIGHTNING) >= 10,
        targets: [enemyFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          const leader = fx.game.leader(fx.game.controller(target));
          yield* fx.destroy([target]);
          yield* fx.dealDamage(leader, 3);
        },
      },
    ),
  ],
});
