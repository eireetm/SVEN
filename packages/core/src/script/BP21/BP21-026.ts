// BP21-026 Twilight and Silver — Swordcraft spell, 4. 指揮官.
// You may play this for 2 more play points.
// Choose 1. If you played this for 2 more play points, choose up to 2 instead. (1) Search your deck for a follower with
// "Amelia" in its name, summon it, then shuffle. (2) Search your deck for a follower with "Lecia" in its name, summon it,
// then shuffle. (Each option once — ruling; CR 10.4.7.3, 5.18.)
import type { EffectContext } from "../../engine/effects/context";
import { defineCard, spell } from "../helpers";
import { isFollower, nameIncludes } from "../targets";

const option = (id: string, name: string) => ({
  id,
  label: `A follower with "${name}" in its name from your deck onto the field`,
  *resolve(fx: EffectContext) {
    yield* fx.search((c) => isFollower(fx.game, c) && nameIncludes(name)(fx.game, c), { to: "field" });
  },
});

export default defineCard({
  playOptions: [{ id: "plus2", label: "Play for 2 more play points", canPay: () => true, *pay() {}, costDelta: 2 }],
  abilities: [
    spell({
      modeCount: (_g, _c, _self, playOption) => (playOption === "plus2" ? 2 : 1),
      modes: [option("amelia", "Amelia"), option("lecia", "Lecia")],
    }),
  ],
});
