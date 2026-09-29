// The format and its restriction list, chosen in the deck builder and in the game setup's "Advanced" (the two share the
// setting). The list choice is remembered per format; unlimited has none.
import type { ReactNode } from "react";
import { updateSettings, useSettings } from "../app/settings";
import type { FormatId } from "../engine/protocol";
import { useT, type Translate } from "../i18n";
import type { FormatProblem, FormatContext } from "./formats";
import { FORMATS, formatProblemText } from "./formats";
import { listsFor, restrictionList, type RestrictionList } from "./lists";

/** "01_26_JPN (Asia, 2026-01-30)". */
export const listLabel = (list: RestrictionList, t: Translate): string =>
  t("format.listLabel", { id: list.id, region: t(`format.region.${list.region}`), date: list.updated });

export function FormatPicker() {
  const t = useT();
  const { format, restrictionLists } = useSettings();
  const setList = (id: string) => updateSettings({ restrictionLists: { ...restrictionLists, [format]: id || null } });
  return (
    <span className="sve-format-picker">
      <label className="sve-field">
        <span>{t("format.title")}</span>
        <select value={format} onChange={(e) => updateSettings({ format: e.target.value as FormatId })} data-testid="format-select">
          {FORMATS.map((f) => (
            <option key={f} value={f}>
              {t(`format.${f}`)}
            </option>
          ))}
        </select>
      </label>
      {format !== "unlimited" ? (
        <label className="sve-field">
          <span>{t("format.list")}</span>
          <select value={restrictionList(restrictionLists[format])?.id ?? ""} onChange={(e) => setList(e.target.value)} data-testid="format-list">
            <option value="">{t("format.noList")}</option>
            {listsFor(format).map((list) => (
              <option key={list.id} value={list.id}>
                {listLabel(list, t)}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </span>
  );
}

/** A deck's problems in a format, in a window: only to tell (the deck builder saves and leaves anyway). */
export function ProblemsDialog({ title, problems, ctx, children }: { title: string; problems: readonly FormatProblem[]; ctx: FormatContext; children: ReactNode }) {
  return (
    <div className="sve-modal-backdrop">
      <div className="sve-modal sve-problems-dialog" role="dialog" data-testid="format-problems">
        <header className="sve-modal-header">
          <span>{title}</span>
        </header>
        <ul className="sve-problems">
          {problems.map((problem, i) => (
            <li key={i}>{formatProblemText(problem, ctx)}</li>
          ))}
        </ul>
        <div className="sve-modal-actions">{children}</div>
      </div>
    </div>
  );
}
