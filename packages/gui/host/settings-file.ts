// The PC release's settings file (settings.ini next to server.mjs): the app reads and writes its text over the API
// (src/app/settings-file.ts has the format). On disk it is a text file for Windows' Notepad: UTF-8 with a BOM, CRLF.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

/** The file's text (without the BOM, LF line ends), or null when it isn't there yet. */
export function readSettingsText(file: string): string | null {
  if (!existsSync(file)) return null;
  return readFileSync(file, "utf8").replace(/^﻿/, "").replace(/\r\n?/g, "\n");
}

/** Write the file: UTF-8 with a BOM and CRLF line ends, which every Notepad reads. */
export function writeSettingsText(file: string, text: string): void {
  writeFileSync(file, "﻿" + text.replace(/\r?\n/g, "\r\n"), "utf8");
}
