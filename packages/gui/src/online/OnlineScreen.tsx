// Online play (docs/online.md). Make a room (a code to pass to the other player) or join one; or pass connection codes by
// hand when the public networks can't be reached. Connected, it shows how (which network, direct or through a relay), the
// round trip, whether both programs are the same, a chat, and the next game's preparation: the host's rules, each player's
// deck, ready. Both ready, the game starts (on the game screen); after it, the next one is prepared here. A lost connection
// can be made again, and the game goes on where it was.
import { useEffect, useState } from "react";
import { errorText } from "../app/errors";
import { updateSettings, useSettings } from "../app/settings";
import { reportError, useApp } from "../app/store";
import { cardCount, type DeckFile } from "../decks/format";
import type { TurnOrder } from "../engine/protocol";
import { formatProblemText, type FormatProblem } from "../formats/formats";
import { FormatPicker } from "../formats/FormatPicker";
import { hostApi, type DeckFileEntry } from "../host/api";
import { useT } from "../i18n";
import { checkNetwork, type NetworkCheck } from "../net/check";
import { normalizeRoomCode } from "../net/codes";
import type { Rules } from "../net/messages";
import {
  acceptReply,
  cancel,
  getOnline,
  hostManually,
  hostRoom,
  identify,
  joinManually,
  joinRoom,
  leave,
  leavingConcedes,
  problemsUnder,
  ready,
  readyDeckOf,
  reconnect,
  samePrograms,
  updateRules,
  useOnline,
  type OnlinePhase,
} from "../net/online";
import { Chat } from "./Chat";
import { useBack } from "../app/back";

/** Who goes first, as the game setup offers it (the rules' way first). */
const TURN_ORDERS: readonly TurnOrder[] = ["choose", "random", "player1", "player2"];

/** Seconds since `since`, updated every second (for "still looking" hints). */
function useSeconds(since: number): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return Math.max(0, Math.floor((now - since) / 1000));
}

/** Whether a game over the connection is in progress (it goes on after a lost connection). */
function useGameGoing(): boolean {
  const game = useOnline().game;
  const going = useApp((s) => s.update?.online != null && !s.update.result);
  return game !== null && going;
}

/** Leave the connection; a game in progress is conceded, once the person says so. */
function leaveAsking(t: ReturnType<typeof useT>): void {
  if (!leavingConcedes() || window.confirm(t("online.leaveConfirm"))) leave();
}

