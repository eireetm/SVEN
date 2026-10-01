// The PC release's settings file (settings.ini next to server.mjs, README "发行版"): the settings of the settings page and
// a few of the debug panel's, as a text file a person can edit by hand. It wins over what the browser remembers: it is read
// when the app starts (a missing key, or a value its key doesn't take: the default), and written when one of its settings
// changes in the app — only the keys that changed, into the file as it is then, so lines the app doesn't know (comments,
// other keys) and what was edited by hand meanwhile stay. Hosts without one (the dev server, the Android app) keep the
// browser's settings only. The format is pure (tested in Node); loading and saving are at the end.
import { hostApi } from "../host/api";
import { translate } from "../i18n";
import type { MessageKey } from "../i18n/en";
import { DEFAULT_SETTINGS, getSettings, subscribeSettings, updateSettings, type CardLang, type Settings, type UiLang } from "./settings";

/** One key of the file: where it is, its comment, and the setting it holds. */
interface Entry {
  section: string;
  key: string;
  field: keyof Settings;
  /** The setting's label in the interface (the comment above the key says it in three languages) and the values it takes. */
  label: MessageKey;
  values: string;
  /** One more comment line, in three languages. */
  note?: MessageKey;
  /** The value as the file says it. */
  get(settings: Settings): string;
  /** The change of the settings this value makes, or null when it isn't a value of this key. */
  set(settings: Settings, value: string): Partial<Settings> | null;
}

const BOOLEANS = new Map([...["true", "yes", "on", "1"].map((v) => [v, true] as const), ...["false", "no", "off", "0"].map((v) => [v, false] as const)]);
const UI_LANGS = new Map<string, UiLang>([["en", "en"], ["zh", "zh"], ["cn", "zh"], ["ja", "ja"], ["jp", "ja"]]);
const CARD_LANGS = new Map<string, CardLang>([["en", "en"], ["zh", "cn"], ["cn", "cn"], ["ja", "ja"], ["jp", "ja"]]);

/** A whole number brought into [min, max], or null when the value isn't a number. */
function whole(value: string, min: number, max: number): number | null {
  if (!/^[+-]?\d+(\.\d*)?$/.test(value)) return null;
  return Math.min(max, Math.max(min, Math.round(Number(value))));
}

const percent = (fraction: number): string => String(Math.round(fraction * 100));

const flag = (field: "animations" | "announceQuick" | "manualSlots" | "manualDebug") => ({
  values: "true, false",
  get: (s: Settings) => String(s[field]),
  set: (_: Settings, v: string) => {
    const on = BOOLEANS.get(v.toLowerCase());
    return on === undefined ? null : { [field]: on };
  },
});

const volume = (field: "bgmVolume" | "volume") => ({
  values: "0–100 (%)",
  get: (s: Settings) => percent(s[field]),
  set: (_: Settings, v: string) => {
    const n = whole(v, 0, 100);
    return n === null ? null : { [field]: n / 100 };
  },
});

const turn = (part: "urls" | "username" | "credential") => ({
  values: "",
  get: (s: Settings) => s.turn[part],
  set: (s: Settings, v: string) => ({ turn: { ...s.turn, [part]: v } }),
});

const ENTRIES: readonly Entry[] = [
  {
    section: "language",
    key: "interface",
    field: "uiLang",
    label: "settings.uiLang",
    values: "en, zh, ja",
    get: (s) => s.uiLang,
    set: (_, v) => {
      const lang = UI_LANGS.get(v.toLowerCase());
      return lang ? { uiLang: lang } : null;
    },
  },
  {
    section: "language",
    key: "cards",
    field: "cardLang",
    label: "settings.cardLang",
    values: "en, zh, ja",
    get: (s) => (s.cardLang === "cn" ? "zh" : s.cardLang),
    set: (_, v) => {
      const lang = CARD_LANGS.get(v.toLowerCase());
      return lang ? { cardLang: lang } : null;
    },
  },
  {
    section: "appearance",
    key: "transparency",
    field: "uiTransparency",
    label: "settings.uiTransparency",
    values: "0–60 (%)",
    note: "settingsFile.transparencyEmpty",
    get: (s) => (s.uiTransparency === null ? "" : percent(s.uiTransparency)),
    set: (_, v) => {
      if (v === "") return { uiTransparency: null };
      const n = whole(v, 0, 60);
      return n === null ? null : { uiTransparency: n / 100 };
    },
  },
  { section: "appearance", key: "animations", field: "animations", label: "debug.animations", ...flag("animations") },
  { section: "sound", key: "music", field: "bgmVolume", label: "settings.bgmVolume", ...volume("bgmVolume") },
  { section: "sound", key: "effects", field: "volume", label: "settings.sfxVolume", ...volume("volume") },
  { section: "game", key: "quick_announcement", field: "announceQuick", label: "settings.announceQuick", ...flag("announceQuick") },
  {
    section: "game",
    key: "bot_delay",
    field: "botDelayMs",
    label: "setup.botDelay",
    values: "0–3000 (ms)",
    get: (s) => String(s.botDelayMs),
    set: (_, v) => {
      const n = whole(v, 0, 3000);
      return n === null ? null : { botDelayMs: n };
    },
  },
  { section: "online", key: "turn_urls", field: "turn", label: "settings.turnUrls", ...turn("urls"), values: "turn:host:port …" },
  { section: "online", key: "turn_username", field: "turn", label: "settings.turnUsername", ...turn("username") },
  { section: "online", key: "turn_password", field: "turn", label: "settings.turnCredential", note: "settingsFile.plainPassword", ...turn("credential") },
  { section: "debug", key: "manual_slots", field: "manualSlots", label: "debug.manualSlots", ...flag("manualSlots") },
  { section: "debug", key: "manual_debug", field: "manualDebug", label: "debug.manual", ...flag("manualDebug") },
];

