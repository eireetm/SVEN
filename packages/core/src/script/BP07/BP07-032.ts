// BP07-032 Dauntless Commander (Evolved) — 3/4.
// {[lastwords]} Put this card into its owner's EX area unevolved.
// The evolved card goes faceup onto the evolve deck when it leaves the field (CR 5.16.3); the
// Last Words then puts the unevolved card from the cemetery into the EX area (ruling; "this card"
// after the move, CR 4.1.4.1).
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    lastWords({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "cemetery") yield* fx.putIntoEx([fx.self]);
      },
    }),
  ],
});