/** A code to pass on, with a button that copies it. */
function CodeBox({ code, large = false, testId }: { code: string; large?: boolean; testId: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const copy = () =>
    void hostApi.copyText(code).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  return (
    <div className={`sve-online-code${large ? " sve-online-room-code" : ""}`}>
      {large ? (
        <strong data-testid={testId}>{code}</strong>
      ) : (
        <textarea readOnly value={code} rows={4} onFocus={(e) => e.target.select()} data-testid={testId} />
      )}
      <button type="button" onClick={copy}>
        {t(copied ? "online.copied" : "online.copy")}
      </button>
    </div>
  );
}

interface Props {
  onBack: () => void;
  /** To the game in progress (a game that starts shows by itself: App). */
  onGame: () => void;
  onEditDecks: () => void;
}

export function OnlineScreen({ onBack, onGame, onEditDecks }: Props) {
  const t = useT();
  const online = useOnline();
  const catalog = useApp((s) => s.catalog);
  const going = useGameGoing();
  // This program's fingerprint (the other program is compared with it).
  const [identified, setIdentified] = useState(false);
  useEffect(() => {
    if (catalog) void identify(catalog).then(() => setIdentified(true));
  }, [catalog]);
  // Back to the menu: looking stops; a connection stays (the menu says so), and so does a game waiting for its connection.
  const back = () => {
    const kind = getOnline().phase.kind;
    if (kind === "hosting" || kind === "joining" || kind === "manualHost" || kind === "manualGuest") cancel();
    else if (kind === "closed" && !going) leave();
    onBack();
  };
  useBack(true, back);
  return (
    <div className="sve-menu">
      <div className="sve-menu-panel sve-online" data-testid="online" data-phase={online.phase.kind}>
        <h2>{t("online.title")}</h2>
        <Phase phase={online.phase} since={online.since} identified={identified} going={going} onGame={onGame} onEditDecks={onEditDecks} />
        {online.error ? (
          <p className="sve-problem" data-testid="online-error">
            {t(online.error)}
          </p>
        ) : null}
        <button type="button" onClick={back} data-testid="online-back">
          {t("common.back")}
        </button>
      </div>
    </div>
  );
}

interface PhaseProps {
  phase: OnlinePhase;
  since: number;
  identified: boolean;
  going: boolean;
  onGame: () => void;
  onEditDecks: () => void;
}

function Phase({ phase, since, identified, going, onGame, onEditDecks }: PhaseProps) {
  const t = useT();
  const seconds = useSeconds(since);
  const slow = seconds >= 20;
  switch (phase.kind) {
    case "idle":
      return <Start />;
    case "hosting":
      return (
        <div className="sve-online-step">
          <p>{t("online.roomCode")}</p>
          <CodeBox code={phase.code} large testId="online-room-code" />
          <p className="sve-hint">{t("online.hostWaiting", { s: seconds })}</p>
          {slow ? <p className="sve-hint">{t("online.slowHint")}</p> : null}
          <button type="button" onClick={cancel}>
            {t("online.cancel")}
          </button>
        </div>
      );
    case "joining":
      return (
        <div className="sve-online-step">
          <p>{t("online.searching", { code: phase.code, s: seconds })}</p>
          {slow ? <p className="sve-hint">{t("online.slowHint")}</p> : null}
          <button type="button" onClick={cancel}>
            {t("online.cancel")}
          </button>
        </div>
      );
    case "manualHost":
      return <ManualHost offer={phase.offer} accepted={phase.accepted} />;
    case "manualGuest":
      return (
        <div className="sve-online-step">
          {phase.reply === null ? (
            <p className="sve-hint">{t("online.making")}</p>
          ) : (
            <>
              <p>{t("online.replyHelp")}</p>
              <CodeBox code={phase.reply} testId="online-reply-code" />
              <p className="sve-hint">{t("online.waitingForHost", { s: seconds })}</p>
            </>
          )}
          <button type="button" onClick={cancel}>
            {t("online.cancel")}
          </button>
        </div>
      );
    case "connected":
      return <Connected phase={phase} identified={identified} going={going} onGame={onGame} onEditDecks={onEditDecks} />;
    case "closed":
      return <Closed reason={phase.reason} going={going} onGame={onGame} />;
  }
}

/** Make a room, join one, or pass codes by hand. */
function Start() {
  const t = useT();
  const [code, setCode] = useState("");
  const [offer, setOffer] = useState("");
  const room = normalizeRoomCode(code);
  return (
    <div className="sve-online-step">
      <button type="button" className="sve-primary sve-menu-button" onClick={() => hostRoom()} data-testid="online-host">
        {t("online.host")}
      </button>
      <form
        className="sve-online-join"
        onSubmit={(e) => {
          e.preventDefault();
          if (room) joinRoom(room);
        }}
      >
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("online.codePlaceholder")} maxLength={12} data-testid="online-code" />
        <button type="submit" disabled={!room} data-testid="online-join">
          {t("online.join")}
        </button>
      </form>
      <details className="sve-online-manual">
        <summary>{t("online.manual")}</summary>
        <p className="sve-hint">{t("online.manualHelp")}</p>
        <button type="button" onClick={() => void hostManually()} data-testid="online-manual-host">
          {t("online.manualHost")}
        </button>
        <p>{t("online.pasteOffer")}</p>
        <textarea value={offer} onChange={(e) => setOffer(e.target.value)} rows={3} data-testid="online-offer-input" />
        <button type="button" disabled={offer.trim() === ""} onClick={() => void joinManually(offer)} data-testid="online-manual-join">
          {t("online.makeReply")}
        </button>
      </details>
      <NetworkCheckPanel />
    </div>
  );
}

