// CP02-107 Trainer — Neutral follower, 2, 2/3. デレマス.
// {[fanfare]} Select another iM@S CG follower on your field and give it Bane or Drain.
import { defineCard, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";
import { imas } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [anotherYourFollower({ filter: imas })],
      *resolve(fx) {
        const [keyword] = yield* fx.choose([
          { id: "bane", label: "Bane" },
          { id: "drain", label: "Drain" },
        ]);
        yield* fx.giveKeyword(fx.targets[0]![0]!, keyword === "bane" ? "bane" : "drain");
      },
    }),
  ],
});
