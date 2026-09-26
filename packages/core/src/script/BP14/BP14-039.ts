// BP14-039 Bergent, Layered Sorceress — Runecraft follower, 2, 2/2. 魔法使い・魔法生物.
// This can't be played from the EX area.
// ----------
// {[evolve]} {[cost01]}: Evolve this.
// At the start of your end phase, if this is in your EX area, look at the top card of your deck. If it's an
// Onion Patch, you may summon it. Otherwise, put it on the top or bottom of your deck. (Valid in the EX area;
// each copy there triggers — rulings.)
import { atStartOfYourEndPhase, defineCard, evolveAbility } from "../helpers";
import { named } from "../targets";

export default defineCard({
  playableIf: (g, self) => g.playZone(self) !== "ex",
  abilities: [
    evolveAbility(1),
    {
      ...atStartOfYourEndPhase({
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone !== "ex") return;
          const top = fx.topCards(1);
          if (top.length === 0) return;
          yield* fx.lookAt(top);
          const onions = top.filter((id) => named("Onion Patch")(fx.game, id));
          const [onion] = yield* fx.selectCards(onions, 0, onions.length, fx.controller, top);
          if (onion !== undefined) {
            yield* fx.putOntoField([onion]);
            return;
          }
          const [where] = yield* fx.choose([
            { id: "top", label: "Put it on the top of your deck" },
            { id: "bottom", label: "Put it on the bottom of your deck" },
          ]);
          if (where === "bottom") yield* fx.putOnDeck(top, "bottom");
        },
      }),
      validIn: ["ex"],
    },
  ],
});
