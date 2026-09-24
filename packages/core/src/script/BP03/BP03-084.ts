// BP03-084 Pumpkin Necromancer — Abysscraft follower, 3, 3/3. 死者.
// {[fanfare]} Put a Gargantuan Ghost into your EX area.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Gargantuan Ghost"]);
      },
    }),
  ],
});
