// BP21-001 Castelle, Budding Mage — Forestcraft follower, 1, 1/2. エルフ族・学院・超克.
// Each Academic and Beast follower on your field not named Castelle, Budding Mage doesn't take ability damage. (Ability
// damage: all but combat damage and attack damage to a leader — rulings; CR 5.14.2.)
// {[fanfare]} If there are at least 3 Academic and/or Beast followers on your field, put a Verdant Prayer token into your EX
// area.
import { defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { academicOrBeastFollower } from "./shared";

const castelle = named("Castelle, Budding Mage");

export default defineCard({
  field: {
    damageToFollower: (g, self, d) => {
      const c = g.card(d.target);
      const mine = c?.zone === "field" && c.controller === g.card(self)!.controller;
      return d.kind === "ability" && mine && academicOrBeastFollower(g, d.target) && !castelle(g, d.target) ? -d.amount : 0;
    },
  },
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.cards(fx.controller, "field").filter((id) => academicOrBeastFollower(fx.game, id)).length >= 3) {
          yield* fx.tokensToEx(["Verdant Prayer"]);
        }
      },
    }),
  ],
});
