// BP04-113 Mist Shaman (Evolved) — Havencraft, 3/3.
// On Evolve: Select another follower on your field and give it Aura. (A Diamond Master with Aura
// can no longer be selected, so it no longer has to be — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { anotherYourFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [anotherYourFollower()],
      *resolve(fx) {
        yield* fx.giveKeyword(fx.targets[0]![0]!, "aura");
      },
    }),
  ],
});
