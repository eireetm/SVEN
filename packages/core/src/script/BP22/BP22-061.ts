// BP22-061 黒白の乱舞・ノール＆ブラン (evolved) — Dragoncraft, 4/4. ドラゴニュート.
// 【守護】
// これがアクト状態である限り、これは能力ダメージを受けない。これは能力によって破壊されない。（交戦ダメージでは破壊される）
// (Ward. While this is engaged, it doesn't take ability damage and can't be destroyed by abilities — the condition read as covering
// both sentences, as BP10-001's two sentences are one ability in English (open-questions Q10); being put into the cemetery is not
// being destroyed (ruling). Ability damage: all damage but combat damage and attack damage to a leader (ruling, CR 5.14.3).)
import { defineCard } from "../helpers";

const engaged = (g: import("../../engine/query").GameReader, self: string) => g.card(self)?.engaged === true;

export default defineCard({
  keywords: ["ward"],
  cannotBeDestroyedByAbilities: engaged,
  field: { damageTaken: (g, self, damage) => (damage.kind === "ability" && engaged(g, self) ? -damage.amount : 0) },
});
