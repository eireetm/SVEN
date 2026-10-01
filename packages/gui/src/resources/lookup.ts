// Where each picture and sound comes from (README "Custom resources"): the player's own file in public/ first, then the Misc
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

/** The URL of "images/backs/default.png" for the base path "images/backs/default" (host/api.ts resourceUrl), or null. */
function find(base: string, extensions: readonly string[]): string | null {
  for (const ext of extensions) {
    const path = `${base}.${ext}`;
    if (files.has(path)) return hostApi.resourceUrl(path);
  }
  return null;
}

/**
 * The player's own image of a card in public/images/cards/: by printing, then by definition; a back face's with "_back";
 * a circled S may be a plain one (BP03-LDS01 for BP03-LDⓈ01). As host/resources.ts cardArtNames, whose findCardArt also
 * looks in the assets folder on a computer. The Android app's card images.
 */
export function ownCardArtUrl(printing: string, def: string, back = false): string | null {
  for (const id of [printing, def]) {
    const name = back && !id.endsWith("_back") ? `${id}_back` : id;
    const found = find(`images/cards/${name}`, IMAGE) ?? find(`images/cards/${name.replace(/Ⓢ/g, "S")}`, IMAGE);
    if (found) return found;
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

/** A common sound effect (public/audio/sfx/<name>.*), else the first of its fallbacks there is (sound-plan.ts SFX). */
export function sfxUrl(names: readonly string[]): string | null {
  for (const name of names) {
    const found = find(`audio/sfx/${name}`, AUDIO);
    if (found) return found;
  }
  return null;
}

/**
 * A card's own sound, named by the player: public/audio/cards/<number>-<kind>.* with the kind p (played), a (attacks) or d
 * (destroyed), for the first of the numbers (printing, definition; an evolved follower's evolve card first) that has one.
 */
export function cardSoundUrl(ids: readonly string[], kind: "p" | "a" | "d"): string | null {
  for (const id of ids) {
    const found = find(`audio/cards/${id}-${kind}`, AUDIO);
    if (found) return found;
  }
  return null;
}

/** A screen's background music: public/audio/bgm/<name>.* (menu, deck, battle). */
export function bgmUrl(name: string): string | null {
  return find(`audio/bgm/${name}`, AUDIO);
}
