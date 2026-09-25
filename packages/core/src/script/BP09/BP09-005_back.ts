// BP09-005_back Paula, Passionate Warmth — Forestcraft follower, 3/3. 妖精. The back face of BP09-005
// (CR 2.14; its Japanese text and traits are transcribed from the card, data/fixes.ts).
// On Evolve - Select up to 2 other cards on your field and put them into their owners' EX areas. (With
// room for only one, its player picks which one goes and the other stays; tokens go too; they lose
// their effects and counters — rulings, CR 4.8.3.2, 9.1.4.1, 4.1.4.)
// Strike, Combo (3) - Select an enemy follower on the field and deal it 3 damage. (Evolving is not
// playing a card — ruling.)
import { defineCard, onEvolve, strike } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [{ count: 2, upTo: true, candidates: (g, c, self) => g.cards(c, "field").filter((id) => id !== self) }],
      *resolve(fx) {
        yield* fx.putIntoEx(fx.targets[0] ?? []);
      },
    }),
    strike({
      targets: [enemyFollower({ when: (g, c) => g.combo(c, 3) })],
      *resolve(fx) {
        const target = fx.targets[0]?.[0];
        if (target !== undefined) yield* fx.dealDamage(target, 3);
      },
    }),
  ],
});
