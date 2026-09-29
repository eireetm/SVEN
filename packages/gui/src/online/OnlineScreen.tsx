// Online play (docs/online.md), first step: connecting two programs. Make a room (a code to pass to the other player) or join
// one; or pass connection codes by hand when the public networks can't be reached. Connected, it shows how (which network,
// direct or through a relay), the round trip, whether both programs have the same cards, and a chat. Playing a game over the
// connection is the next step.
import { useEffect, useState } from "react";
import { useApp } from "../app/store";
import { useT } from "../i18n";
import { checkNetwork, type NetworkCheck } from "../net/check";
import { normalizeRoomCode } from "../net/codes";
import {
  acceptReply,
  cardsFingerprint,
  getOnline,
  hostManually,
  hostRoom,
  identify,
  joinManually,
  joinRoom,
  leave,
  PROTOCOL,
  sendChat,
  useOnline,
  type OnlinePhase,
} from "../net/online";

/** Seconds since `since`, updated every second (for "still looking" hints). */
function useSeconds(since: number): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return Math.max(0, Math.floor((now - since) / 1000));
}

/** A code to pass on, with a button that copies it. */
function CodeBox({ code, large = false, testId }: { code: string; large?: boolean; testId: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const copy = () =>
    void navigator.clipboard.writeText(code).then(
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

export function OnlineScreen({ onBack }: { onBack: () => void }) {
  const t = useT();
  const online = useOnline();
  const catalog = useApp((s) => s.catalog);
  useEffect(() => {
    if (catalog) void identify(catalog);
  }, [catalog]);
  const back = () => {
    if (getOnline().phase.kind !== "idle") leave();
    onBack();
  };
  return (
    <div className="sve-menu">
      <div className="sve-menu-panel sve-online" data-testid="online" data-phase={online.phase.kind}>
        <h2>{t("online.title")}</h2>
        <Phase phase={online.phase} since={online.since} />
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

function Phase({ phase, since }: { phase: OnlinePhase; since: number }) {
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
          <button type="button" onClick={leave}>
            {t("online.cancel")}
          </button>
        </div>
      );
    case "joining":
      return (
        <div className="sve-online-step">
          <p>{t("online.searching", { code: phase.code, s: seconds })}</p>
          {slow ? <p className="sve-hint">{t("online.slowHint")}</p> : null}
          <button type="button" onClick={leave}>
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
          <button type="button" onClick={leave}>
            {t("online.cancel")}
          </button>
        </div>
      );
    case "connected":
      return <Connected phase={phase} />;
    case "closed":
      return (
        <div className="sve-online-step">
          <p className="sve-problem" data-testid="online-closed">
            {t(`online.closed.${phase.reason}` as const)}
          </p>
          <button type="button" onClick={leave}>
            {t("online.again")}
          </button>
        </div>
      );
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
      <button type="button" className="sve-primary sve-menu-button" onClick={hostRoom} data-testid="online-host">
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
    void navigator.clipboard.writeText([...lines, verdict].join("\n")).then(
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
      <button type="button" onClick={leave}>
        {t("online.cancel")}
      </button>
    </div>
  );
}

/** Connected: how, how fast, the same cards or not, and a chat. */
function Connected({ phase }: { phase: Extract<OnlinePhase, { kind: "connected" }> }) {
  const t = useT();
  const online = useOnline();
  const catalog = useApp((s) => s.catalog);
  const [mine, setMine] = useState<string | null>(null);
  const [line, setLine] = useState("");
  useEffect(() => {
    if (catalog) void cardsFingerprint(catalog).then(setMine);
  }, [catalog]);
  const same = phase.peer === null ? null : phase.peer.version === PROTOCOL && phase.peer.cards === mine;
  return (
    <div className="sve-online-step">
      <p className="sve-online-ok" data-testid="online-connected">
        {t("online.connected")}
      </p>
      <ul className="sve-online-facts">
        <li>
          {t("online.viaLabel")}<span data-testid="online-via">{t(`online.via.${phase.via}` as const)}</span>
        </li>
        <li>
          {t("online.routeLabel")}
          {t(`online.route.${phase.route}` as const)}
        </li>
        <li>
          {t("online.rttLabel")}<span data-testid="online-rtt">{phase.rtt === null ? "…" : `${phase.rtt} ms`}</span>
        </li>
        <li className={same === false ? "sve-problem" : undefined} data-testid="online-same">
          {same === null ? t("online.peerUnknown") : same ? t("online.peerSame") : t("online.peerDifferent")}
        </li>
      </ul>
      <div className="sve-online-chat" data-testid="online-chat">
        {online.chat.length === 0 ? <p className="sve-hint">{t("online.chatEmpty")}</p> : null}
        {online.chat.map((c, i) => (
          <p key={i} className={c.from === "me" ? "sve-online-mine" : "sve-online-theirs"}>
            <strong>{t(c.from === "me" ? "online.me" : "online.them")}</strong> {c.text}
          </p>
        ))}
      </div>
      <form
        className="sve-online-join"
        onSubmit={(e) => {
          e.preventDefault();
          sendChat(line);
          setLine("");
        }}
      >
        <input value={line} onChange={(e) => setLine(e.target.value)} maxLength={500} placeholder={t("online.chatPlaceholder")} data-testid="online-chat-input" />
        <button type="submit" disabled={line.trim() === ""} data-testid="online-send">
          {t("online.send")}
        </button>
      </form>
      <p className="sve-hint">{t("online.nextStep")}</p>
      <button type="button" onClick={leave} data-testid="online-leave">
        {t("online.leave")}
      </button>
    </div>
  );
}
