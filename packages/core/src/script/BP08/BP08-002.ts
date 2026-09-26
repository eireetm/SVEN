// BP08-002 Orchis, Puppet Girl — Forestcraft follower, 3, 2/2. 人形.
// {[evolve]} {[cost01]}: Evolve this follower into an Orchis, Resolute Puppet.
// {[evolve]} {[cost04]}: Evolve this follower into an Orchis, Vengeful Puppet. Activate only if there
// are at least 3 Puppetry cards in your cemetery.
// (The two faces of the double-faced BP08-003, CR 2.14, 4.6.4.)
import { defineCard, evolveAbility } from "../helpers";
import { puppetryInCemetery } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1, { into: ["Orchis, Resolute Puppet"] }),
    evolveAbility(4, { into: ["Orchis, Vengeful Puppet"], condition: (g, p) => puppetryInCemetery(g, p) >= 3 }),
  ],
});
