// Where each picture and sound comes from (public/README.md): the player's own file in public/ first, then the Misc
// image of the local assets folder, else nothing, and the built-in style shows. Pure lookups in the lists the host gave
// (resources.ts loads them and applies the theme), so they also run in tests, without a browser.
import type { CardInfo } from "../engine/protocol";
import { hostApi } from "../host/api";

const IMAGE = ["png", "jpg", "jpeg", "webp", "gif", "avif"];
const AUDIO = ["mp3", "ogg", "wav", "m4a"];

let files = new Set<string>();
let misc = new Set<string>();

/** What there is: the files under public/ ("images/cards/BP01-001.png") and the Misc image names ("field"). */
export function setResourceLists(publicFiles: Iterable<string>, miscNames: Iterable<string>): void {
  files = new Set(publicFiles);
  misc = new Set(miscNames);
}

/** Whether public/ has this file ("theme.css"). */
export const hasResource = (path: string): boolean => files.has(path);

/** "/images/backs/default.png" for the base path "images/backs/default", or null. */
function find(base: string, extensions: readonly string[]): string | null {
  for (const ext of extensions) {
    const path = `${base}.${ext}`;
    if (files.has(path)) return `/${path.split("/").map(encodeURIComponent).join("/")}`;
  }
  return null;
}

const miscUrl = (name: string): string | null => (misc.has(name) ? hostApi.miscUrl(name) : null);

/** One player's playmat: public/textures/board/field.*, else Misc/field. The opponent's is the same turned around. */
export function fieldImageUrl(): string | null {
  return find("textures/board/field", IMAGE) ?? miscUrl("field");
}

/** The card back of the main deck: public/images/backs/default.*, else Misc/back. */
export function cardBackUrl(): string | null {
  return find("images/backs/default", IMAGE) ?? miscUrl("back");
}

/** The card back of the evolve deck (its cards have their own back): public/images/backs/evolve.*, else Misc/back_e, else the main deck's. */
export function evolveBackUrl(): string | null {
  return find("images/backs/evolve", IMAGE) ?? miscUrl("back_e") ?? cardBackUrl();
}

/** The picture for a card whose image is missing: public/images/cards/unknown.*, else Misc/unknown. */
export function unknownImageUrl(): string | null {
  return find("images/cards/unknown", IMAGE) ?? miscUrl("unknown");
}

/** A background picture by name (background_m ...): public/textures/menu/<name>.*, else Misc/<name>. */
const background = (name: string): string | null => find(`textures/menu/${name}`, IMAGE) ?? miscUrl(name);

/** The main menu's background (also behind the settings and the game setup): background_m, else the built-in colors. */
export function menuImageUrl(): string | null {
  return background("background_m");
}

/** The deck builder's background: background_d, else the main menu's own picture (as YGOPro falls back to one picture). */
export function builderImageUrl(): string | null {
  return background("background_d") ?? background("background_m");
}

/** The battlefield's background, behind the playmats and the side panels: background_f, else the built-in colors. */
export function battleImageUrl(): string | null {
  return background("background_f");
}

/** An icon for a card-text token ("fanfare", "cost02", ...), from public/textures/icons/. */
export function iconUrl(token: string): string | null {
  return find(`textures/icons/${token}`, IMAGE);
}

/** A sound for an event, the card's own first (public/audio/cards/<printing or definition>/<event>), then the common one. */
export function soundUrl(event: string, card?: CardInfo): string | null {
  for (const id of [card?.printing, card?.def]) {
    if (!id) continue;
    const found = find(`audio/cards/${id}/${event}`, AUDIO);
    if (found) return found;
  }
  return find(`audio/sfx/${event}`, AUDIO);
}
