// BP20-016 Ageless Bystander — Forestcraft follower, 2, 2/3. エルフ族.
// {[fanfare]} Put a Fairy Wisp token into your EX area.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Fairy Wisp"]);
      },
    }),
  ],
});
