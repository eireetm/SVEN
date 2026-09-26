// BP08-003_back Orchis, Vengeful Puppet — Forestcraft evolved follower, 4/4. 人形・キラー.
// Back face of BP08-003 (CR 2.14).
// On Evolve - Summon 4 Puppet tokens.
// While this card is on your field, each Puppet on your field has Assail.
// Whenever a Puppet you control leaves the field, select an enemy leader or enemy follower on the
// field and deal it 2 damage. (Once per Puppet, and also when this card leaves together with them;
// it resolves before the abilities of the opponent's cards — rulings, CR 10.7.2.1, 10.7.4.2.)
import { defineCard, onEvolve, whenYourFollowerLeaves } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  field: {
    keywordsFor: (g, self, card) =>
      g.controller(card) === g.controller(self) && g.typeAndTraits(card).type === "follower" && g.namesOf(card).includes("Puppet")
        ? ["assail"]
        : [],
  },
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Puppet", "Puppet", "Puppet", "Puppet"]);
      },
    }),
    whenYourFollowerLeaves(
      {
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
      { includeSelf: true, filter: (m) => m.before?.names.includes("Puppet") === true },
    ),
  ],
});