/** The sections in the order of a new file, with the heading of each. */
const SECTIONS: ReadonlyMap<string, MessageKey> = new Map([
  ["language", "settings.language"],
  ["appearance", "settings.appearance"],
  ["sound", "settings.sound"],
  ["game", "settings.game"],
  ["online", "settings.online"],
  ["debug", "tab.debug"],
]);

/** The settings the file holds. */
export const FILE_FIELDS: readonly (keyof Settings)[] = [...new Set(ENTRIES.map((e) => e.field))];

const idOf = (entry: Entry): string => `${entry.section}.${entry.key}`;
const BY_ID = new Map(ENTRIES.map((entry) => [idOf(entry), entry]));

/** The file's languages, in the order of the release's README.txt. */
const LANGS: readonly UiLang[] = ["zh", "ja", "en"];
const inThree = (key: MessageKey): string => LANGS.map((lang) => translate(lang, key)).join(" / ");

const keyLine = (entry: Entry, value: string): string => (value === "" ? `${entry.key} =` : `${entry.key} = ${value}`);
const entryLines = (entry: Entry, settings: Settings): string[] => [
  `; ${inThree(entry.label)}${entry.values ? `: ${entry.values}` : ""}`,
  ...(entry.note ? [`; ${inThree(entry.note)}`] : []),
  keyLine(entry, entry.get(settings)),
];
const sectionLines = (section: string, entries: readonly Entry[], settings: Settings): string[] => [
  `[${section}]`,
  `; ${inThree(SECTIONS.get(section)!)}`,
  ...entries.flatMap((entry) => entryLines(entry, settings)),
];

/** A new settings file with every key, from these settings. */
export function newSettingsFile(settings: Settings): string {
  const lines = ["; Shadowverse: Evolve NEXT — settings.ini", ...LANGS.map((lang) => `; ${translate(lang, "settingsFile.about")}`)];
  for (const section of SECTIONS.keys()) lines.push("", ...sectionLines(section, ENTRIES.filter((e) => e.section === section), settings));
  return lines.join("\n") + "\n";
}

/** A line's section heading ("[sound]" -> "sound"), or null. */
const headingOf = (line: string): string | null => /^\[([^\]]*)\]$/.exec(line)?.[1]?.trim().toLowerCase() ?? null;

