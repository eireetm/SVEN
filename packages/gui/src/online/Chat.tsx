// The chat with the other player (docs/online.md), in the online screen and in a game's sidebar. Only the online state
// (net/state.ts): the game screen shows it without loading the connection code.
import { useEffect, useRef, useState } from "react";
import { useT } from "../i18n";
import { CHAT_MAX } from "../net/messages";
import { sendChat, useOnline } from "../net/state";

export function Chat() {
  const t = useT();
  const { chat, phase } = useOnline();
  const [line, setLine] = useState("");
  const lines = useRef<HTMLDivElement>(null);
  // The newest line in view.
  useEffect(() => {
    const box = lines.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [chat.length]);
  return (
    <div className="sve-online-chat-box">
      <div className="sve-online-chat" ref={lines} data-testid="online-chat">
        {chat.length === 0 ? <p className="sve-hint">{t("online.chatEmpty")}</p> : null}
        {chat.map((c, i) => (
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
        <input value={line} onChange={(e) => setLine(e.target.value)} maxLength={CHAT_MAX} placeholder={t("online.chatPlaceholder")} data-testid="online-chat-input" />
        <button type="submit" disabled={line.trim() === "" || phase.kind !== "connected"} data-testid="online-send">
          {t("online.send")}
        </button>
      </form>
    </div>
  );
}
