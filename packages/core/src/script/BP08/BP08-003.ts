// BP08-003 Orchis, Resolute Puppet — Forestcraft evolved follower, 3/3. 人形・光輝.
// Front face of a double-faced card (CR 2.14); its back face is BP08-003_back.
// On Evolve - Summon 2 Puppet tokens.
// Once on each of your turns, when a Puppet you control leaves the field, put a Lloyd token into your
// EX area. (Lloyd and Victoria are Puppets on the field. It triggers when this card leaves together
// with the Puppet, and once in your turn however many leave — rulings, CR 10.7.4.2.)
import { defineCard, onEvolve, whenYourFollowerLeaves } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Puppet", "Puppet"]);
      },
    }),
    whenYourFollowerLeaves(
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.tokensToEx(["Lloyd"]);
        },
      },
      { onlyYourTurn: true, includeSelf: true, filter: (m) => m.before?.names.includes("Puppet") === true },
    ),
  ],
});
