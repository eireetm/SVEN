// BP05-077 Masked Puppet (Evolved) — Abysscraft follower, 3/4. 魔界・人形.
// On Evolve: Summon 2 Puppet tokens.
// During your turn, whenever a follower is put from your field into the cemetery, give this
// follower {[attack]}+1.
import { defineCard, onEvolve } from "../helpers";
import { maskedPuppetGrows } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Puppet", "Puppet"]);
      },
    }),
    maskedPuppetGrows,
  ],
});
