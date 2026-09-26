// BP19-019 Barbaros, Briny Convict — Swordcraft follower, 4, 3/3. 八獄・盗賊.
// {[evolve]} {[cost01]}: Evolve this.
// Loot cards in your EX area cost 1 less to play. (During your turn — the Japanese, Chinese and official English texts.)
// {[fanfare]} Put a Dread Pirate's Flag token into your EX area.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { PIRATE_FLAG } from "./shared";
import { lootDiscount } from "./shared-sword";

export default defineCard({
  field: { playCostOf: lootDiscount },
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([PIRATE_FLAG]);
      },
    }),
  ],
});
