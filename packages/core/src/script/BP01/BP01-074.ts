// BP01-074 Alchemist's Workshop — Runecraft amulet, 2. Stack.
// {[fanfare]} Summon a Strikeform Golem token.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["stack"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Strikeform Golem"]);
      },
    }),
  ],
});
