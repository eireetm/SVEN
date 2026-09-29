// A Quick card or ability played at quick timing (CR 7.4.5 / 8.4.7) resolves at once: the game then waits until the person
// at the screen has seen it (the host holds on, GameUpdate.announcement). The window tells who played what, what it selected
// and what was chosen; the card comes out to its player's corner of the table (the opponent's top right, one's own bottom
// left) and arrows point at the selected cards still on the table. OK (or Enter / Escape) lets the game go on.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CardId, Decision } from "@sve/core";
import { cardName } from "../../app/catalog";
import { useSettings } from "../../app/settings";
import { engine, useApp } from "../../app/store";
import type { CardInfo, GameUpdate, QuickAnnouncement as Announcement } from "../../engine/protocol";
import { findCard } from "../../engine/view-utils";
import { useT } from "../../i18n";
import { flyIn } from "../animation/effects";
import { CardTile } from "../card/CardTile";
import { setHighlight } from "../focus";
import { cardLabel, playerLabel } from "../labels";
import { optionText } from "../options";
import { Arrow, cardCenter, type Point } from "./Arrow";

export function QuickAnnouncement({ update }: { update: GameUpdate }) {
  const announcement = update.announcement;
  return announcement ? <AnnouncementWindow key={announcement.seq} update={update} announcement={announcement} /> : null;
}

function AnnouncementWindow({ update, announcement: a }: { update: GameUpdate; announcement: Announcement }) {
  const t = useT();
  const catalog = useApp((s) => s.catalog);
  const { cardLang, animations } = useSettings();
  const cardRef = useRef<HTMLDivElement>(null);
  const [arrows, setArrows] = useState<{ from: Point; to: Point }[]>([]);
  const own = a.player === update.perspective;
  const ok = () => engine.send({ kind: "acknowledge", seq: a.seq });

  // The card comes from the middle of the table, where it resolved, to its corner.
  useLayoutEffect(() => {
    const element = cardRef.current;
    const mats = document.querySelector(".sve-mats")?.getBoundingClientRect();
    if (!element || !mats || !animations) return;
    const box = element.getBoundingClientRect();
    flyIn(element, new DOMRect(mats.left + mats.width / 2 - box.width / 2, mats.top + mats.height / 2 - box.height / 2, box.width, box.height), 420);
  }, [animations]);

  // The selected cards still on the table light up; once the card has arrived, arrows point at them.
  useEffect(() => {
    const onTable = a.targets.map((target) => target.id).filter((id) => document.querySelector(`.sve-table [data-card="${CSS.escape(id)}"]`));
    setHighlight(onTable);
    const timer = window.setTimeout(
      () => {
        const box = cardRef.current?.getBoundingClientRect();
        if (!box) return;
        const from = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
        setArrows(onTable.flatMap((id) => (cardCenter(id) ? [{ from, to: cardCenter(id)! }] : [])));
      },
      animations ? 460 : 0,
    );
    return () => {
      window.clearTimeout(timer);
      setHighlight([]);
    };
  }, [a, animations]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !update.watch) ok();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!catalog) return null;
  const item = (name: string) => t("announce.item", { name });
  const name = (info: CardInfo) => cardName(catalog.def(info.def), cardLang);
  // A selected card as the table names it while it is there (a leader: "Player 2's leader"), else by what it was.
  const targetName = (id: CardId, info: CardInfo) => (findCard(update.view, id) ? cardLabel(id, update, catalog, cardLang, t) : name(info));
  const chosen = a.choices.flatMap((choice) => {
    const decision: Extract<Decision, { type: "choose" }> = {
      type: "choose",
      player: a.player,
      reason: choice.reason,
      options: choice.options,
      min: 0,
      max: choice.options.length,
      source: null,
    };
    return choice.ids.flatMap((id) => {
      const option = choice.options.find((o) => o.id === id);
      return option ? [optionText(option, decision, { catalog, lang: cardLang, t })] : [];
    });
  });
  const player = playerLabel(a.player, update, t);
  // Watching a replay, it only tells: the playback goes on by itself, and the table's cards can still be pointed at.
  const watching = update.watch !== null;
  return (
    <div className={`sve-announce-backdrop${watching ? " sve-announce-watch" : ""}`} onClick={(e) => e.stopPropagation()} data-testid="announcement">
      <div className={`sve-announce ${own ? "sve-announce-own" : "sve-announce-opponent"}`} role="alertdialog" aria-labelledby="sve-announce-text">
        <div ref={cardRef} className="sve-announce-card">
          <CardTile info={a.card} />
        </div>
        <div className="sve-announce-body">
          <span className="sve-announce-title">{t("announce.title")}</span>
          <p id="sve-announce-text" className="sve-announce-line">
            {t(a.ability === null ? "announce.played" : "announce.activated", { player, card: item(name(a.card)) })}
          </p>
          {a.targets.length > 0 ? (
            <p className="sve-announce-line" data-testid="announcement-targets">
              {t("announce.targets", { cards: a.targets.map((target) => item(targetName(target.id, target.card))).join(t("announce.separator")) })}
            </p>
          ) : null}
          {chosen.map((text, i) => (
            <p key={i} className="sve-announce-line">
              {t("announce.chose", { choice: item(text) })}
            </p>
          ))}
          {watching ? null : (
            <button type="button" className="sve-primary" onClick={ok} autoFocus data-testid="announcement-ok">
              {t("announce.ok")}
            </button>
          )}
        </div>
      </div>
      {arrows.map((arrow, i) => (
        <Arrow key={i} from={arrow.from} to={arrow.to} variant="target" />
      ))}
    </div>
  );
}
