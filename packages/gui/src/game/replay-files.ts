import type { Replay } from "../engine/protocol";
import { parseReplay } from "../replays/replay-format";

export { parseReplay, replayFileName } from "../replays/replay-format";

/** Read a replay file: saved at the end of a game ("保存录像"), or by the debug panel ("复现包"). */
export async function readReplayFile(file: File): Promise<Replay> {
  return parseReplay(JSON.parse(await file.text()));
}
