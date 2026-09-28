import { useT } from "../i18n";
import { updateSettings, useSettings, type CardLang, type UiLang } from "./settings";

/** The settings (remembered in this browser). For now only the languages: the interface's and the card text's. */
export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const t = useT();
  const settings = useSettings();
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
        <button type="button" className="sve-menu-button" onClick={onBack}>
          {t("common.back")}
        </button>
      </div>
    </div>
  );
}
