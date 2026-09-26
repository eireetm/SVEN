// BP19-022 Gildaria, Anathema of Peace — Swordcraft follower, 5, 4/4. アナテマ・獣.
// {[evolve]} {[cost02]}: Evolve this.
// {[fanfare]} Summon a Steelclad Knight and Knight token. If there are 5 {[swordcraft]} cards on your field, evolve this.
// (With room for one the player picks; counted after the summons; not this turn's evolve ability — rulings.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isClass } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Steelclad Knight", "Knight"]);
        const swords = fx.game.cards(fx.controller, "field").filter((id) => isClass("Swordcraft")(fx.game, id)).length;
        if (swords === 5 && fx.game.card(fx.self)?.zone === "field") yield* fx.evolve(fx.self);
      },
    }),
  ],
});
