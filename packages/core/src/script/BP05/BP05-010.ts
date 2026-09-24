// BP05-010 Noah, Vengeful Puppeteer (Evolved) — Forestcraft follower, 4/7. 人形.
// While this card is on your field, any Puppet you play costs 1 less.
// Whenever a Puppet is put onto your field, give it {[attack]}+1 and Storm.
import { defineCard } from "../helpers";
import { named } from "../targets";
import { puppetsGetStorm } from "./shared";

export default defineCard({
  field: {
    playCostOf: (g, self, card, player) => (player === g.controller(self) && named("Puppet")(g, card) ? -1 : 0),
  },
  abilities: [puppetsGetStorm],
});
