// Sounds for game events. Silent unless the player put sound files in public/audio (public/README.md).
import type { PlayerId } from "@sve/core";
import { getSettings } from "../app/settings";
import type { LogEntry } from "../engine/protocol";
import { soundUrl } from "./resources";

function play(url: string | null): void {
  if (!url) return;
  const audio = new Audio(url);
  audio.volume = getSettings().volume;
  void audio.play().catch(() => {
    // The browser may refuse sound before the first click: nothing to do.
  });
}

/** Play the sounds of new log entries (at most one of each kind per update, so a big batch isn't noisy). */
export function playEventSounds(entries: readonly LogEntry[], perspective: PlayerId): void {
  const played = new Set<string>();
  const once = (event: string, url: string | null): void => {
    if (played.has(event) || !url) return;
    played.add(event);
    play(url);
  };
  for (const { event, cards } of entries) {
    switch (event.type) {
      case "cardPlayed":
        once("play", soundUrl("play", cards[event.card]));
        break;
      case "attackDeclared":
        once("attack", soundUrl("attack", cards[event.attacker]));
        break;
      case "evolved":
        once("evolve", soundUrl("evolve", cards[event.card]));
        break;
      case "damageDealt":
        once("damage", soundUrl("damage"));
        break;
      case "cardsMoved":
        if (event.moves.some((m) => m.reason === "destroy")) once("destroy", soundUrl("destroy"));
        break;
      case "turnStarted":
        once("turn", soundUrl("turn"));
        break;
      case "gameEnded":
        once("end", soundUrl(event.result.winner === perspective ? "win" : "lose"));
        break;
      default:
        break;
    }
  }
}