/** The connection ended. A game in progress waits: connect again (the same room, or any other way) and it goes on. */
function Closed({ reason, going, onGame }: { reason: "left" | "lost" | "full"; going: boolean; onGame: () => void }) {
  const t = useT();
  const room = useOnline().room;
  return (
    <div className="sve-online-step">
      <p className="sve-problem" data-testid="online-closed">
        {t(`online.closed.${reason}` as const)}
      </p>
      {going ? (
        <>
          <p className="sve-hint">{t("online.reconnectHelp")}</p>
          {room ? (
            <button type="button" className="sve-primary" onClick={reconnect} data-testid="online-reconnect">
              {t("online.reconnect", { code: room.code })}
            </button>
          ) : null}
          <button type="button" onClick={onGame} data-testid="online-to-game">
            {t("online.toGame")}
          </button>
          <Start />
          <button type="button" className="sve-concede" onClick={() => leaveAsking(t)} data-testid="online-leave">
            {t("online.leaveGame")}
          </button>
        </>
      ) : (
        <button type="button" onClick={leave} data-testid="online-again">
          {t("online.again")}
        </button>
      )}
    </div>
  );
}

/** What this computer can reach of what online play needs (net/check.ts), to compare when two players can't connect. */
function NetworkCheckPanel() {
  const t = useT();
  const [result, setResult] = useState<NetworkCheck | "checking" | null>(null);
  const [copied, setCopied] = useState(false);
  const run = () => {
    setResult("checking");
    setCopied(false);
    void checkNetwork().then(setResult);
  };
  if (result === null || result === "checking") {
    return (
      <button type="button" className="sve-online-check-button" disabled={result === "checking"} onClick={run} data-testid="online-check">
        {t(result === "checking" ? "online.checking" : "online.check")}
      </button>
    );
  }
  const lines = [
    ...result.relays.map((r) => t("online.checkRelays", { name: t(`online.via.${r.via}` as const), reached: r.reached, total: r.total })),
    `${t("online.checkStun")}${result.stun.map((s) => `${s.url.replace(/^stun:/, "")} ${s.ok ? "✓" : "✗"}`).join(" · ")}`,
  ];
  const noRelay = result.relays.every((r) => r.reached === 0);
  const noStun = result.stun.every((s) => !s.ok);
  const verdict = noRelay ? t("online.checkNoRelays") : noStun ? t("online.checkNoStun") : t("online.checkOk");
  const copy = () =>
    void hostApi.copyText([...lines, verdict].join("\n")).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  return (
    <div className="sve-online-check" data-testid="online-check-result">
      <ul>
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      <p className={noRelay || noStun ? "sve-problem" : "sve-online-ok-text"}>{verdict}</p>
      <div className="sve-online-join">
        <button type="button" onClick={copy}>
          {t(copied ? "online.copied" : "online.copyResult")}
        </button>
        <button type="button" onClick={run}>
          {t("online.checkAgain")}
        </button>
      </div>
    </div>
  );
}

/** Codes by hand, the host: its connection code, then the guest's reply code. */
function ManualHost({ offer, accepted }: { offer: string | null; accepted: boolean }) {
  const t = useT();
  const [reply, setReply] = useState("");
  if (offer === null) return <p className="sve-hint">{t("online.making")}</p>;
  return (
    <div className="sve-online-step">
      <p>{t("online.offerHelp")}</p>
      <CodeBox code={offer} testId="online-offer-code" />
      <p>{t("online.pasteReply")}</p>
      <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} data-testid="online-reply-input" />
      <button type="button" className="sve-primary" disabled={reply.trim() === "" || accepted} onClick={() => void acceptReply(reply)} data-testid="online-connect">
        {t(accepted ? "online.connecting" : "online.connect")}
      </button>
      <button type="button" onClick={cancel}>
        {t("online.cancel")}
      </button>
    </div>
  );
}

