// BP05-084 Embracing Wings — Abysscraft spell, 3. 絶傑・魔界.
// Select an enemy follower on the field. Destroy it, deal 2 damage to your leader, and select up to
// 1 Valnareik, Omen of Lust in your cemetery and add it to your hand. (Playable without one —
// ruling. Both selections are made when it is played, CR 10.6.2.3.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, inYourZone, named } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower(), inYourZone("cemetery", { upTo: true, filter: named("Valnareik, Omen of Lust") })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
        yield* fx.dealDamage(fx.game.leader(fx.controller), 2);
        yield* fx.returnToHand((fx.targets[1] ?? []).filter((id) => fx.game.card(id)?.zone === "cemetery"));
      },
    }),
  ],
});
