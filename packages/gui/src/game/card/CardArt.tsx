import { useState } from "react";
import { hostApi } from "../../host/api";
import { unknownImageUrl, useResourcesVersion } from "../../resources/resources";

interface Props {
  printing: string | null;
  def: string;
  back?: boolean;
  name: string;
  subtitle?: string;
}

/**
 * A card's picture (the player's own first, then the scraped one, public/README.md). Without one: the "unknown" picture
 * (Misc/unknown) with the card's name on it, or just the name.
 */
export function CardArt({ printing, def, back = false, name, subtitle }: Props) {
  useResourcesVersion();
  const src = printing ? hostApi.cardArtUrl(printing, def, back) : null;
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) {
    const unknown = unknownImageUrl();
    return (
      <div className={`sve-card-placeholder${unknown ? " sve-card-unknown" : ""}`}>
        {unknown ? <img className="sve-card-art sve-card-unknown-art" src={unknown} alt="" draggable={false} /> : null}
        <span className="sve-card-placeholder-name">{name}</span>
        {subtitle ? <span className="sve-card-placeholder-sub">{subtitle}</span> : null}
      </div>
    );
  }
  return <img className="sve-card-art" src={src} alt={name} loading="lazy" draggable={false} onError={() => setFailed(src)} />;
}