/** A "key = value" line's key and value (one pair of quotes around the value taken off), or null. */
function keyValueOf(line: string): { key: string; value: string } | null {
  if (line === "" || line.startsWith(";") || line.startsWith("#")) return null;
  const eq = line.indexOf("=");
  if (eq < 0) return null;
  const value = line.slice(eq + 1).trim();
  const quoted = /^(["'])(.*)\1$/.exec(value);
  return { key: line.slice(0, eq).trim().toLowerCase(), value: quoted ? quoted[2]! : value };
}

/**
 * The settings a file gives, from `current`: the file's settings at their defaults, then each of its keys applied in
 * order. `present`: the keys it set (by id, "sound.music"); `ignored`: its lines that aren't a key with a value it takes.
 */
export function readSettingsFile(text: string, current: Settings): { settings: Settings; present: Set<string>; ignored: string[] } {
  let settings: Settings = { ...current };
  for (const field of FILE_FIELDS) settings = { ...settings, [field]: DEFAULT_SETTINGS[field] };
  const present = new Set<string>();
  const ignored: string[] = [];
  let section = "";
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const heading = headingOf(line);
    if (heading !== null) {
      section = heading;
      continue;
    }
    if (line === "" || line.startsWith(";") || line.startsWith("#")) continue;
    const pair = keyValueOf(line);
    const entry = pair ? BY_ID.get(`${section}.${pair.key}`) : undefined;
    const change = pair && entry ? entry.set(settings, pair.value) : null;
    if (!entry || !change) {
      ignored.push(line);
      continue;
    }
    settings = { ...settings, ...change };
    present.add(idOf(entry));
  }
  return { settings, present, ignored };
}

/**
 * The file with these keys (by id) set to their values in `settings`: the lines of each rewritten, a missing one added at the
 * end of its section, a missing section at the end of the file. Every other line stays as it was.
 */
export function updateSettingsFile(text: string, settings: Settings, ids: readonly string[]): string {
  const lines = text.split(/\r?\n/);
  const missing = new Set(ids.filter((id) => BY_ID.has(id)));
  // Where each section's last non-blank line is (a missing key goes after it).
  const sectionEnd = new Map<string, number>();
  let section = "";
  lines.forEach((raw, i) => {
    const line = raw.trim();
    const heading = headingOf(line);
    if (heading !== null) section = heading;
    if (line !== "" && section !== "") sectionEnd.set(section, i + 1);
    const pair = heading === null ? keyValueOf(line) : null;
    const entry = pair ? BY_ID.get(`${section}.${pair.key}`) : undefined;
    if (entry && ids.includes(idOf(entry))) {
      lines[i] = keyLine(entry, entry.get(settings));
      missing.delete(idOf(entry));
    }
  });
  const inserts = [...sectionEnd]
    .map(([name, at]) => ({ at, lines: ENTRIES.filter((e) => e.section === name && missing.has(idOf(e))).flatMap((e) => entryLines(e, settings)) }))
    .filter((insert) => insert.lines.length > 0)
    .sort((a, b) => b.at - a.at);
  for (const insert of inserts) lines.splice(insert.at, 0, ...insert.lines);
  const newSections = [...SECTIONS.keys()].filter((name) => !sectionEnd.has(name) && ENTRIES.some((e) => e.section === name && missing.has(idOf(e))));
  if (newSections.length > 0) {
    // Before the file's last line break.
    const end = lines.length > 0 && lines[lines.length - 1] === "" ? lines.length - 1 : lines.length;
    const added = newSections.flatMap((name) => ["", ...sectionLines(name, ENTRIES.filter((e) => e.section === name && missing.has(idOf(e))), settings)]);
    lines.splice(end, 0, ...added);
  }
  return lines.join("\n");
}

// Loading and saving.

/** Where the host keeps the file (null: it keeps none). */
let filePath: string | null = null;
/** Each key's value as the file has it, as far as this app knows (by id). */
let saved = new Map<string, string>();
/** The file as last read or written. */
let lastText: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
/** The saves one after the other. */
let saving: Promise<void> = Promise.resolve();

/** Where the settings file is (the settings page says so), or null when this host keeps none. */
export const settingsFilePath = (): string | null => filePath;

/** The keys whose value in the settings isn't the file's. */
const changedIds = (settings: Settings): string[] => ENTRIES.filter((e) => saved.get(idOf(e)) !== e.get(settings)).map(idOf);

/** The text to write for these settings: a new file, or the keys that changed written into `text`. */
function nextText(text: string | null, settings: Settings, ids: readonly string[]): string {
  return text === null || text.trim() === "" ? newSettingsFile(settings) : updateSettingsFile(text, settings, ids);
}

function written(text: string, settings: Settings): void {
  lastText = text;
  for (const entry of ENTRIES) saved.set(idOf(entry), entry.get(settings));
}

/** Write what changed into the file as it is now (it may have been edited by hand since it was read). */
async function save(): Promise<void> {
  const settings = getSettings();
  const ids = changedIds(settings);
  if (ids.length === 0) return;
  try {
    const now = await hostApi.readSettingsFile();
    const text = nextText(now ? now.text : lastText, settings, ids);
    await hostApi.writeSettingsFile(text);
    written(text, settings);
  } catch (err) {
    console.warn("settings.ini:", err);
  }
}

function schedule(): void {
  if (timer !== null || changedIds(getSettings()).length === 0) return;
  // A slider sends many changes: one write after it stops.
  timer = setTimeout(() => {
    timer = null;
    saving = saving.then(save);
  }, 300);
}

/** The page is going away (closed, reloaded) with a change not written yet: write it at once, into the file as last known. */
function flush(): void {
  if (timer === null) return;
  clearTimeout(timer);
  timer = null;
  const settings = getSettings();
  const text = nextText(lastText, settings, changedIds(settings));
  void hostApi.writeSettingsFile(text).then(
    () => written(text, settings),
    () => {},
  );
}

/**
 * At the start, before anything is shown: the file's settings replace the browser's; a new file is written from the
 * browser's settings, and keys the file lacks (or has wrong) are written in. A host without a settings file: nothing.
 */
export async function loadSettingsFile(): Promise<void> {
  let file: Awaited<ReturnType<typeof hostApi.readSettingsFile>>;
  try {
    file = await hostApi.readSettingsFile();
  } catch (err) {
    console.warn("settings.ini:", err);
    return;
  }
  if (!file) return;
  filePath = file.path;
  lastText = file.text;
  if (file.text !== null) {
    const { settings, present, ignored } = readSettingsFile(file.text, getSettings());
    if (ignored.length > 0) console.warn(`settings.ini: not used: ${ignored.join(" | ")}`);
    saved = new Map(ENTRIES.filter((e) => present.has(idOf(e))).map((e) => [idOf(e), e.get(settings)]));
    updateSettings(Object.fromEntries(FILE_FIELDS.map((field) => [field, settings[field]])) as Partial<Settings>);
  }
  subscribeSettings(schedule);
  window.addEventListener("pagehide", flush);
  saving = saving.then(save);
  await saving;
}
