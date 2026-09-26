// BP16-012 Godwood Staff — Forestcraft amulet, 1. エルフ族.
// When this leaves the field, give your leader {[defense]}+1 and recover 1 play point.
import { defineCard, whenThisLeavesField } from "../helpers";

export default defineCard({
  abilities: [
    whenThisLeavesField({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
        yield* fx.recoverPlayPoints(1);
      },
    }),
  ],
});
