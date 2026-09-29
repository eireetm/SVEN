import { useState } from "react";
import { cardName, cardText } from "../../app/catalog";
import { type CardLang, useSettings } from "../../app/settings";
import { useApp } from "../../app/store";
import { traitName } from "../../app/traits";
import { findCard, sideOf } from "../../engine/view-utils";
import { htmlLang, useT } from "../../i18n";
import { counterName } from "../../i18n/counters";
import { useFocusSelect } from "../focus";
import { ArtViewer, type ArtFace } from "./ArtViewer";
import { CardArt } from "./CardArt";
import { CardText } from "./CardText";
import { displayOf } from "./display";

const LANGS: readonly CardLang[] = ["en", "cn", "ja"];

/**
 * The last card the pointer went over: picture (click it for a large one), names, type, traits, stats, text, printings. A
 * card of the game is followed while it stays in its zone (it evolves, takes damage ...); once it moves it is a new card
 * (CR 4.1.4) and the panel keeps what it was.
 */
export function CardDetails() {
  const shown = useFocusSelect((f) => f.shown);
  const update = useApp((s) => s.update);
  const catalog = useApp((s) => s.catalog);
  const { cardLang, uiLang } = useSettings();
  const t = useT();
  const [viewing, setViewing] = useState<readonly ArtFace[] | null>(null);
  if (!shown || !catalog) return <p className="sve-hint">{t("card.hint")}</p>;
  const now = shown.id && update ? findCard(update.view, shown.id) : null;
  const focus = now && update ? { ...displayOf(now, sideOf(update.view, now.id), catalog), view: now } : shown;
  const def = catalog.def(focus.def);
  if (!def) return <p className="sve-hint">{focus.def}</p>;
  const view = focus.view;
  // The name in the card language, then in the other two (each drawn in its own language's characters).
  const name = cardName(def, cardLang);
  const others = LANGS.filter((l) => l !== cardLang)
    .map((l) => ({ lang: l, name: cardName(def, l, "") }))
    .filter((o) => o.name !== "" && o.name !== name);
  const stat = (label: string, now: number | null | undefined, printed: number | null) =>
    printed === null && (now === null || now === undefined) ? null : (
      <div className="sve-details-stat">
        <span>{label}</span>
        <strong>{now ?? printed}</strong>
        {now !== undefined && now !== null && printed !== null && now !== printed ? <small>{t("card.printed", { value: printed })}</small> : null}
      </div>
    );
  const text = cardText(def, cardLang);
  // The physical card's printings (a back face has none: its front's).
  const physical = def.frontFace ? catalog.def(def.frontFace) : def;
  const printings = physical?.printings ?? [];
  const printing = focus.printing ?? printings[0] ?? null;
  const faces = (): ArtFace[] => {
    const front = physical ?? def;
    const face = (id: string, back: boolean): ArtFace => ({ def: id, printing, back, name: cardName(catalog.def(id), cardLang, id) });
    return front.backFace ? [face(front.id, false), face(front.backFace, true)] : [face(def.id, focus.back ?? false)];
  };
  return (
    <div className="sve-details">
      <button type="button" className="sve-details-art" onClick={() => setViewing(faces())} title={t("card.enlarge")} data-testid="details-art">
        <CardArt printing={focus.printing} def={def.id} back={focus.back} name={name} subtitle={t(`type.${def.type}` as const)} />
      </button>
      <h3 className="sve-details-name" lang={htmlLang(cardLang)}>
        {name}
      </h3>
      {others.length > 0 ? (
        <div className="sve-details-names">
          {others.map((o, i) => (
            <span key={o.lang} lang={htmlLang(o.lang)}>
              {i > 0 ? " / " : ""}
              {o.name}
            </span>
          ))}
        </div>
      ) : null}
      <div className="sve-details-type">
        {[
          t(`class.${def.class}` as const),
          t(`type.${def.type}` as const),
          def.evolved ? t("card.evolved") : null,
          def.token ? t("card.token") : null,
          def.universe ? t(`universe.${def.universe}` as const) : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </div>
      {def.traits.length > 0 ? (
        <div className="sve-details-traits">
          {t("card.traits")}: <span lang={htmlLang(cardLang)}>{def.traits.map((trait) => traitName(trait, cardLang)).join("・")}</span>
          <span className="sve-details-other">
            {" ("}
            {LANGS.filter((l) => l !== cardLang).map((l, i) => (
              <span key={l} lang={htmlLang(l)}>
                {i > 0 ? " / " : ""}
                {def.traits.map((trait) => traitName(trait, l)).join("・")}
              </span>
            ))}
            {")"}
          </span>
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
                .map(([k, n]) => `${counterName(k, uiLang)} ${n}`)
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
        {printing ?? def.id}
        {printing && physical && printing !== physical.id ? ` · ${t("card.altPrinting", { card: physical.id })}` : ""} · {t(`card.status.${def.status}` as const)}
      </div>
      {printings.length > 1 ? (
        <div className="sve-details-printings" data-testid="details-printings">
          {t("card.printings")}:{" "}
          {printings.map((p, i) => (
            <span key={p} className={p === printing ? "sve-current" : undefined}>
              {i > 0 ? " · " : ""}
              {p}
            </span>
          ))}
        </div>
      ) : null}
      {viewing ? <ArtViewer faces={viewing} onClose={() => setViewing(null)} /> : null}
    </div>
  );
}
