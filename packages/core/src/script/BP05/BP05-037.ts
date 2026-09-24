// BP05-037 Lishenna, Omen of Destruction — Runecraft follower, 4, 2/4. 絶傑・アイドル.
// {[fanfare]} Put a Destruction in White and a Destruction in Black token to your EX area.
// (With room for one, you pick which — ruling.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Destruction in White", "Destruction in Black"]);
      },
    }),
  ],
});
