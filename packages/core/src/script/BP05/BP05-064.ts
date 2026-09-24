// BP05-064 Silver Automaton — Dragoncraft follower, 4, 4/5. 巨人・超克.
// Ward.
// {[lastwords]} Put 2 Puppet tokens into your EX area.
import { defineCard, lastWords } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    lastWords({
      *resolve(fx) {
        yield* fx.tokensToEx(["Puppet", "Puppet"]);
      },
    }),
  ],
});
