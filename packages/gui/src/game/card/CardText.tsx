import type { CardLang } from "../../app/settings";
import { htmlLang } from "../../i18n";
import { iconUrl } from "../../resources/lookup";
import { tokenLabel } from "./tokens";

function Token({ name, lang }: { name: string; lang: CardLang }) {
  const label = tokenLabel(name, lang);
  const icon = iconUrl(name);
  if (icon) return <img className="sve-token-icon" src={icon} alt={label} title={label} />;
  const kind = /^cost/i.test(name) ? "cost" : name.endsWith("craft") ? "class" : name;
  return <span className={`sve-token sve-token-${kind}`}>{label}</span>;
}

/** A line of card text: its words, and its {[...]} icons drawn. */
function lineParts(line: string, lang: CardLang) {
  return line.split(/(\{\[[^\]]+\]\})/g).map((part, j) => {
    const token = /^\{\[([^\]]+)\]\}$/.exec(part);
    return token ? <Token key={j} name={token[1]!} lang={lang} /> : part;
  });
}

/** A line of card text as plain words (the icons by their labels), for a tooltip. */
export function plainLine(line: string, lang: CardLang): string {
  return line.replace(/\{\[([^\]]+)\]\}/g, (_, name: string) => `[${tokenLabel(name, lang)}]`);
}

/** Card text with its icons; one paragraph per line. */
export function CardText({ text, lang }: { text: string; lang: CardLang }) {
  return (
    <div className="sve-card-text" lang={htmlLang(lang)}>
      {text.split("\n").map((line, i) => (
        <p key={i}>{lineParts(line, lang)}</p>
      ))}
    </div>
  );
}

/** One line of card text with its icons, inside a line of something else (an ability's line in a choice of abilities). */
export function CardTextLine({ line, lang, className }: { line: string; lang: CardLang; className?: string }) {
  return (
    <span className={className} lang={htmlLang(lang)}>
      {lineParts(line, lang)}
    </span>
  );
}
