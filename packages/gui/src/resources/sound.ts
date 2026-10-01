// The sounds: background music for each screen, and sound effects for what happens in a game and for
// the interface's buttons. Silent unless the player put the files in public/audio. Which effects an update makes, and
// when, is planned in sound-plan.ts (a card's own sound before the common one); this plays them.
import type { CardId, PlayerView } from "@sve/core";
import type { Catalog } from "../app/catalog";
import { getSettings, subscribeSettings } from "../app/settings";
import type { GameUpdate } from "../engine/protocol";
import { findCard } from "../engine/view-utils";
import { displayOf } from "../game/card/display";
import { bgmUrl, cardSoundUrl, sfxUrl } from "./lookup";
import { planSounds, SFX, type BgmName, type SfxName, type SoundCue } from "./sound-plan";

/** At most this many sounds start at the same moment (a big batch isn't noisy). */
const AT_ONCE = 4;

function playUrl(url: string): void {
  const audio = new Audio(url);
  audio.volume = getSettings().volume;
  void audio.play().catch(() => {
    // The browser may refuse sound before the first click: nothing to do.
  });
}

/** A common sound effect (or its fallback), if the player has one. */
export function playSfx(name: SfxName): void {
  const url = sfxUrl([name, ...SFX[name]]);
  if (url) playUrl(url);
}

/** The numbers of the card showing for `id` in these views: an evolved follower's evolve card first, then the card. */
function shownIds(views: (PlayerView | null)[], catalog: Catalog | null, id: CardId): string[] {
  for (const view of views) {
    const card = view ? findCard(view, id) : null;
    if (!card || !view) continue;
    const ids = [card.printing, card.def];
    if (card.evolvedWith && catalog) {
      const shown = displayOf(card, view.players[card.controller], catalog);
      ids.unshift(shown.printing ?? "", shown.def);
    }
    return ids.filter((x) => x !== "");
  }
  return [];
}

/**
 * Play the sounds of an update (`previous`: the view before it, where cards that have left were). Each card's own sound
 * plays; the common sound of a kind plays once for the cards without their own.
 */
export function playUpdateSounds(update: GameUpdate, previous: PlayerView | null, catalog: Catalog | null, lastAnnouncement: number | null): void {
  if (update.logReset) return;
  const cues = planSounds(
    update.log,
    {
      perspective: update.perspective,
      typeOf: (def) => catalog?.def(def)?.type,
      shownIds: (id) => shownIds([update.view, previous], catalog, id),
      timed: getSettings().animations,
    },
    update.announcement?.source ?? null,
  );
  if (update.announcement && update.announcement.seq !== lastAnnouncement) cues.push({ sfx: "quick", at: 0 });
  // One sound per file and moment: the card's own, else the common one.
  const planned = new Map<string, { url: string; at: number }>();
  for (const cue of cues) {
    const url = resolve(cue);
    if (!url) continue;
    const key = `${url}@${cue.at}`;
    if (!planned.has(key)) planned.set(key, { url, at: cue.at });
  }
  const byMoment = new Map<number, number>();
  for (const { url, at } of planned.values()) {
    const n = byMoment.get(at) ?? 0;
    if (n >= AT_ONCE) continue;
    byMoment.set(at, n + 1);
    if (at <= 0) playUrl(url);
    else window.setTimeout(() => playUrl(url), at);
  }
}

const resolve = (cue: SoundCue): string | null => (cue.card ? cardSoundUrl(cue.card.ids, cue.card.kind) : null) ?? sfxUrl([cue.sfx, ...SFX[cue.sfx]]);

// Background music: one loop at a time, faded between screens. A browser plays sound only after the page has been clicked
// or typed in once: until then the music waits for that.
const FADE_MS = 500;
let music: { name: BgmName; url: string; audio: HTMLAudioElement } | null = null;
let waitingForGesture = false;

/** The fade each music element is in (a newer one stops the older). */
const fades = new WeakMap<HTMLAudioElement, number>();
let fadeSeq = 0;

function fade(audio: HTMLAudioElement, to: number, done?: () => void): void {
  const id = ++fadeSeq;
  fades.set(audio, id);
  const from = audio.volume;
  const start = performance.now();
  const step = (now: number) => {
    if (fades.get(audio) !== id) return;
    // A frame's time may come a little before the start.
    const t = Math.min(1, Math.max(0, (now - start) / FADE_MS));
    audio.volume = Math.min(1, Math.max(0, from + (to - from) * t));
    if (t < 1) requestAnimationFrame(step);
    else done?.();
  };
  requestAnimationFrame(step);
}

function start(audio: HTMLAudioElement): void {
  void audio.play().then(
    () => fade(audio, getSettings().bgmVolume),
    () => {
      if (waitingForGesture) return;
      waitingForGesture = true;
      const retry = () => {
        waitingForGesture = false;
        window.removeEventListener("pointerdown", retry);
        window.removeEventListener("keydown", retry);
        if (music) start(music.audio);
      };
      window.addEventListener("pointerdown", retry);
      window.addEventListener("keydown", retry);
    },
  );
}

/** Play a screen's music (null: none); the same music goes on, another one fades in. */
export function playBgm(name: BgmName | null): void {
  const url = name ? bgmUrl(name) : null;
  if (music && music.name === name && music.url === url) return;
  const old = music;
  if (old) fade(old.audio, 0, () => old.audio.pause());
  music = null;
  if (!name || !url) return;
  const audio = new Audio(url);
  audio.loop = true;
  audio.volume = 0;
  music = { name, url, audio };
  start(audio);
}

// The music follows its volume setting at once (a fade in stops there).
let bgmVolume = getSettings().bgmVolume;
subscribeSettings((settings) => {
  if (settings.bgmVolume === bgmVolume) return;
  bgmVolume = settings.bgmVolume;
  if (!music || music.audio.paused) return;
  fades.set(music.audio, ++fadeSeq);
  music.audio.volume = Math.min(1, Math.max(0, bgmVolume));
});

/** The interface's click sound: buttons, menu items, checkboxes and choices (installed once by the app). */
export function installClickSound(): () => void {
  const onClick = (e: MouseEvent) => {
    const target = e.target instanceof Element ? e.target.closest("button, [role=menuitem], summary, select, input[type=checkbox], input[type=radio]") : null;
    if (target && !(target as HTMLButtonElement).disabled) playSfx("click");
  };
  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}
