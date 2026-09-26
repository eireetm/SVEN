// BP12-030 Lilje, Butler of the Mists (Evolved) — Swordcraft follower, 3/3. 兵士.
// Ward.
// Each Azord, Duke of the Mists on your field has Storm and "Strike - Give this follower {[attack]}
// +2/{[defense]}+2." (While this card is on the field.)
// On Evolve - Search your deck for an Azord, Duke of the Mists, reveal it, add it to your hand, then
// shuffle.
import { defineCard, onEvolve } from "../helpers";
import { named } from "../targets";
import { AZORD } from "./shared";
import { liljeGivesAzord } from "./shared-sword";

export default defineCard({
  keywords: ["ward"],
  field: liljeGivesAzord,
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.search((id) => named(AZORD)(fx.game, id));
      },
    }),
  ],
});
