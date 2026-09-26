// Shared pieces of BP21 Swordcraft card scripts (not a card: the file name has no set prefix).
import { whenFollowerEntersYourField } from "../helpers";

/** BP21-031 / 032 "Whenever another follower is put onto your field, give your leader {[defense]}+1." */
export const kittyLeader = whenFollowerEntersYourField(
  {
    *resolve(fx) {
      yield* fx.giveLeaderDefense(fx.controller, 1);
    },
  },
  { another: true },
);
