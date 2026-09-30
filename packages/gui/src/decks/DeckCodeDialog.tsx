// The deck builder's deck code window (deck-code.ts): the code of the deck being edited, to copy and share; and a code to
// import (or sve-server's deck code, or a deck file's JSON), shown first — its cards, its leader, what couldn't be found —
// then put into the builder as a new deck, not saved yet.
import { useMemo, useState } from "react";
import { useBack } from "../app/back";
import { cardName, type Catalog } from "../app/catalog";
import { errorText } from "../app/errors";
import { useSettings } from "../app/settings";
import { hostApi } from "../host/api";
import { useT, type Translate } from "../i18n";
import { deckCode, importDeckText, type ImportedDeck, type ImportNote } from "./deck-code";
import { cardCount, type DeckFile } from "./format";

function noteText(note: ImportNote, name: (id: string) => string, t: Translate): string {
  switch (note.kind) {
    case "similar":
      return t("deckCode.similar", { name: note.name, card: name(note.card) });
    case "unknownName":
      return t("deckCode.unknownName", { name: note.name, n: note.count });
    case "unknownPrinting":
      return t("deckCode.unknownPrinting", { printing: note.printing, n: note.count });
    case "leaderBySkin":
      return t("deckCode.leaderBySkin", { skin: note.skin, card: name(note.leader) });
    case "leaderByClass":
      return t("deckCode.leaderByClass", { className: t(`class.${note.className}` as Parameters<Translate>[0]), card: name(note.leader) });
    case "noLeader":
      return t("deckCode.noLeader");
  }
}

/** `onImport` puts the deck into the builder; false: the person kept the deck being edited (unsaved changes). */
export function DeckCodeDialog({ deck, catalog, onImport, onClose }: { deck: DeckFile; catalog: Catalog; onImport: (deck: DeckFile) => boolean; onClose: () => void }) {
  const t = useT();
  const { cardLang } = useSettings();
  const code = useMemo(() => deckCode(deck), [deck]);
  const [copied, setCopied] = useState<"yes" | "failed" | null>(null);
  const [text, setText] = useState("");
  useBack(true, onClose);
  const name = (id: string) => cardName(catalog.printing(id), cardLang, id);
  const read = useMemo((): { imported: ImportedDeck } | { error: string } | null => {
    if (text.trim() === "") return null;
    try {
      return { imported: importDeckText(text, catalog) };
    } catch (err) {
      return { error: errorText(err, t) };
    }
  }, [text, catalog, t]);
  const copy = async () => {
    try {
      await hostApi.copyText(code);
      setCopied("yes");
    } catch {
      setCopied("failed");
    }
  };
  const imported = read && "imported" in read ? read.imported : null;
  return (
    <div className="sve-modal-backdrop">
      <div className="sve-modal sve-deck-code" role="dialog" data-testid="deck-code">
        <header className="sve-modal-header">
          <span>{t("deckCode.title")}</span>
        </header>
        <p>{t("deckCode.share")}</p>
        <textarea className="sve-deck-code-text" readOnly value={code} rows={3} onFocus={(e) => e.target.select()} data-testid="deck-code-text" />
        <div className="sve-modal-actions">
          <button type="button" onClick={() => void copy()} data-testid="deck-code-copy">
            {t("deckCode.copy")}
          </button>
          {copied === "yes" ? <span className="sve-ok">{t("deckCode.copied")}</span> : null}
          {copied === "failed" ? <span className="sve-problem">{t("deckCode.copyFailed")}</span> : null}
        </div>
        <hr />
        <p>{t("deckCode.import")}</p>
        <textarea className="sve-deck-code-text" value={text} rows={4} placeholder={t("deckCode.paste")} onChange={(e) => setText(e.target.value)} data-testid="deck-code-input" />
        {read && "error" in read ? <p className="sve-problem">{read.error}</p> : null}
        {imported ? (
          <div className="sve-deck-code-preview" data-testid="deck-code-preview">
            <p>
              {t("deckCode.preview", {
                name: imported.deck.name || t("builder.newName"),
                main: cardCount(imported.deck.main),
                evolve: cardCount(imported.deck.evolve),
                leader: imported.deck.leader ? name(imported.deck.leader) : t("deckCode.none"),
              })}
            </p>
            {imported.notes.length > 0 ? (
              <ul className="sve-deck-code-notes" data-testid="deck-code-notes">
                {imported.notes.map((note, i) => (
                  // Cards left out are a problem; a similar name or how the leader was found is for information.
                  <li key={i} className={note.kind === "unknownName" || note.kind === "unknownPrinting" || note.kind === "noLeader" ? "sve-problem" : undefined}>
                    {noteText(note, name, t)}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        <div className="sve-modal-actions">
          <button type="button" onClick={onClose} data-testid="deck-code-close">
            {t("game.close")}
          </button>
          <button
            type="button"
            className="sve-primary"
            disabled={!imported}
            onClick={() => imported && onImport({ ...imported.deck, name: imported.deck.name || t("builder.newName") }) && onClose()}
            data-testid="deck-code-import"
          >
            {t("deckCode.importButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
