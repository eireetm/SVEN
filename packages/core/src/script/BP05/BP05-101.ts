// BP05-101 Realm of Repose — Havencraft amulet, 1. 絶傑・狂信.
// {[quick]} Activate {[engage]}, put this card into its owner's cemetery: For the rest of this
// turn, if your leader would take more than 4 damage, it takes 4 instead. (Each instance of damage,
// not the total — ruling.)
import { activated, defineCard } from "../helpers";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true, burySelf: true },
      {
        quick: true,
        *resolve(fx) {
          yield* fx.capDamage(fx.game.leader(fx.controller), 4, "endOfTurn");
        },
      },
    ),
  ],
});
