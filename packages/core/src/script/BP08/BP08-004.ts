// BP08-004 Zwei, Murderous Puppet — Forestcraft follower, 3, 2/2. 人形・キラー.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Select a Puppet in your EX area and transform it into a Victoria token. (CR 5.17.
// Lloyd and Victoria are also Puppets only on the field — BP08-T01 rulings.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { inYourZone, named } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      targets: [inYourZone("ex", { filter: named("Puppet") })],
      *resolve(fx) {
        yield* fx.transform(fx.targets[0]!, "Victoria");
      },
    }),
  ],
});
