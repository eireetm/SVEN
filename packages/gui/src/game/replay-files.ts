import type { Replay } from "../engine/protocol";
import { parseReplay } from "../replays/replay-format";

export { parseReplay, replayFileName } from "../replays/replay-format";

/** Let the browser save a JSON file. */
export function downloadJson(fileName: string, value: unknown): void {
  const blob = new Blob([JSON.stringify(value, null, 2) + "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Read a replay file: saved at the end of a game ("保存录像"), or by the debug panel ("复现包"). */
export async function readReplayFile(file: File): Promise<Replay> {
  return parseReplay(JSON.parse(await file.text()));
}
