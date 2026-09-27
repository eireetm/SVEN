// CP02-051 Full Bloom Panorama — Runecraft spell, 5. デレマス・クール.
// {[quick]}
// Select up to 2 enemy followers on the field and destroy them.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower({ count: 2, upTo: true })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0] ?? []);
      },
    }),
  ],
});
