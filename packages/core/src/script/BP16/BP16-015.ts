// BP16-015 Good Fairy of the Pond — Forestcraft follower, 1, 2/1. 妖精.
// {[fanfare]}/{[lastwords]} Put a Fairy token into your EX area.
import { defineCard, fanfare, lastWords } from "../helpers";
import { FAIRY } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([FAIRY]);
      },
    }),
    lastWords({
      *resolve(fx) {
        yield* fx.tokensToEx([FAIRY]);
      },
    }),
  ],
});
