import { mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { HostConfig } from "../host/config";
import { listReplays, replayPath } from "../host/replays";
import { parseReplay, replayFileName } from "../src/replays/replay-format";
import type { Replay } from "../src/engine/protocol";

// Saved replays (docs/gui.md "录像"): the local host's replays/ folder and the files' names.

let dir: string | null = null;
afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = null;
});

const config = (replaysDir: string): HostConfig => ({ root: replaysDir, publicDir: "", decksDir: "", replaysDir, assetsDir: "", miscDir: "" });

const replay = (deckNames: [string, string]): Replay => ({
  format: "sve-replay",
  version: 1,
  options: { seed: "s", decks: [{ main: [], evolve: [] }, { main: [], evolve: [] }] as never, deckNames, controllers: ["human", "greedy"], deckRestrictions: true },
  inputs: [{ input: { type: "chooseTurnOrder", goFirst: true }, by: 0 }],
  info: { savedAt: "2026-09-29T12:00:00.000Z", result: { winner: 0, losses: [{ player: 1, reason: "leaderDefense" }] }, turn: 9 },
});

describe("saved replays", () => {
  it("keeps replay files inside replays/, without sub-folders", () => {
    const cfg = config(join(tmpdir(), "replays"));
    expect(replayPath(cfg, "2026-09-29_210300_SD01_vs_SD02.json")).toBe(join(cfg.replaysDir, "2026-09-29_210300_SD01_vs_SD02.json"));
    expect(replayPath(cfg, "森林_vs_剑.json")).not.toBeNull();
    for (const bad of ["../x.json", "a/b.json", ".hidden.json", "x.txt", "x.json/..", ""]) expect(replayPath(cfg, bad)).toBeNull();
  });

  it("lists the replays newest first with their decks, players, result and length; an unreadable one by its name", () => {
    dir = mkdtempSync(join(tmpdir(), "sve-replays-"));
    writeFileSync(join(dir, "old.json"), JSON.stringify(replay(["A", "B"])));
    writeFileSync(join(dir, "new.json"), JSON.stringify(replay(["C", "D"])));
    writeFileSync(join(dir, "broken.json"), "{");
    writeFileSync(join(dir, "notes.txt"), "not a replay");
    utimesSync(join(dir, "old.json"), new Date(2026, 0, 1), new Date(2026, 0, 1));
    utimesSync(join(dir, "broken.json"), new Date(2025, 0, 1), new Date(2025, 0, 1));
    const list = listReplays(config(dir));
    expect(list.map((r) => r.file)).toEqual(["new.json", "old.json", "broken.json"]);
    expect(list[0]).toMatchObject({ deckNames: ["C", "D"], controllers: ["human", "greedy"], inputs: 1, info: { turn: 9, result: { winner: 0 } } });
    expect(list[2]).toMatchObject({ deckNames: null, info: null, inputs: 0 });
  });

  it("names a replay by when it was saved and its decks, and reads only replay files", () => {
    expect(replayFileName(replay(["SD01 Forest", "剑之卡组/2"]), new Date(2026, 8, 29, 21, 3, 7))).toBe("2026-09-29_210307_SD01_Forest_vs_剑之卡组2.json");
    expect(parseReplay(JSON.parse(JSON.stringify(replay(["A", "B"])))).info?.turn).toBe(9);
    expect(() => parseReplay({ format: "something else" })).toThrow();
    expect(() => parseReplay(null)).toThrow();
  });
});