interface ConnectedProps {
  phase: Extract<OnlinePhase, { kind: "connected" }>;
  identified: boolean;
  going: boolean;
  onGame: () => void;
  onEditDecks: () => void;
}

/** Connected: how, how fast, the same programs or not; the game in progress, or the next one's preparation; the chat. */
function Connected({ phase, identified, going, onGame, onEditDecks }: ConnectedProps) {
  const t = useT();
  const online = useOnline();
  const same = identified ? samePrograms(phase.peer) : null;
  return (
    <div className="sve-online-step">
      <p className="sve-online-ok" data-testid="online-connected">
        {t("online.connected")}
      </p>
      <ul className="sve-online-facts">
        <li>
          {t("online.viaLabel")}
          <span data-testid="online-via">{t(`online.via.${phase.via}` as const)}</span>
        </li>
        <li>
          {t("online.routeLabel")}
          {t(`online.route.${phase.route}` as const)}
        </li>
        <li>
          {t("online.rttLabel")}
          <span data-testid="online-rtt">{phase.rtt === null ? "…" : `${phase.rtt} ms`}</span>
        </li>
        <li className={same === false ? "sve-problem" : undefined} data-testid="online-same">
          {same === null ? t("online.peerUnknown") : same ? t("online.peerSame") : t("online.peerDifferent")}
        </li>
      </ul>
      {going && online.game ? (
        <div className="sve-online-game" data-testid="online-game">
          <p>{t("online.gameGoing", { deck: online.game.opponent })}</p>
          <button type="button" className="sve-primary" onClick={onGame} data-testid="online-to-game">
            {t("online.toGame")}
          </button>
        </div>
      ) : (
        <Prep role={phase.role} same={same} onEditDecks={onEditDecks} />
      )}
      <Chat />
      <button type="button" onClick={() => leaveAsking(t)} data-testid="online-leave">
        {t(going ? "online.leaveGame" : "online.leave")}
      </button>
    </div>
  );
}

/** "Standard · restriction list: 01_26_JPN · first player: a random player chooses". */
function rulesText(rules: Rules, t: ReturnType<typeof useT>): string {
  return t("online.rulesSummary", { format: t(`format.${rules.format}`), list: rules.list ?? t("format.noList"), order: t(`turnOrder.${rules.turnOrder}`) });
}

/**
 * The next game: the host's rules (the host sets them here, in its settings: the format and restriction list the deck builder
 * uses, the setup's first player), each player's deck checked under them, ready or not. Both ready: the game starts.
 */
