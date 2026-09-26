// BP16-060 Nirle, Draconic Prodigy (Evolved) — Dragoncraft follower, 5/5. 荒野・竜族.
// On Evolve - Select a Wasteland follower on your field with {[evolve]} not named Nirle, Draconic Prodigy and evolve
// it. (No evolve cost; evolving it may be declined — rulings. "With {[evolve]}": its current definition has an evolve
// ability, so not an evolved one.)
import { defineCard, onEvolve } from "../helpers";
import { named, yourFollower } from "../targets";
import { wasteland } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [
        yourFollower({
          filter: (g, id) => wasteland(g, id) && g.hasEvolveAbility(g.info(id).def.id) && !named("Nirle, Draconic Prodigy")(g, id),
        }),
      ],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (fx.game.card(target)?.zone === "field") yield* fx.evolve(target);
      },
    }),
  ],
});
