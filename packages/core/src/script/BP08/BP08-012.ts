// BP08-012 Junk — Forestcraft follower, 1, 1/2. 人形.
// {[fanfare]} Put 2 Puppet tokens into your EX area.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Puppet", "Puppet"]);
      },
    }),
  ],
});
