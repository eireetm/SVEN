import { useEffect } from "react";
import type { CardView, HiddenCardView } from "@sve/core";
import type { GameUpdate } from "../../engine/protocol";
import type { SideZone } from "../../engine/view-utils";
import { useT, type MessageKey } from "../../i18n";
import { CardTile } from "../card/CardTile";
import { playerLabel } from "../labels";
import { openZone, useOpenZone } from "./zone-browser";

const ZONE_KEYS: Record<SideZone, MessageKey> = {
  hand: "game.hand",
  field: "game.field",
  ex: "game.ex",
  cemetery: "game.cemetery",
  banished: "game.banished",
  evolveDeck: "game.evolveDeck",
  evolveZone: "log.zone.evolveZone",
  raceZone: "log.zone.raceZone",
  driveZone: "log.zone.driveZone",
  triggerZone: "log.zone.triggerZone",
  equipmentZone: "log.zone.equipmentZone",
};

/** A pile opened from the board (cemetery, banished, evolve deck): every card its viewer may see. */
export function ZoneBrowser({ update }: { update: GameUpdate }) {
  const open = useOpenZone();
  const t = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") openZone(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  if (!open) return null;
  const side = update.view.players[open.player];
  const cards = side[open.zone] as readonly (CardView | HiddenCardView)[];
  return (
    <div className="sve-modal-backdrop" onClick={() => openZone(null)}>
      <div className="sve-modal" onClick={(e) => e.stopPropagation()}>
        <header className="sve-modal-header">
          <span>{t("game.zoneTitle", { player: playerLabel(open.player, update, t), zone: t(ZONE_KEYS[open.zone]) })}</span>
          <button type="button" onClick={() => openZone(null)}>
            {t("game.close")}
          </button>
        </header>
        <div className="sve-modal-cards">
          {cards.length === 0 ? <span className="sve-hint">{t("game.empty")}</span> : null}
          {cards.map((card) =>
            // In the evolve deck, the face-up cards (CR 4.6.3) are marked; face-down ones aren't.
            open.zone === "evolveDeck" && !card.hidden && card.faceUp ? (
              <div key={card.id} className="sve-face-up-card">
                <CardTile card={card} side={side} />
                <span className="sve-face-up-tag">{t("game.faceUp")}</span>
              </div>
            ) : (
              <CardTile key={card.id} card={card} side={side} />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
