import { useT } from "../i18n";
import { applyUiTransparency, currentUiTransparency } from "../resources/resources";
import { updateSettings, useSettings, type CardLang, type UiLang } from "./settings";

/** The settings (remembered in this browser): the languages (the interface's and the card text's), the appearance. */
export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const t = useT();
  const settings = useSettings();
  // Applied at once, so that the slider shows the style's own value after "default".
  const setTransparency = (value: number | null) => {
    applyUiTransparency(value);
    updateSettings({ uiTransparency: value });
  };
  const transparency = settings.uiTransparency ?? currentUiTransparency();
  return (
    <div className="sve-menu">
      <div className="sve-menu-panel sve-settings">
        <h2>{t("settings.title")}</h2>
        <section className="sve-settings-group">
          <h3>{t("settings.language")}</h3>
          <label className="sve-settings-row">
            <span>{t("settings.uiLang")}</span>
            <select value={settings.uiLang} onChange={(e) => updateSettings({ uiLang: e.target.value as UiLang })} data-testid="settings-ui-lang">
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
            </select>
          </label>
          <label className="sve-settings-row">
            <span>{t("settings.cardLang")}</span>
            <select value={settings.cardLang} onChange={(e) => updateSettings({ cardLang: e.target.value as CardLang })}>
              <option value="en">English</option>
              <option value="cn">中文</option>
              <option value="ja">日本語</option>
            </select>
          </label>
        </section>
        <section className="sve-settings-group">
          <h3>{t("settings.appearance")}</h3>
          <div className="sve-settings-row">
            <label htmlFor="sve-ui-transparency">{t("settings.uiTransparency")}</label>
            <span className="sve-settings-slider">
              <input
                id="sve-ui-transparency"
                type="range"
                min={0}
                max={0.6}
                step={0.01}
                value={transparency}
                onChange={(e) => setTransparency(Number(e.target.value))}
                data-testid="settings-ui-transparency"
              />
              <output className="sve-settings-value">{Math.round(transparency * 100)}%</output>
              <button type="button" disabled={settings.uiTransparency === null} onClick={() => setTransparency(null)}>
                {t("settings.default")}
              </button>
            </span>
          </div>
        </section>
        <button type="button" className="sve-menu-button" onClick={onBack}>
          {t("common.back")}
        </button>
      </div>
    </div>
  );
}
