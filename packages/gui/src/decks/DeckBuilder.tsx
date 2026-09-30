// Stage 5: the deck builder. Left: the card under the pointer. Middle: the deck files and the leader above the deck (main
// deck and evolve deck). Right, as in YGOPro: the filters above the card pool they let through (no leaders, no tokens).
// Click a card of the pool or drag it into the deck to add it (it goes into the right section); right-click a card of the
// deck or drag it back onto the right column to remove it (dropped anywhere else, it stays, as in YGOPro). "All versions"
// lists every printing (alternate arts) of a card: the same card for the rules (CR 2.1.1; the engine counts copies by
// name, 6.1.1.4), only the picture differs. Between the files and the leader: the format and its restriction list
// (formats/); cards go in freely, and a deck that doesn't meet them is only told so when it is saved or the builder is left.
// Cross Craft decks have two leaders (CR Appendix B-2 6.1.1.1). On a small screen (a phone, docs/android.md) the card panel
// is a drawer and the deck and the pool are two tabs; a tap adds a card of the pool or removes one of the deck, a long
// press shows the card, and nothing is dragged.
import { useDeferredValue, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent } from "react";
import { useCompact } from "../app/compact";
import { setDetailsOpen, useDetailsOpen } from "../game/details";
import { installLongPress } from "../game/long-press";
import { cardName } from "../app/catalog";
import { errorText } from "../app/errors";
import { updateSettings, useSettings } from "../app/settings";
import { traitName } from "../app/traits";
import { reportError, useApp } from "../app/store";
import { useElementWidth } from "../app/useElementWidth";
import type { CatalogCard } from "../engine/protocol";
import { CardDetails } from "../game/card/CardDetails";
import { CardTile } from "../game/card/CardTile";
import { hostApi, type DeckFileEntry } from "../host/api";
import { useT } from "../i18n";
import { checkDeck, useFormat } from "../formats/check";
import type { FormatProblem } from "../formats/formats";
import { FormatPicker, ProblemsDialog } from "../formats/FormatPicker";
import { DeckCodeDialog } from "./DeckCodeDialog";
import { DeckStats } from "./DeckStats";
import { ABILITIES, NO_FILTERS, poolEntries, setsOf, traitsOf, type AbilityTag, type PoolFilters, type TypeFilter } from "./filters";
import { cardCount, emptyDeck, type DeckFile } from "./format";
import { LeaderPicker } from "./LeaderPicker";
import { addCard, clearDeck, copiesOf, copiesOfDefinition, fileNameFor, removeCard, sectionOf, sortDeck, type DeckSection } from "./model";
import { useBack } from "../app/back";

const POOL_DATA = "application/x-sve-pool";
const DECK_DATA = "application/x-sve-deck";
const POOL_PAGE = 72;
const DECK_COLUMNS = 10;
const GAP = 6;

const CLASSES = ["Neutral", "Forestcraft", "Swordcraft", "Runecraft", "Dragoncraft", "Abysscraft", "Havencraft"] as const;
const TYPES: readonly TypeFilter[] = ["follower", "spell", "amulet", "evolve"];
const COSTS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

interface Props {
  onBack: () => void;
  /** The text editor for a deck file (the builder's "edit as text"). */
  onTextEditor: (file: string | null) => void;
  /** Open this deck file first (from the game setup), else the one edited last. */
  initialFile?: string | null;
}