function Prep({ role, same, onEditDecks }: { role: "host" | "guest"; same: boolean | null; onEditDecks: () => void }) {
  const t = useT();
  const settings = useSettings();
  const catalog = useApp((s) => s.catalog);
  const { prep } = useOnline();
  const [decks, setDecks] = useState<DeckFileEntry[] | null>(null);
  const [status, setStatus] = useState<{ deck: DeckFile; problems: FormatProblem[] } | null>(null);
  const file = settings.setupDecks[0];
  const rules = prep.rules;

  // The host's rules follow its settings.
  useEffect(() => {
    if (role === "host") updateRules();
  }, [role, settings.format, settings.restrictionLists, settings.setupTurnOrder]);
  useEffect(() => {
    hostApi.listDecks().then(setDecks, (err: unknown) => reportError(String(err)));
  }, []);
  // This player's deck, checked under the game's rules.
  useEffect(() => {
    let live = true;
    setStatus(null);
    if (!catalog || !rules) return;
    hostApi
      .loadDeck(file)
      .then(async (deck) => {
        const problems = await problemsUnder(rules, deck, catalog);
        if (live) setStatus({ deck, problems });
      })
      .catch((err: unknown) => reportError(`${file}: ${errorText(err, t)}`));
    return () => {
      live = false;
    };
  }, [file, rules, catalog]);

  const ctx = catalog ? { catalog, lang: settings.cardLang, t } : null;
  const isReady = prep.mine !== null;
  const canReady = same === true && rules !== null && catalog !== null && status !== null && status.problems.length === 0;
  return (
    <div className="sve-online-prep" data-testid="online-prep">
      <section>
        <h3>{t("online.rules")}</h3>
        {role === "host" ? (
          // Taking the rules back needs "not ready" first: they are the ones the other player's deck was checked under.
          <fieldset className="sve-online-rules" disabled={isReady}>
            <FormatPicker />
            <label className="sve-field">
              <span>{t("setup.turnOrder")}</span>
              <select value={settings.setupTurnOrder} onChange={(e) => updateSettings({ setupTurnOrder: e.target.value as TurnOrder })} data-testid="online-turn-order">
                {TURN_ORDERS.map((order) => (
                  <option key={order} value={order}>
                    {t(`turnOrder.${order}`)}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>
        ) : (
          <>
            <p data-testid="online-rules">{rules ? rulesText(rules, t) : "…"}</p>
            <p className="sve-hint">{t("online.hostSetsRules")}</p>
          </>
        )}
      </section>
      <section>
        <h3>{t("online.yourDeck")}</h3>
        <label className="sve-field">
          <span>{t("setup.deck")}</span>
          <select value={file} disabled={isReady} onChange={(e) => updateSettings({ setupDecks: [e.target.value, settings.setupDecks[1]] })} data-testid="online-deck">
            {!decks?.some((d) => d.file === file) ? <option value={file}>{file}</option> : null}
            {(decks ?? []).map((d) => (
              <option key={d.file} value={d.file}>
                {d.name} ({d.file})
              </option>
            ))}
          </select>
        </label>
        <div className="sve-deck-status">
          {status === null ? (
            <span className="sve-note">{t("setup.loadingDeck")}</span>
          ) : (
            <>
              <span>{t("setup.deckSummary", { main: cardCount(status.deck.main), evolve: cardCount(status.deck.evolve) })}</span>
              {status.problems.length === 0 ? <span className="sve-ok">{t("setup.deckOk")}</span> : null}
              {status.problems.length > 0 && ctx && rules ? (
                <div className="sve-problems" data-testid="online-deck-problems">
                  {t("setup.deckProblems", { format: t(`format.${rules.format}`) })}
                  <ul>
                    {status.problems.map((problem, i) => (
                      <li key={i}>{formatProblemText(problem, ctx)}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </div>
        <div className="sve-online-join">
          {isReady ? (
            <button type="button" disabled={prep.starting} onClick={() => void ready(null)} data-testid="online-unready">
              {t("online.unready")}
            </button>
          ) : (
            <button
              type="button"
              className="sve-primary"
              disabled={!canReady}
              onClick={() => {
                if (status && rules && catalog) void ready(readyDeckOf(status.deck, rules, catalog));
              }}
              data-testid="online-ready"
            >
              {t("online.ready")}
            </button>
          )}
          <button type="button" className="sve-link-button" disabled={isReady} onClick={onEditDecks}>
            {t("setup.editDecks")}
          </button>
        </div>
      </section>
      <section>
        <h3>{t("online.opponent")}</h3>
        <p data-testid="online-opponent" data-ready={prep.theirs !== null && prep.theirsProblems?.length === 0 ? "yes" : "no"}>
          {prep.theirs === null
            ? t("online.opponentChoosing")
            : prep.theirsProblems === null
              ? t("online.opponentChecking")
              : prep.theirsProblems.length === 0
                ? t("online.opponentReady", { deck: prep.theirs.name })
                : t("online.opponentProblems", { deck: prep.theirs.name })}
        </p>
        {prep.theirsProblems && prep.theirsProblems.length > 0 && ctx ? (
          <ul className="sve-problems">
            {prep.theirsProblems.map((problem, i) => (
              <li key={i}>{formatProblemText(problem, ctx)}</li>
            ))}
          </ul>
        ) : null}
      </section>
      <p className={prep.starting ? "sve-online-ok-text" : "sve-hint"} data-testid="online-prep-status">
        {t(prep.starting ? "online.starting" : "online.bothReady")}
      </p>
    </div>
  );
}
