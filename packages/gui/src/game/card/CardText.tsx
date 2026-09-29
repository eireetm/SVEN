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

/** Card text with its icons; one paragraph per line. */
export function CardText({ text, lang }: { text: string; lang: CardLang }) {
  return (
    <div className="sve-card-text" lang={htmlLang(lang)}>
      {text.split("\n").map((line, i) => (
        <p key={i}>
          {line.split(/(\{\[[^\]]+\]\})/g).map((part, j) => {
            const token = /^\{\[([^\]]+)\]\}$/.exec(part);
            return token ? <Token key={j} name={token[1]!} lang={lang} /> : part;
          })}
        </p>
      ))}
    </div>
  );
}
