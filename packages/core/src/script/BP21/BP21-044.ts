// BP21-044 Mystic Rune — Runecraft amulet, 2. 錬金術師・土の印.
// Stack.
// {[fanfare]} Put an Emergency Summoning token or a Reactive Barrier token into your EX area.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["stack"],
  abilities: [
    fanfare({
      *resolve(fx) {
        const [pick] = yield* fx.choose([
          { id: "summoning", label: "Emergency Summoning" },
          { id: "barrier", label: "Reactive Barrier" },
        ]);
        yield* fx.tokensToEx([pick === "barrier" ? "Reactive Barrier" : "Emergency Summoning"]);
      },
    }),
  ],
});
