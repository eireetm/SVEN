// BP01-058 Juno's Secret Laboratory — Runecraft amulet, 5.
// {[fanfare]} Summon a Guardform Golem or Strikeform Golem token.
// {[act]}{[engage]}: Summon a Magic Sediment token.
// {[act]}{[engage]}, Earth Rite: Summon a Guardform Golem or Strikeform Golem token.
// (Removing a Stack amulet's last counter for Earth Rite frees its field slot first — ruling.)
import { activated, defineCard, fanfare } from "../helpers";
import type { EffectContext } from "../../engine/effects/context";

function* golem(fx: EffectContext) {
  const [name] = yield* fx.choose([
    { id: "Guardform Golem", label: "Guardform Golem" },
    { id: "Strikeform Golem", label: "Strikeform Golem" },
  ]);
  yield* fx.summon([name!]);
}

export default defineCard({
  abilities: [
    fanfare({ resolve: golem }),
    activated(
      { engageSelf: true },
      {
        *resolve(fx) {
          yield* fx.summon(["Magic Sediment"]);
        },
      },
    ),
    activated({ engageSelf: true }, { earthRite: { mode: "required" }, resolve: golem }),
  ],
});
