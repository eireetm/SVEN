// BP05-009 Noah, Vengeful Puppeteer — Forestcraft follower, 5, 3/6. 人形.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Put 2 Puppet tokens into your EX area.
// Whenever a Puppet is put onto your field, give it {[attack]}+1 and Storm.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { puppetsGetStorm } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Puppet", "Puppet"]);
      },
    }),
    puppetsGetStorm,
  ],
});
