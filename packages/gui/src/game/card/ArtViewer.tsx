import { useEffect, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useT } from "../../i18n";
import { CardArt } from "./CardArt";

export interface ArtFace {
  def: string;
  printing: string | null;
  back: boolean;
  name: string;
}

/**
 * A card's picture, large, in a window (opened from the card panel, which stays in view). Both faces of a double-faced card
 * side by side (CR 2.14). A click anywhere or Escape closes it.
 */
export function ArtViewer({ faces, onClose }: { faces: readonly ArtFace[]; onClose: () => void }) {
  const t = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return createPortal(
    <div className="sve-modal-backdrop sve-art-viewer" style={{ "--faces": faces.length } as CSSProperties} onClick={onClose} role="dialog" aria-label={faces[0]?.name} title={t("game.close")} data-testid="art-viewer">
      {faces.map((face) => (
        <div key={`${face.def}:${face.back}`} className="sve-art-viewer-card">
          <CardArt printing={face.printing} def={face.def} back={face.back} name={face.name} />
        </div>
      ))}
    </div>,
    document.body,
  );
}
