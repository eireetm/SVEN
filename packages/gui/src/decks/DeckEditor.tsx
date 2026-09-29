// The basic deck editor: deck files in decks/, edited as text ("3 BP01-001"), cards added from a search, and checked in the
// chosen format (the engine's CR 6.1 and the format's rules, formats/). The deck builder is the picture-based editor.
import { useEffect, useMemo, useState } from "react";
import { cardName } from "../app/catalog";
import { errorText } from "../app/errors";
import { useSettings } from "../app/settings";
import { reportError, useApp } from "../app/store";
import { CardDetails } from "../game/card/CardDetails";
import { showCard } from "../game/focus";
import { hostApi, type DeckFileEntry } from "../host/api";
import { useT } from "../i18n";
import { checkDeck, useFormat } from "../formats/check";
import { formatProblemText, type FormatProblem } from "../formats/formats";
import { cardCount, deckFromText, deckToText, emptyDeck } from "./format";

/** `initialFile`: open this deck file first (the deck builder's "edit as text"). */
export function DeckEditor({ onBack, initialFile }: { onBack: () => void; initialFile?: string | null }) {
  const t = useT();
  const catalog = useApp((s) => s.catalog)!;
  const { cardLang } = useSettings();
  const [files, setFiles] = useState<DeckFileEntry[]>([]);
  const [file, setFile] = useState("my-deck.json");
  const [text, setText] = useState(() => deckToText(emptyDeck(t("builder.newName"))));
  const [check, setCheck] = useState<FormatProblem[] | null>(null);
  const { format, list } = useFormat();
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const parsed = useMemo(() => deckFromText(text), [text]);
  // Card names go into the text as comments, in the card-text language.
  const nameOf = (id: string) => {
    const card = catalog.printing(id);
    return card ? cardName(card, cardLang) : undefined;
  };
  const deck = parsed.deck;
  const unknown = [...Object.keys(deck.main), ...Object.keys(deck.evolve), ...(deck.leader ? [deck.leader] : [])].filter((id) => !catalog.printing(id));
  const results = useMemo(() => catalog.search(query), [catalog, query]);

  const refresh = () => hostApi.listDecks().then(setFiles, (err: unknown) => reportError(String(err)));
  useEffect(() => {
    void refresh();
    if (initialFile) void open(initialFile);
    // Once, when the editor opens.
  }, []);

  const open = (name: string) =>
    hostApi.loadDeck(name).then(
      (loaded) => {
        setFile(name);
        setText(deckToText(loaded, nameOf));
        setCheck(null);
        setMessage("");
      },
      (err: unknown) => reportError(`${name}: ${errorText(err, t)}`),
    );

  const save = () => {
    if (!file.endsWith(".json")) return reportError(t("decks.badFileName", { file }));
    hostApi.saveDeck(file, deck).then(
      () => {
        setMessage(t("decks.saved", { file }));
        void refresh();
      },
      (err: unknown) => reportError(err instanceof Error ? err.message : String(err)),
    );
  };

  const add = (id: string, section: "main" | "evolve" | "leader") => {
    const next = deckFromText(text).deck;
    if (section === "leader") next.leader = id;
    else next[section][id] = (next[section][id] ?? 0) + 1;
    setText(deckToText(next, nameOf));
    setCheck(null);
  };

  return (
    <div className="sve-decks">
      <section className="sve-decks-files">
        <button type="button" onClick={onBack}>
          {t("common.back")}
        </button>
        <h3>{t("decks.files")}</h3>
        <button
          type="button"
          onClick={() => {
            setFile("my-deck.json");
            setText(deckToText(emptyDeck(t("builder.newName"))));
            setCheck(null);
          }}
        >
          {t("decks.new")}
        </button>
        <ul>
          {files.map((f) => (
            <li key={f.file}>
              <button type="button" className={f.file === file ? "sve-tab-active" : undefined} onClick={() => void open(f.file)} title={f.file}>
                {f.name}
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="sve-decks-editor">
        <label className="sve-field">
          <span>{t("decks.file")}</span>
          <input value={file} onChange={(e) => setFile(e.target.value)} />
        </label>
        <p className="sve-hint">{t("decks.textHelp")}</p>
        <textarea className="sve-deck-text" value={text} spellCheck={false} onChange={(e) => (setText(e.target.value), setCheck(null))} />
        <div className="sve-note">{t("decks.counts", { main: cardCount(deck.main), evolve: cardCount(deck.evolve) })}</div>
        {[...parsed.errors.map((e) => t("decks.badLine", { line: e.line, text: e.text })), ...unknown.map((id) => t("decks.unknownCard", { card: id }))].map((e) => (
          <div key={e} className="sve-problem">
            {e}
          </div>
        ))}
        <div className="sve-setup-actions">
          <button type="button" onClick={() => void checkDeck(deck, format, list, catalog).then(setCheck)}>
            {t("decks.check")}
          </button>
          <button type="button" onClick={() => setText(deckToText(deck, nameOf))} title={t("decks.tidyHelp")}>
            {t("decks.tidy")}
          </button>
          <button type="button" className="sve-primary" onClick={save}>
            {t("decks.save")}
          </button>
          {message ? <span className="sve-ok">{message}</span> : null}
        </div>
        {check !== null ? (
          check.length === 0 ? (
            <div className="sve-ok">{t("decks.legal", { format: t(`format.${format}`) })}</div>
          ) : (
            <ul className="sve-problems">
              {check.map((problem, i) => (
                <li key={i}>{formatProblemText(problem, { catalog, lang: cardLang, t })}</li>
              ))}
            </ul>
          )
        ) : null}
      </section>
      <section className="sve-decks-search">
        <input className="sve-search" placeholder={t("decks.search")} value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="sve-search-results">
          {query && results.length === 0 ? <p className="sve-hint">{t("decks.noResults")}</p> : null}
          {results.map((card) => (
            <div
              key={card.id}
              className="sve-search-result"
              onMouseEnter={() => showCard({ def: card.id, printing: card.printings[0] ?? card.id })}
            >
              <span className="sve-search-name">
                {cardName(card, cardLang)} <small>{card.id}</small>
              </span>
              <span className="sve-search-meta">
                {t(`class.${card.class}` as const)} · {t(`type.${card.type}` as const)}
                {card.cost !== null ? ` · ${card.cost}` : ""}
              </span>
              <span className="sve-search-buttons">
                {card.type === "leader" ? (
                  <button type="button" onClick={() => add(card.id, "leader")}>
                    {t("decks.setLeader")}
                  </button>
                ) : card.evolved || card.advanced ? (
                  <button type="button" onClick={() => add(card.id, "evolve")}>
                    {t("decks.addEvolve")}
                  </button>
                ) : card.token ? null : (
                  <button type="button" onClick={() => add(card.id, "main")}>
                    {t("decks.addMain")}
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="sve-decks-details">
          <CardDetails />
        </div>
      </section>
    </div>
  );
}
