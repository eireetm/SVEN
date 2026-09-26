// BP20-057 Azurifrit, Heir to Disdain — Dragoncraft follower, 4, 3/5. 絶傑・継承者・竜族.
// {[evolve]} {[cost01]}: Evolve this.
// Ward.
// During your turn, whenever this takes ability damage, deal 1 damage to each enemy follower on the field. (Also when it is
// destroyed by it — ruling.)
// {[fanfare]} If there's another Omen card on your field or in your EX area, deal 1 damage to each follower on the field.
// (A crest in the EX area is an Omen card too.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { omen } from "./shared";
import { azurifritPing } from "./shared-dragon";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    evolveAbility(1),
    azurifritPing,
    fanfare({
      *resolve(fx) {
        const g = fx.game;
        const other = [...g.cards(fx.controller, "field"), ...g.cards(fx.controller, "ex")].some((id) => id !== fx.self && omen(g, id));
        if (other) yield* fx.dealDamageEach([...g.followers(0), ...g.followers(1)], 1);
      },
    }),
  ],
});
