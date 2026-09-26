// BP10-045 Juggling Moggy (Evolved) — Runecraft follower, 2/2. アルカナ・魔法使い・獣.
// {[lastwords]} Summon a Magic Sediment token. Add 1 to a Stack on your field. (With no Stack on your
// field that would summon a Magic Sediment instead — ruling, CR 13.3.2.4.)
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.summon(["Magic Sediment"]);
        yield* fx.addToStack(1);
      },
    }),
  ],
});