export function DeckBuilder({ onBack, onTextEditor, initialFile }: Props) {
  const t = useT();
  const catalog = useApp((s) => s.catalog)!;
  const settings = useSettings();
  const { cardLang, builderAllPrintings: allPrintings } = settings;
  const [files, setFiles] = useState<DeckFileEntry[]>([]);
  const [file, setFile] = useState<string | null>(null);
  const [deck, setDeck] = useState<DeckFile>(() => emptyDeck(t("builder.newName")));
  const [saved, setSaved] = useState<string>(() => JSON.stringify(emptyDeck(t("builder.newName"))));
  const [saveAs, setSaveAs] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState<PoolFilters>(NO_FILTERS);
  const [limit, setLimit] = useState(POOL_PAGE);
  const [choosingLeader, setChoosingLeader] = useState<"leader" | "leader2" | null>(null);
  const [codeOpen, setCodeOpen] = useState(false);
  const { format, list } = useFormat();
  // The deck's problems in the format, told after saving or before leaving (`then`: leave anyway).
  const [told, setTold] = useState<{ problems: FormatProblem[]; then: (() => void) | null } | null>(null);
  const [dropping, setDropping] = useState(false);
  const dirty = JSON.stringify(deck) !== saved;
  const compact = useCompact();
  const [tab, setTab] = useState<"deck" | "pool">("deck");
  const detailsOpen = useDetailsOpen();
  const drawer = compact && detailsOpen;
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    return compact && root ? installLongPress(root) : undefined;
  }, [compact]);
  useEffect(() => () => setDetailsOpen(false), []);

  const deckRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const deckWidth = useElementWidth(deckRef);
  const poolWidth = useElementWidth(poolRef, 400);
  const deckCard = Math.max(40, Math.floor((deckWidth - (DECK_COLUMNS - 1) * GAP) / DECK_COLUMNS));
  // A phone shows a few more, smaller cards a row (its pool tab scrolls as a whole, the filters too).
  const poolMin = compact ? 92 : 104;
  const poolColumns = Math.max(2, Math.floor((poolWidth + GAP) / (poolMin + GAP)));
  const poolCard = Math.floor((poolWidth - (poolColumns - 1) * GAP) / poolColumns);

  const refresh = async (): Promise<DeckFileEntry[]> => {
    try {
      const list = await hostApi.listDecks();
      setFiles(list);
      return list;
    } catch (err) {
      reportError(String(err));
      return [];
    }
  };

  const load = (name: string) =>
    hostApi.loadDeck(name).then(
      (loaded) => {
        setFile(name);
        setDeck(loaded);
        setSaved(JSON.stringify(loaded));
        setSaveAs(null);
        setMessage("");
        updateSettings({ builderDeck: name });
      },
      (err: unknown) => reportError(`${name}: ${errorText(err, t)}`),
    );

  useEffect(() => {
    void refresh().then((list) => {
      const first = initialFile ?? settings.builderDeck;
      if (first && list.some((d) => d.file === first)) void load(first);
    });
    // Once, when the builder opens.
  }, []);

  // The card pool: filtered, sorted, shown a page at a time as the list scrolls.
  const poolCards = useMemo(() => catalog.cards, [catalog]);
  const sets = useMemo(() => setsOf(poolCards.filter((c) => c.type !== "leader")), [poolCards]);
  // Trait suggestions in the card language (the filter matches any language).
  const traits = useMemo(() => [...new Set(traitsOf(poolCards).map((trait) => traitName(trait, cardLang)))].sort((a, b) => a.localeCompare(b)), [poolCards, cardLang]);
  const universes = useMemo(() => [...new Set(poolCards.flatMap((c) => (c.universe ? [c.universe] : [])))], [poolCards]);
  // Typing stays smooth: the pool follows the filters a moment later.
  const deferredFilters = useDeferredValue(filters);
  const results = useMemo(
    () => poolEntries(poolCards, deferredFilters, allPrintings, (c) => cardName(c as CatalogCard, cardLang)) as { card: CatalogCard; printing: string }[],
    [poolCards, deferredFilters, allPrintings, cardLang],
  );
  useEffect(() => {
    setLimit(POOL_PAGE);
    poolRef.current?.scrollTo({ top: 0 });
  }, [filters, allPrintings]);
  useEffect(() => {
    const element = sentinel.current;
    if (!element) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setLimit((n) => n + POOL_PAGE);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [results]);

  const setFilter = <K extends keyof PoolFilters>(key: K, value: PoolFilters[K]) => setFilters((f) => ({ ...f, [key]: value }));
  const defOf = (printing: string) => catalog.printing(printing);
  const add = (card: CatalogCard, printing = card.printings[0] ?? card.id) => setDeck((d) => addCard(d, sectionOf(card), printing));
  const remove = (section: DeckSection, printing: string) => setDeck((d) => removeCard(d, section, printing));
  const discardChanges = () => !dirty || window.confirm(t("builder.confirmDiscard"));

  const newDeck = () => {
    if (!discardChanges()) return;
    const fresh = emptyDeck(t("builder.newName"));
    setFile(null);
    setDeck(fresh);
    setSaved(JSON.stringify(fresh));
    setMessage("");
  };
  /** A deck from a deck code (DeckCodeDialog), as a new deck not saved yet; false: the person kept their unsaved changes. */
  const importDeck = (imported: DeckFile): boolean => {
    if (!discardChanges()) return false;
    setFile(null);
    setDeck(imported);
    setSaved(JSON.stringify(emptyDeck(t("builder.newName"))));
    setSaveAs(null);
    setMessage(t("deckCode.imported", { name: imported.name }));
    return true;
  };
  /** The deck's problems in the chosen format (none in unlimited: anything goes). */
  const problems = async (): Promise<FormatProblem[]> => (format === "unlimited" ? [] : checkDeck(deck, format, list, catalog));
  /** Leave the builder (back, or its text editor), telling first what the deck doesn't meet. */
  useBack(true, () => void leave(() => discardChanges() && onBack()));
  useBack(drawer, () => setDetailsOpen(false));
  const leave = async (go: () => void) => {
    const found = await problems();
    if (found.length > 0) setTold({ problems: found, then: go });
    else go();
  };
  const write = async (name: string) => {
    try {
      await hostApi.saveDeck(name, deck);
      setFile(name);
      setSaved(JSON.stringify(deck));
      setSaveAs(null);
      setMessage(t("decks.saved", { file: name }));
      updateSettings({ builderDeck: name });
      await refresh();
    } catch (err) {
      reportError(err instanceof Error ? err.message : String(err));
      return;
    }
    const found = await problems();
    if (found.length > 0) setTold({ problems: found, then: null });
  };
  const save = () => (file ? void write(file) : setSaveAs(fileNameFor(deck.name)));
  const confirmSaveAs = () => {
    if (saveAs === null) return;
    const name = saveAs.trim().endsWith(".json") ? saveAs.trim() : `${saveAs.trim()}.json`;
    if (name === ".json") return;
    if (files.some((f) => f.file === name) && name !== file && !window.confirm(t("builder.confirmOverwrite", { file: name }))) return;
    void write(name);
  };
  const deleteFile = async () => {
    if (!file || !window.confirm(t("builder.confirmDelete", { file }))) return;
    try {
      await hostApi.deleteDeck(file);
      const fresh = emptyDeck(t("builder.newName"));
      setFile(null);
      setDeck(fresh);
      setSaved(JSON.stringify(fresh));
      setMessage(t("builder.deleted", { file }));
      updateSettings({ builderDeck: null });
      await refresh();
    } catch (err) {
      reportError(err instanceof Error ? err.message : String(err));
    }
  };

  // Dragging: pool cards into the deck (added), deck cards out of it (removed).
  const startDrag = (e: DragEvent, type: string, data: string) => {
    e.dataTransfer.setData(type, data);
    e.dataTransfer.effectAllowed = type === POOL_DATA ? "copy" : "move";
  };
  const has = (e: DragEvent, type: string) => e.dataTransfer.types.includes(type);
  const dropOnDeck = (e: DragEvent) => {
    setDropping(false);
    if (has(e, DECK_DATA)) {
      e.preventDefault();
      e.stopPropagation(); // moved inside the deck: stays
      return;
    }
    const printing = e.dataTransfer.getData(POOL_DATA);
    const card = printing ? defOf(printing) : undefined;
    if (!card) return;
    e.preventDefault();
    e.stopPropagation();
    add(card, printing);
  };
  const dropOnPool = (e: DragEvent) => {
    if (!has(e, DECK_DATA)) return;
    e.preventDefault();
    const { section, printing } = JSON.parse(e.dataTransfer.getData(DECK_DATA)) as { section: DeckSection; printing: string };
    remove(section, printing);
  };

  const leaderName = (printing: string | undefined) => {
    const card = printing ? defOf(printing) : undefined;
    return card ? cardName(card, cardLang) : t("builder.noLeader");
  };
  const section = (key: DeckSection, title: string) => {
    const copies = copiesOf(deck, key);
    return (
      <section className="sve-deck-section" data-section={key}>
        <h3>
          {title} <span className="sve-deck-count">{copies.length}</span>
          {key === "main" ? <DeckStats printings={copies} defOf={defOf} /> : null}
        </h3>
        <div className="sve-deck-grid" style={{ "--sve-card-width": `${deckCard}px`, gridTemplateColumns: `repeat(${DECK_COLUMNS}, ${deckCard}px)` } as CSSProperties}>
          {copies.map((printing, i) => {
            const card = defOf(printing);
            return (
              <div
                key={`${printing}:${i}`}
                className="sve-deck-tile"
                data-printing={printing}
                draggable={!compact}
                onDragStart={(e) => startDrag(e, DECK_DATA, JSON.stringify({ section: key, printing }))}
                onClick={compact ? () => remove(key, printing) : undefined}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (!compact) remove(key, printing);
                }}
              >
                <CardTile info={{ def: card?.id ?? printing, printing }} />
              </div>
            );
          })}
          {copies.length === 0 ? <div className="sve-deck-empty">{t(compact ? "builder.emptySectionTouch" : "builder.emptySection")}</div> : null}
        </div>
      </section>
    );
  };

  const back = () => void leave(() => discardChanges() && onBack());
  return (
    <div className={`sve-builder${compact ? " sve-builder-compact" : ""}`} data-tab={compact ? tab : undefined} ref={rootRef}>
      {compact ? (
        <nav className="sve-builder-tabs">
          <button type="button" onClick={back} data-testid="builder-back">
            {t("common.back")}
          </button>
          <button type="button" onClick={() => setDetailsOpen(true)} data-testid="details-show">
            ☰ {t("game.showDetails")}
          </button>
          <button type="button" className={tab === "deck" ? "sve-tab-active" : undefined} onClick={() => setTab("deck")} data-testid="builder-tab-deck">
            {t("builder.tabDeck", { main: cardCount(deck.main), evolve: cardCount(deck.evolve) })}
          </button>
          <button type="button" className={tab === "pool" ? "sve-tab-active" : undefined} onClick={() => setTab("pool")} data-testid="builder-tab-pool">
            {t("builder.tabPool")}
          </button>
          {dirty ? <span className="sve-unsaved">{t("builder.unsaved")}</span> : null}
        </nav>
      ) : null}
      {!compact || drawer ? (
        <aside className={`sve-game-left${drawer ? " sve-drawer" : ""}`}>
          <div className="sve-game-left-top">
            {drawer ? (
              <button type="button" className="sve-drawer-hide" onClick={() => setDetailsOpen(false)} data-testid="details-hide">
                {t("game.hideSidebar")}
              </button>
            ) : (
              <button type="button" onClick={back} data-testid="builder-back">
                {t("common.back")}
              </button>
            )}
          </div>
          <section className="sve-sidebar-card">
            <CardDetails />
          </section>
        </aside>
      ) : null}

      <section className="sve-builder-center">
        <div className="sve-builder-top">
          <div className="sve-builder-row">
            <select
              className="sve-builder-files"
              value={file ?? ""}
              onChange={(e) => {
                if (e.target.value && discardChanges()) void load(e.target.value);
              }}
              data-testid="builder-file"
            >
              {file === null ? <option value="">{t("builder.unsavedFile")}</option> : null}
              {files.map((f) => (
                <option key={f.file} value={f.file}>
                  {f.name} ({f.file})
                </option>
              ))}
            </select>
            <input className="sve-builder-name" value={deck.name} onChange={(e) => setDeck((d) => ({ ...d, name: e.target.value }))} aria-label={t("builder.name")} data-testid="builder-name" />
            {dirty ? <span className="sve-unsaved">{t("builder.unsaved")}</span> : null}
            <button type="button" onClick={newDeck}>
              {t("builder.new")}
            </button>
            <button type="button" className="sve-primary" onClick={save} data-testid="builder-save">
              {t("builder.save")}
            </button>
            <button type="button" onClick={() => setSaveAs(fileNameFor(deck.name))}>
              {t("builder.saveAs")}
            </button>
            <button type="button" disabled={!file} onClick={() => void deleteFile()} data-testid="builder-delete">
              {t("builder.delete")}
            </button>
            {message ? <span className="sve-ok">{message}</span> : null}
          </div>
          {saveAs !== null ? (
            <div className="sve-builder-row sve-builder-saveas">
              <label className="sve-field">
                <span>{t("builder.fileName")}</span>
                <input value={saveAs} onChange={(e) => setSaveAs(e.target.value)} onKeyDown={(e) => e.key === "Enter" && confirmSaveAs()} autoFocus data-testid="builder-saveas-name" />
              </label>
              <button type="button" className="sve-primary" onClick={confirmSaveAs} data-testid="builder-saveas-ok">
                {t("decision.confirm")}
              </button>
              <button type="button" onClick={() => setSaveAs(null)}>
                {t("builder.cancel")}
              </button>
            </div>
          ) : null}
          <div className="sve-builder-row sve-builder-format">
            <FormatPicker />
          </div>
          <div className="sve-builder-row">
            {format === "crossCraft" ? (
              <>
                <button type="button" className="sve-leader-button" onClick={() => setChoosingLeader("leader")} data-testid="builder-leader">
                  {t("builder.leaderN", { n: 1, name: leaderName(deck.leader) })}
                </button>
                <button type="button" className="sve-leader-button" onClick={() => setChoosingLeader("leader2")} data-testid="builder-leader2">
                  {t("builder.leaderN", { n: 2, name: leaderName(deck.leader2) })}
                </button>
              </>
            ) : (
              <button type="button" className="sve-leader-button" onClick={() => setChoosingLeader("leader")} data-testid="builder-leader">
                {t("builder.leader", { name: leaderName(deck.leader) })}
              </button>
            )}
            <button type="button" onClick={() => setDeck((d) => sortDeck(d, defOf, "type"))} data-testid="builder-sort-type">
              {t("builder.sortByType")}
            </button>
            <button type="button" onClick={() => setDeck((d) => sortDeck(d, defOf, "cost"))} data-testid="builder-sort-cost">
              {t("builder.sortByCost")}
            </button>
            <button type="button" onClick={() => (cardCount(deck.main) + cardCount(deck.evolve) === 0 || window.confirm(t("builder.confirmClear"))) && setDeck(clearDeck)}>
              {t("builder.clear")}
            </button>
            <button type="button" onClick={() => void leave(() => discardChanges() && onTextEditor(file))}>
              {t("builder.textEditor")}
            </button>
            <button type="button" onClick={() => setCodeOpen(true)} data-testid="builder-deck-code">
              {t("builder.deckCode")}
            </button>
            <span className="sve-hint">{t(compact ? "builder.removeHintTouch" : "builder.removeHint")}</span>
          </div>
        </div>
        <div
          ref={deckRef}
          className={`sve-builder-deck${dropping ? " sve-drop-ok" : ""}`}
          onDragOver={(e) => {
            if (has(e, POOL_DATA) || has(e, DECK_DATA)) {
              e.preventDefault();
              e.dataTransfer.dropEffect = has(e, POOL_DATA) ? "copy" : "move";
              if (has(e, POOL_DATA)) setDropping(true);
            }
          }}
          onDragLeave={() => setDropping(false)}
          onDrop={dropOnDeck}
          data-testid="builder-deck"
        >
          {section("main", t("builder.main"))}
          {section("evolve", t("builder.evolve"))}
        </div>
      </section>

      <aside className="sve-builder-pool" onDragOver={(e) => has(e, DECK_DATA) && e.preventDefault()} onDrop={dropOnPool}>
        <div className="sve-builder-filters">
          <input
            className="sve-builder-search"
            placeholder={t("builder.search")}
            value={filters.text}
            onChange={(e) => setFilter("text", e.target.value)}
            data-testid="builder-search"
          />
          <div className="sve-builder-filter-grid">
            <select value={filters.class} onChange={(e) => setFilter("class", e.target.value)} aria-label={t("builder.class")}>
              <option value="any">{t("builder.anyClass")}</option>
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {t(`class.${c}` as const)}
                </option>
              ))}
            </select>
            <select value={filters.type} onChange={(e) => setFilter("type", e.target.value as TypeFilter)} aria-label={t("builder.type")} data-testid="builder-type">
              <option value="any">{t("builder.anyType")}</option>
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`builder.type.${type}` as const)}
                </option>
              ))}
            </select>
            <select value={filters.cost} onChange={(e) => setFilter("cost", e.target.value)} aria-label={t("builder.cost")}>
              <option value="any">{t("builder.anyCost")}</option>
              {COSTS.map((c) => (
                <option key={c} value={c}>
                  {c === "10" ? t("builder.cost10") : t("builder.costN", { n: c })}
                </option>
              ))}
            </select>
            <select value={filters.set} onChange={(e) => setFilter("set", e.target.value)} aria-label={t("builder.set")}>
              <option value="any">{t("builder.anySet")}</option>
              {sets.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select value={filters.universe} onChange={(e) => setFilter("universe", e.target.value)} aria-label={t("builder.universe")}>
              <option value="any">{t("builder.anyUniverse")}</option>
              <option value="none">{t("builder.noUniverse")}</option>
              {universes.map((u) => (
                <option key={u} value={u}>
                  {t(`universe.${u}` as const)}
                </option>
              ))}
            </select>
            <input list="sve-traits" placeholder={t("builder.trait")} value={filters.trait} onChange={(e) => setFilter("trait", e.target.value)} aria-label={t("builder.trait")} />
            <select value={filters.ability} onChange={(e) => setFilter("ability", e.target.value as "any" | AbilityTag)} aria-label={t("builder.ability")} data-testid="builder-ability">
              <option value="any">{t("builder.anyAbility")}</option>
              {ABILITIES.map((a) => (
                <option key={a} value={a}>
                  {t(`abilityTag.${a}` as const)}
                </option>
              ))}
            </select>
            <datalist id="sve-traits">
              {traits.map((trait) => (
                <option key={trait} value={trait} />
              ))}
            </datalist>
            <select value={filters.sort} onChange={(e) => setFilter("sort", e.target.value as PoolFilters["sort"])} aria-label={t("builder.sortBy")}>
              <option value="number">{t("builder.sortBy.number")}</option>
              <option value="cost">{t("builder.sortBy.cost")}</option>
              <option value="name">{t("builder.sortBy.name")}</option>
            </select>
            <button type="button" onClick={() => setFilters(NO_FILTERS)}>
              {t("builder.clearFilters")}
            </button>
            <label className="sve-check sve-builder-all-printings" title={t("builder.allPrintingsHelp")}>
              <input type="checkbox" checked={allPrintings} onChange={(e) => updateSettings({ builderAllPrintings: e.target.checked })} data-testid="builder-all-printings" />
              {t("builder.allPrintings")}
            </label>
          </div>
          <header className="sve-builder-pool-header">
            <strong>{t(allPrintings ? "builder.resultsPrintings" : "builder.results", { n: results.length })}</strong>
            <span className="sve-hint">{t(compact ? "builder.addHintTouch" : "builder.addHint")}</span>
          </header>
        </div>
        {/* data-stale: the pool still shows the previous filters (they are applied in the background, useDeferredValue). */}
        <div
          ref={poolRef}
          className="sve-builder-pool-grid"
          style={{ "--sve-card-width": `${poolCard}px`, gridTemplateColumns: `repeat(${poolColumns}, ${poolCard}px)` } as CSSProperties}
          data-stale={filters !== deferredFilters ? "" : undefined}
          data-testid="builder-pool"
        >
          {results.slice(0, limit).map(({ card, printing }) => {
            // Copies of the card (any printing; the limit counts them together) and, listing printings, of this one.
            const total = copiesOfDefinition(deck, card.printings);
            const own = copiesOfDefinition(deck, [printing]);
            const alt = printing !== card.printings[0];
            return (
              <div
                key={printing}
                className="sve-pool-tile"
                draggable={!compact}
                onDragStart={(e) => startDrag(e, POOL_DATA, printing)}
                onClick={() => add(card, printing)}
                data-printing={printing}
              >
                <CardTile info={{ def: card.id, printing }} />
                {total > 0 ? <PoolCount own={allPrintings ? own : total} total={total} /> : null}
                {allPrintings && card.printings.length > 1 ? <span className={`sve-printing-label${alt ? " sve-alt" : ""}`}>{printing}</span> : null}
              </div>
            );
          })}
          <div ref={sentinel} className="sve-pool-sentinel" />
        </div>
      </aside>

      {choosingLeader ? (
        <LeaderPicker
          current={deck[choosingLeader] ?? null}
          onPick={(printing) => {
            setDeck((d) => {
              const next = { ...d };
              if (printing) next[choosingLeader] = printing;
              else delete next[choosingLeader];
              return next;
            });
            setChoosingLeader(null);
          }}
          onClose={() => setChoosingLeader(null)}
        />
      ) : null}
      {codeOpen ? <DeckCodeDialog deck={deck} catalog={catalog} onImport={importDeck} onClose={() => setCodeOpen(false)} /> : null}
      {told ? (
        <ProblemsDialog title={t("builder.problemsTitle", { format: t(`format.${format}`) })} problems={told.problems} ctx={{ catalog, lang: cardLang, t }}>
          {told.then ? (
            <>
              <button type="button" onClick={() => setTold(null)} data-testid="format-problems-stay">
                {t("builder.keepEditing")}
              </button>
              <button
                type="button"
                className="sve-primary"
                onClick={() => {
                  const go = told.then!;
                  setTold(null);
                  go();
                }}
                data-testid="format-problems-leave"
              >
                {t("builder.leave")}
              </button>
            </>
          ) : (
            <>
              <span className="sve-note">{t("builder.problemsSaved")}</span>
              <button type="button" className="sve-primary" onClick={() => setTold(null)} data-testid="format-problems-ok">
                {t("builder.ok")}
              </button>
            </>
          )}
        </ProblemsDialog>
      ) : null}
    </div>
  );
}

/** A pool tile's copies in the deck: of this printing, and of the card when other printings of it are in too ("(3)"). */
function PoolCount({ own, total }: { own: number; total: number }) {
  if (own === 0) return <span className="sve-pool-count sve-pool-count-other">({total})</span>;
  return <span className="sve-pool-count">{own === total ? `×${own}` : `×${own} (${total})`}</span>;
}
