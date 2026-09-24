// BP05-076 Masked Puppet — Abysscraft follower, 3, 2/3. 魔界・人形.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Put a Puppet token into your EX area.
// During your turn, whenever a follower is put from your field into the cemetery, give this
// follower {[attack]}+1.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { maskedPuppetGrows } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Puppet"]);
      },
    }),
    maskedPuppetGrows,
  ],
});
