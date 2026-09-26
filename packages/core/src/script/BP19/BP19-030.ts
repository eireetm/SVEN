// BP19-030 Deep-Sea Scout — Swordcraft follower, 1, 2/2. 八獄・盗賊.
// {[fanfare]} Put a Dread Pirate's Flag token into your EX area.
import { defineCard, fanfare } from "../helpers";
import { PIRATE_FLAG } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx([PIRATE_FLAG]);
      },
    }),
  ],
});
