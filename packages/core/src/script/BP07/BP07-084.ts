// BP07-084 Ghostwriter — Abysscraft follower, 2, 2/3. 死者.
// Whenever a follower on your field evolves, summon 2 Ghost tokens.
// Activate {[engage]}: Select a Ghost on your field and give it Bane. (A card whose name is also
// Ghost can be selected — ruling on BP03-078.)
import { activated, defineCard, whenYourFollowerEvolves } from "../helpers";
import { named, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    whenYourFollowerEvolves({
      *resolve(fx) {
        yield* fx.summon(["Ghost", "Ghost"]);
      },
    }),
    activated(
      { engageSelf: true },
      {
        targets: [yourFollower({ filter: named("Ghost") })],
        *resolve(fx) {
          yield* fx.giveKeyword(fx.targets[0]![0]!, "bane");
        },
      },
    ),
  ],
});
