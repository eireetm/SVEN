// ECP01-010 Gentildonna — Swordcraft follower, 7, 6/6. ウマ娘.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[feed]} {[cost01]}: Race this follower.
// Your opponents' {[fanfare]} and On Evolve abilities don't trigger. (Their Union Burst Fanfares neither, so they can't be
// played; On Super-Evolve abilities still trigger, and a super-evolved follower still gets +1/+1; Aura doesn't matter — rulings.)
import { defineCard, evolveAbility, serveAbility } from "../helpers";

export default defineCard({
  field: { opponentsAbilitiesDontTrigger: ["fanfare", "onEvolve"] },
  abilities: [evolveAbility(1), serveAbility(1, 1)],
});
