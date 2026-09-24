// BP02-016 Elf Bard — Forestcraft follower, 2, 2/2.
// Whenever one of your followers evolves, put a Fairy Wisp token into your EX area.
import { defineCard, whenYourFollowerEvolves } from "../helpers";

export default defineCard({
  abilities: [
    whenYourFollowerEvolves({
      *resolve(fx) {
        yield* fx.tokensToEx(["Fairy Wisp"]);
      },
    }),
  ],
});
