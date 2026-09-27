import type { Replay } from "../engine/protocol";

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

/** Read a replay file saved by the debug panel (checked only for its shape; the engine checks every input). */
export async function readReplayFile(file: File): Promise<Replay> {
  const value = JSON.parse(await file.text()) as Partial<Replay>;
  if (value.format !== "sve-replay" || value.version !== 1 || !value.options || !Array.isArray(value.inputs)) {
    throw new Error('expected {"format": "sve-replay", "version": 1, ...}');
  }
  return value as Replay;
}
