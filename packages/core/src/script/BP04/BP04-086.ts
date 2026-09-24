// BP04-086 Trial of the Gorgons — Abysscraft spell, 7. 魔界・ゴルゴーン.
// Search your deck for a Venomfang Medusa, Stheno, and Euryale and put them onto your field.
// Any of them may be left unfound; with too little room the player picks which ones enter
// (rulings; CR 4.4.4.2).
import { defineCard, spell } from "../helpers";
import { named } from "../targets";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const names = ["Venomfang Medusa", "Stheno", "Euryale"];
        yield* fx.searchEach(
          names.map((name) => (id: string) => named(name)(fx.game, id)),
          { to: "field" },
        );
      },
    }),
  ],
});
