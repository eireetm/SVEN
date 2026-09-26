// BP18-074 Draconic Mercenary — Dragoncraft follower, 6, 4/6. ドラゴニュート・竜使い・傭兵.
// Ward.
// {[fanfare]} Summon a Hellflame Dragon or Dragon token.
// {[act]} {[cost02]}, engage this: Summon a Hellflame Dragon or Dragon token.
import type { EffectContext } from "../../engine/effects/context";
import { activated, defineCard, fanfare } from "../helpers";

function* dragonOrHellflame(fx: EffectContext) {
  const [name] = yield* fx.choose([
    { id: "Hellflame Dragon", label: "Summon a Hellflame Dragon" },
    { id: "Dragon", label: "Summon a Dragon" },
  ]);
  if (name) yield* fx.summon([name]);
}

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* dragonOrHellflame(fx);
      },
    }),
    activated(
      { playPoints: 2, engageSelf: true },
      {
        *resolve(fx) {
          yield* dragonOrHellflame(fx);
        },
      },
    ),
  ],
});
