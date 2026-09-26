// BP19-008 Synchronous Hearts — Forestcraft spell, 5. 人形・キラー.
// Search your deck for a 3-cost or less card with "Orchis" in its name and a 3-cost or less card with "Zwei" in its name,
// summon them, then shuffle. Put 2 Puppet tokens into your EX area.
// (Followers — the Japanese, Chinese and official English texts; 元のコスト; either may be left out — ruling.)
import { defineCard, spell } from "../helpers";
import { costAtMost, isFollower, nameIncludes } from "../targets";
import { PUPPET } from "./shared";

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        const g = fx.game;
        const small = (part: string) => (id: string) => isFollower(g, id) && nameIncludes(part)(g, id) && costAtMost(3)(g, id);
        yield* fx.searchEach([small("Orchis"), small("Zwei")], { to: "field" });
        yield* fx.tokensToEx([PUPPET, PUPPET]);
      },
    }),
  ],
});
