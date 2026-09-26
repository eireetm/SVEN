// BP15-100 Cyclical Fate — Havencraft spell, 5. 先導・超克.
// Search your deck for a Deus Ex Machina, summon it, then shuffle. Summon an Ancient Artifact or Mystic Artifact
// token. (The token even if none is found — ruling.)
import { defineCard, spell } from "../helpers";
import { named } from "../targets";

const ARTIFACTS = ["Ancient Artifact", "Mystic Artifact"];

export default defineCard({
  abilities: [
    spell({
      *resolve(fx) {
        yield* fx.search((id) => named("Deus Ex Machina")(fx.game, id), { to: "field" });
        const [token] = yield* fx.choose(ARTIFACTS.map((name) => ({ id: name, label: name })));
        if (token !== undefined) yield* fx.summon([token]);
      },
    }),
  ],
});
