import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readSettingsText, writeSettingsText } from "../host/settings-file";
import { DEFAULT_SETTINGS, type Settings } from "../src/app/settings";
import { FILE_FIELDS, newSettingsFile, readSettingsFile, updateSettingsFile } from "../src/app/settings-file";

// The PC release's settings.ini: the settings page's settings (and a few of the debug panel's) as a file a person edits by
// hand. Read at the start (missing or wrong: the default), written back key by key, the person's other lines kept.

const mine: Settings = {
  ...DEFAULT_SETTINGS,
  uiLang: "zh",
  cardLang: "cn",
  uiTransparency: 0.25,
  animations: false,
  volume: 0.35,
  bgmVolume: 0,
  announceQuick: false,
  botDelayMs: 1200,
  turn: { urls: "turn:example.com:3478", username: "me", credential: "p;w=1" },
  manualSlots: true,
  manualDebug: true,
  setupDecks: ["mine.json", "samples/sd02.json"],
};

let dir: string | null = null;
afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = null;
});

describe("settings.ini", () => {
  it("holds every setting of the file, and reads back what it was written from", () => {
    const text = newSettingsFile(mine);
    expect(text).toContain("[language]\n; 语言 / 言語 / Language\n");
    expect(text).toContain("interface = zh\n");
    expect(text).toContain("cards = zh\n");
    expect(text).toContain("transparency = 25\n");
    expect(text).toContain("turn_password = p;w=1\n");
    const { settings, present, ignored } = readSettingsFile(text, DEFAULT_SETTINGS);
    expect(ignored).toEqual([]);
    expect(present.size).toBe(13);
    for (const field of FILE_FIELDS) expect(settings[field], field).toEqual(mine[field]);
    // What isn't in the file (the last game setup ...) stays as the browser has it.
    expect(settings.setupDecks).toEqual(DEFAULT_SETTINGS.setupDecks);
    expect(readSettingsFile(newSettingsFile(DEFAULT_SETTINGS), mine).settings).toEqual({ ...DEFAULT_SETTINGS, setupDecks: mine.setupDecks });
  });

  it("gives a missing key or a wrong value its default, and takes the values a person might write", () => {
    const text = [
      "; mine",
      "[Language]",
      "Interface = JA",
      "cards = cn",
      "[sound]",
      "music = 250",
      "effects = loud",
      "[game]",
      "quick_announcement = no",
      "bot_delay = 450.4",
      "[online]",
      'turn_username = "a b"',
      "turn_urls",
      "colour = red",
      "[debug]",
      "manual_debug = ON",
    ].join("\r\n");
    const { settings, present, ignored } = readSettingsFile(text, mine);
    expect(settings).toMatchObject({ uiLang: "ja", cardLang: "cn", bgmVolume: 1, volume: DEFAULT_SETTINGS.volume, announceQuick: false, botDelayMs: 450, manualDebug: true });
    expect(settings.turn).toEqual({ urls: "", username: "a b", credential: "" });
    // Not in the file: the defaults, not what the browser had.
    expect(settings).toMatchObject({ uiTransparency: null, animations: true, manualSlots: false });
    expect(ignored).toEqual(["effects = loud", "turn_urls", "colour = red"]);
    expect([...present].sort()).toEqual(["debug.manual_debug", "game.bot_delay", "game.quick_announcement", "language.cards", "language.interface", "online.turn_username", "sound.music"]);
    expect(readSettingsFile("[appearance]\ntransparency =\n", mine).settings.uiTransparency).toBeNull();
    expect(readSettingsFile("[appearance]\ntransparency = 90\n", mine).settings.uiTransparency).toBe(0.6);
  });

  it("writes only the keys asked for, keeps every other line, and adds a missing key or section", () => {
    const text = ["; my notes", "[sound]", "; quiet at night", "music=10", "effects = 60", "my_key = 1", "", "[game]", "bot_delay = 600", ""].join("\n");
    const out = updateSettingsFile(text, mine, ["sound.music", "game.bot_delay", "game.quick_announcement", "language.interface"]);
    expect(out.split("\n")).toEqual([
      "; my notes",
      "[sound]",
      "; quiet at night",
      "music = 0",
      "effects = 60",
      "my_key = 1",
      "",
      "[game]",
      "bot_delay = 1200",
      "; 每次快速结算后暂停并提示 / クイックのたびに一時停止して知らせる / Pause after each Quick card or ability: true, false",
      "quick_announcement = false",
      "",
      "[language]",
      "; 语言 / 言語 / Language",
      "; 界面文字 / 画面の表示 / Interface: en, zh, ja",
      "interface = zh",
      "",
    ]);
    // Nothing asked: the same text.
    expect(updateSettingsFile(text, mine, [])).toBe(text);
  });

  it("is kept on disk for Windows' Notepad: UTF-8 with a BOM, CRLF line ends", () => {
    dir = mkdtempSync(join(tmpdir(), "sve-settings-"));
    const file = join(dir, "settings.ini");
    expect(readSettingsText(file)).toBeNull();
    writeSettingsText(file, "[language]\ninterface = zh\n");
    expect(readFileSync(file, "utf8")).toBe("﻿[language]\r\ninterface = zh\r\n");
    expect(readSettingsText(file)).toBe("[language]\ninterface = zh\n");
  });
});
