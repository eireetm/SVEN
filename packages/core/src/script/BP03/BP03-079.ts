// BP03-079 Baccherus, Peppy Ghostie (Evolved) — Abysscraft, 2/2.
// This follower's name is also Ghost while it is on the field.
// {[lastwords]} Put this card into its owner's EX area.
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  alsoNames: ["Ghost"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.putIntoEx([fx.self]);
      },
    }),
  ],
});
