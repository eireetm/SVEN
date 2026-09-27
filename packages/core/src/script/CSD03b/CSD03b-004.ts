// CSD03b-004 Dragon Knight, Aleph — Dragoncraft follower, 3, 3/3. ヴァンガード・かげろう.
// {[evolve]} {[cost01]}: Evolve this follower into a Embodiment of Victory, Aleph. (CR 5.16.1.1.1.)
// {[fanfare]} If there's an Embodiment of Armor, Bahr and Embodiment of Spear, Tahr in your cemetery, evolve this follower into an
// Embodiment of Victory, Aleph. (Not the turn's evolve ability — ruling, CR 8.3.2.1.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { named } from "../targets";

const ALEPH = "Embodiment of Victory, Aleph";

export default defineCard({
  abilities: [
    evolveAbility(1, { into: [ALEPH] }),
    fanfare({
      *resolve(fx) {
        const cemetery = fx.game.cards(fx.controller, "cemetery");
        const has = (name: string) => cemetery.some((id) => named(name)(fx.game, id));
        if (has("Embodiment of Armor, Bahr") && has("Embodiment of Spear, Tahr")) yield* fx.evolve(fx.self, { into: [ALEPH] });
      },
    }),
  ],
});
