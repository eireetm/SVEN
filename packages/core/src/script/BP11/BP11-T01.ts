// BP11-T01 Val, Trusty Getaway Car — Swordcraft amulet token, 2, 3/3. 荒野・乗物.
// Activate {[engage]} a Bunny & Baron, Specter Duo on your field: Maneuver this card. (For the rest of
// this turn, it becomes a follower with {[attack]}3/{[defense]}3.)
// {[act]} {[cost01]}, engage 2 followers on your field: Maneuver this card.
// Storm.
// Strike - If there's another Wasteland follower on your field, draw a card.
// (CR 5.32. Each maneuver starts from the printed numbers; abilities it was given stay; maneuvered on
// the turn it was put onto the field it attacks like a new follower — rulings.)
import { engageYourCards } from "../costs";
import { activated, defineCard, strike } from "../helpers";
import { isFollower, named } from "../targets";
import { wastelandFollower } from "./shared";

const maneuver = {
  *resolve(fx: import("../../engine/effects/context").EffectContext) {
    yield* fx.maneuver(fx.self);
  },
};

export default defineCard({
  keywords: ["storm"],
  abilities: [
    activated({ custom: engageYourCards(named("Bunny & Baron, Specter Duo"), 1) }, maneuver),
    activated({ playPoints: 1, custom: engageYourCards(isFollower, 2) }, maneuver),
    strike({
      condition: (g, p, self) => g.followers(p).some((id) => id !== self && wastelandFollower(g, id)),
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
  ],
});
