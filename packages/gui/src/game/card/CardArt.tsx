import { useState } from "react";
import { hostApi } from "../../host/api";

interface Props {
  printing: string | null;
  def: string;
  back?: boolean;
  name: string;
  subtitle?: string;
}

/** A card's picture (the player's own first, then the scraped one, public/README.md), or its name when there is none. */
export function CardArt({ printing, def, back = false, name, subtitle }: Props) {
  const src = printing ? hostApi.cardArtUrl(printing, def, back) : null;
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) {
    return (
      <div className="sve-card-placeholder">
        <span className="sve-card-placeholder-name">{name}</span>
        {subtitle ? <span className="sve-card-placeholder-sub">{subtitle}</span> : null}
      </div>
    );
  }
  return <img className="sve-card-art" src={src} alt={name} loading="lazy" draggable={false} onError={() => setFailed(src)} />;
}
