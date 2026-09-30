// The host of the app in a computer's browser (main.tsx): the server's `/api` (api.ts serverHost), and what needs the page:
// saving a file (the browser's download) and the clipboard.
import { serverHost, type Host } from "./api";

/** Let the browser save a JSON file. */
function downloadJson(fileName: string, value: unknown): void {
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

export const webHost: Host = {
  ...serverHost,
  saveExport: async (fileName, value) => downloadJson(fileName, value),
  copyText: (text) => navigator.clipboard.writeText(text),
};
