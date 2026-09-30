// When the interface itself fails — a bug, or something in the browser changing the page under React (a page translator,
// an extension) — React removes everything, which would leave an empty page. This says so instead: in the three languages
// (the settings may be what failed), with the error for a report and a button to reload. Plain DOM and inline style, so it
// works when the app's own code or style doesn't.

const TEXT = [
  {
    lang: "zh",
    title: "界面出错了",
    body: "如果开着网页翻译或浏览器插件（沉浸式翻译、AI 助手等），请对这个页面关掉它们，然后重新加载。还是这样的话，把下面的错误信息截图发给开发者。",
    reload: "重新加载",
  },
  {
    lang: "en",
    title: "The interface stopped working",
    body: "If page translation or a browser extension (translators, AI assistants …) is on, turn it off for this page and reload. If it happens again, send a screenshot of the error below to the developer.",
    reload: "Reload",
  },
  {
    lang: "ja",
    title: "画面でエラーが起きました",
    body: "ページ翻訳やブラウザー拡張機能（翻訳、AI アシスタントなど）が有効なら、このページではオフにして再読み込みしてください。それでも起きる場合は、下のエラーのスクリーンショットを開発者に送ってください。",
    reload: "再読み込み",
  },
];

let shown = false;

/** The error as a report shows it: its message and where it happened (the first lines of its stacks). */
function errorText(error: unknown, componentStack?: string): string {
  const head = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const stack = error instanceof Error && error.stack ? error.stack.split("\n").slice(1, 12).join("\n") : "";
  const components = componentStack ? componentStack.trim().split("\n").slice(0, 8).join("\n") : "";
  return [head, stack, components].filter((part) => part !== "").join("\n\n");
}

/** Show the failure over the page (once; the first error is the one that matters). */
export function showCrash(error: unknown, componentStack?: string): void {
  if (shown) return;
  shown = true;
  const box = document.createElement("div");
  box.setAttribute("translate", "no");
  box.dataset.testid = "crash";
  box.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;overflow:auto;padding:24px 32px;background:#0e1624;color:#e6ebf2;font:14px/1.5 sans-serif;";
  for (const text of TEXT) {
    const section = document.createElement("section");
    section.lang = text.lang;
    section.style.cssText = "margin:0 0 14px;max-width:880px;";
    const title = document.createElement("h1");
    title.textContent = text.title;
    title.style.cssText = "margin:0 0 2px;font-size:18px;color:#c9a227;";
    const body = document.createElement("p");
    body.textContent = text.body;
    body.style.cssText = "margin:0;";
    section.append(title, body);
    box.append(section);
  }
  const reload = document.createElement("button");
  reload.type = "button";
  reload.dataset.testid = "crash-reload";
  reload.textContent = TEXT.map((text) => text.reload).join(" / ");
  reload.style.cssText = "margin:4px 0 14px;padding:6px 14px;font:inherit;cursor:pointer;";
  reload.addEventListener("click", () => location.reload());
  const details = document.createElement("pre");
  details.textContent = errorText(error, componentStack);
  details.style.cssText = "margin:0;padding:10px;max-width:100%;white-space:pre-wrap;word-break:break-word;background:#000a;border-radius:6px;font:12px/1.4 ui-monospace,monospace;";
  box.append(reload, details);
  document.body.append(box);
}
