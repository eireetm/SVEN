// BP13-060 Howling Conflagration — Dragoncraft spell, 2. 荒野・ドラゴニュート・武闘竜人.
// You may play this card for 3 more play points. (CR 10.4.7.3)
// ----------
// Select an enemy follower on the field. Deal it 3 damage and, if you played this card for 3 more play
// points, search your deck for a Drache, Fiery Dragonlord, summon it, give it Assail, then shuffle. (Not
// playable without a target — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  playOptions: [{ id: "plus3", label: "Play for 3 more play points", canPay: () => true, *pay() {}, costDelta: 3 }],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        if (fx.playOption !== "plus3") return;
        for (const id of yield* fx.search((card) => named("Drache, Fiery Dragonlord")(fx.game, card), { to: "field" })) {
          if (fx.game.card(id)?.zone === "field") yield* fx.giveKeyword(id, "assail");
        }
      },
    }),
  ],
});
