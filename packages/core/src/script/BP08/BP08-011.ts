// BP08-011 Heartless Battle — Forestcraft spell, 3. 人形・キラー.
// Select 2 cards named Puppet in your EX area. Transform one into a Lloyd token and the other into a
// Victoria token. (One of each; with fewer than 2 Puppets it can't be played — rulings, CR 5.17,
// 10.6.2.3.3.)
import { defineCard, spell } from "../helpers";
import { inYourZone, named } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [inYourZone("ex", { count: 2, filter: named("Puppet") })],
      *resolve(fx) {
        const puppets = fx.targets[0]!;
        const [lloyd] = yield* fx.chooseCards(puppets, 1, 1);
        yield* fx.transform([lloyd!], "Lloyd");
        yield* fx.transform(puppets.filter((id) => id !== lloyd), "Victoria");
      },
    }),
  ],
});
