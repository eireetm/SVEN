import { cardName, cardText } from "../../app/catalog";
import { useSettings } from "../../app/settings";
import { useApp } from "../../app/store";
import { useT } from "../../i18n";
import { useFocus } from "../focus";
import { CardArt } from "./CardArt";
import { CardText } from "./CardText";

/** The card under the pointer (or the one clicked last): picture, names, type, stats, text. */
export function CardDetails() {
  const { hover, pinned } = useFocus();
  const catalog = useApp((s) => s.catalog);
  const { cardLang } = useSettings();
  const t = useT();
  const focus = hover ?? pinned;
  if (!focus || !catalog) return <p className="sve-hint">{t("card.hint")}</p>;
  const def = catalog.def(focus.def);
  if (!def) return <p className="sve-hint">{focus.def}</p>;
  const view = focus.view;
  const names = [def.names.cn, def.names.ja].filter((n): n is string => !!n && n !== def.name);
  const stat = (label: string, now: number | null | undefined, printed: number | null) =>
    printed === null && (now === null || now === undefined) ? null : (
      <div className="sve-details-stat">
        <span>{label}</span>
        <strong>{now ?? printed}</strong>
        {now !== undefined && now !== null && printed !== null && now !== printed ? <small>{t("card.printed", { value: printed })}</small> : null}
      </div>
    );
  const text = cardText(def, cardLang);
  return (
    <div className="sve-details">
      <div className="sve-details-art">
        <CardArt printing={focus.printing} def={def.id} back={focus.back} name={def.name} subtitle={t(`type.${def.type}` as const)} />
      </div>
      <h3 className="sve-details-name">{cardName(def, cardLang)}</h3>
      {names.length > 0 ? <div className="sve-details-names">{names.join(" / ")}</div> : null}
      <div className="sve-details-type">
        {[
          t(`class.${def.class}` as const),
          t(`type.${def.type}` as const),
          def.evolved ? t("card.evolved") : null,
          def.token ? "token" : null,
          def.universe ? t(`universe.${def.universe}` as const) : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </div>
      {def.traits.length > 0 ? (
        <div className="sve-details-traits">
          {t("card.traits")}: {def.traits.join("・")}
        </div>
      ) : null}
      <div className="sve-details-stats">
        {def.type !== "leader" ? stat(t("card.cost"), view?.cost, def.cost) : null}
        {stat(t("card.attack"), view?.attack, def.attack)}
        {stat(t("card.defense"), view?.defense, def.defense)}
      </div>
      {view ? (
        <div className="sve-details-state">
          {view.keywords.length > 0 ? (
            <div>
              {t("card.keywords")}: {view.keywords.map((k) => t(`keyword.${k}` as const)).join(", ")}
            </div>
          ) : null}
          {Object.keys(view.counters).length > 0 ? (
            <div>
              {t("card.counters")}:{" "}
              {Object.entries(view.counters)
                .map(([k, n]) => `${k} ${n}`)
                .join(", ")}
            </div>
          ) : null}
          <div className="sve-details-flags">
            {view.engaged ? <span>{t("card.engaged")}</span> : null}
            {view.evolvedWith ? <span>{view.superEvolved ? t("card.superEvolved") : t("card.evolved")}</span> : null}
            {view.boxed ? <span>{t("card.boxed")}</span> : null}
            {view.damage > 0 ? <span>{t("card.damage", { n: view.damage })}</span> : null}
          </div>
        </div>
      ) : null}
      {text ? <CardText text={text} lang={cardLang} /> : <p className="sve-hint">{t("card.noText")}</p>}
      <div className="sve-details-meta">
        {def.id}
        {focus.printing && focus.printing !== def.id ? ` · ${focus.printing}` : ""} · {t(`card.status.${def.status}` as const)}
      </div>
    </div>
  );
}
