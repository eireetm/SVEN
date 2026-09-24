// BP05-016 Automaton Soldier — Forestcraft follower, 3, 3/4. 人形・虫族.
// Ward.
// {[fanfare]} Put 2 Puppet tokens into your EX area.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Puppet", "Puppet"]);
      },
    }),
  ],
});
