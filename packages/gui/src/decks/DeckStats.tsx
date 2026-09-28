// A deck at a glance, beside the main deck's title: how many followers, spells and amulets, and the cost curve (0 to 8+).
import type { CardDefinition } from "@sve/core";
import { useT } from "../i18n";

const CURVE = ["0", "1", "2", "3", "4", "5", "6", "7", "8+"];

export function DeckStats({ printings, defOf }: { printings: readonly string[]; defOf: (printing: string) => Pick<CardDefinition, "type" | "cost"> | undefined }) {
  const t = useT();
  const types = { follower: 0, spell: 0, amulet: 0 };
  const curve = CURVE.map(() => 0);
  for (const printing of printings) {
    const def = defOf(printing);
    if (!def) continue;
    if (def.type === "follower" || def.type === "spell" || def.type === "amulet") types[def.type] += 1;
    if (def.cost !== null) curve[Math.min(8, Math.max(0, def.cost))]! += 1;
  }
  const highest = Math.max(1, ...curve);
  return (
    <span className="sve-deck-stats">
      <span>{t("builder.stats.follower", { n: types.follower })}</span>
      <span>{t("builder.stats.spell", { n: types.spell })}</span>
      <span>{t("builder.stats.amulet", { n: types.amulet })}</span>
      <span className="sve-curve" title={t("builder.stats.curve")}>
        {curve.map((n, i) => (
          <span key={CURVE[i]} className="sve-curve-bar" title={`${CURVE[i]}: ${n}`}>
            <span className="sve-curve-fill" style={{ height: `${(n / highest) * 100}%` }} />
            <span className="sve-curve-label">{CURVE[i]}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
