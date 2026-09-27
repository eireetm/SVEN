// ECP01-011 Gentildonna (Evolved) — 7/7.
// Your opponents' {[fanfare]} and On Evolve abilities don't trigger. (Their Union Burst Fanfares neither, so they can't be
// played; On Super-Evolve abilities still trigger, and a super-evolved follower still gets +1/+1; Aura doesn't matter — rulings.)
// On Evolve - Deal 7 damage to each other follower on the field.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  field: { opponentsAbilitiesDontTrigger: ["fanfare", "onEvolve"] },
  abilities: [
    onEvolve({
      *resolve(fx) {
        const g = fx.game;
        const others = [...g.followers(fx.controller), ...g.followers(g.opponent(fx.controller))].filter((id) => id !== fx.self);
        yield* fx.dealDamageEach(others, 7);
      },
    }),
  ],
});
