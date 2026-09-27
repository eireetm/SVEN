// ECP02-032 Hiromi Seki [Twinkle in My Eye] — Runecraft follower, 1, 1/1. デレマス・キュート.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If there are at least 5 Cute cards in your cemetery, give your leader {[defense]}+2.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { cute, inYourCemetery } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (inYourCemetery(fx.game, fx.controller, cute) >= 5) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
