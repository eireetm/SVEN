// PCS01-048 Princess Knight — Neutral follower, 8, 2/2. プリコネ.
// {[evolve]} {[cost01]}: Evolve this.
// Each other PriConne follower on your field has Ward.
// {[fanfare]} Reveal the top card of your deck. If it's a PriConne follower, summon it. (Otherwise it stays on top.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { priconneFollower } from "../CP04/shared";
import { priconneHaveWard } from "./shared";

export default defineCard({
  field: { keywordsFor: priconneHaveWard },
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        const [top] = fx.topCards(1);
        if (top === undefined) return;
        yield* fx.reveal([top]);
        if (priconneFollower(fx.game, top)) yield* fx.putOntoField([top]);
      },
    }),
  ],
});
