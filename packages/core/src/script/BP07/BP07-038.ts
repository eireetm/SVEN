// BP07-038 Riley, Hydroshaman — Runecraft follower, 3, 3/4. 魔法使い.
// {[fanfare]}, Earth Rite: Choose one of the following. If this card was put onto the field from the
// cemetery, choose up to 3 instead. (1) Select an enemy follower on the field and deal it 5
// damage. (2) Give this follower {[attack]}+3. (3) Draw 2 cards.
// (CR 13.3.3.2: only if Earth Rite is paid. (1) can't be chosen without a target; an option once
// only — rulings, CR 5.18.)
// {[act]} {[cost06]}: Summon this card from your cemetery. Give it Storm and "{[lastwords]} Banish
// this follower." (Valid in the cemetery — ruling, CR 10.3.5. "Whenever a follower is put from your
// field into the cemetery" still triggers when it is destroyed — ruling.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      earthRite: { mode: "required" },
      modeCount: (g, _c, self) => (g.enteredFrom(self) === "cemetery" ? 3 : 1),
      modes: [
        {
          id: "damage",
          label: "(1) Deal 5 damage to an enemy follower",
          targets: [enemyFollower()],
          *resolve(fx) {
            yield* fx.dealDamage(fx.targets[0]![0]!, 5);
          },
        },
        {
          id: "attack",
          label: "(2) Give this follower +3/+0",
          *resolve(fx) {
            yield* fx.giveStats(fx.self, 3, 0);
          },
        },
        {
          id: "draw",
          label: "(3) Draw 2 cards",
          *resolve(fx) {
            yield* fx.draw(2);
          },
        },
      ],
    }),
    activated(
      { playPoints: 6 },
      {
        validIn: ["cemetery"],
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone !== "cemetery") return;
          const [riley] = yield* fx.putOntoField([fx.self]);
          if (riley === undefined) return;
          yield* fx.giveKeyword(riley, "storm");
          yield* fx.grant(riley, "lastWordsBanishSelf");
        },
      },
    ),
  ],
});
