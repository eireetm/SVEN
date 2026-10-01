// Connecting without any relay: the host's program makes a WebRTC offer with all its addresses
// (the connection code), the guest's answers it (the reply code); people pass the codes by any chat. Works whenever the two
// programs can connect directly (or through the player's TURN relay).
import { decodeSignal, encodeSignal } from "./codes";
import { channelLink, type PeerLink } from "./link";
import { iceServers, type TurnServer } from "./relays";

/** Every address has been gathered (or it took too long: the ones found so far), so one code carries them all. */
function gathered(pc: RTCPeerConnection, ms = 5000): Promise<void> {
  if (pc.iceGatheringState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    const timer = window.setTimeout(done, ms);
    function done() {
      window.clearTimeout(timer);
      pc.removeEventListener("icegatheringstatechange", check);
      resolve();
    }
    function check() {
      if (pc.iceGatheringState === "complete") done();
    }
    pc.addEventListener("icegatheringstatechange", check);
  });
}

/** A code that isn't one of ours (or of the wrong kind): the person pasted something else. */
export class BadCodeError extends Error {}

export interface ManualAttempt {
  /** The code to pass to the other player. */
  code: string;
  /** Connected. */
  link: Promise<PeerLink>;
  cancel(): void;
}

/** The host's side: a connection code; then the guest's reply code completes the connection (`accept`). */
export async function offerConnection(turn: TurnServer | null): Promise<ManualAttempt & { accept(reply: string): Promise<void> }> {
  const pc = new RTCPeerConnection({ iceServers: iceServers(turn) });
  const channel = pc.createDataChannel("sve", { ordered: true });
  const link = new Promise<PeerLink>((resolve) => {
    channel.onopen = () => resolve(channelLink(pc, channel, "manual"));
  });
  await pc.setLocalDescription(await pc.createOffer());
  await gathered(pc);
  return {
    code: await encodeSignal("offer", pc.localDescription!.sdp),
    link,
    cancel: () => pc.close(),
    accept: async (reply) => {
      const sdp = await decodeSignal("answer", reply);
      if (!sdp) throw new BadCodeError("not a reply code");
      await pc.setRemoteDescription({ type: "answer", sdp });
    },
  };
}

/** The guest's side: from the host's connection code, the reply code to send back. */
export async function answerConnection(offer: string, turn: TurnServer | null): Promise<ManualAttempt> {
  const sdp = await decodeSignal("offer", offer);
  if (!sdp) throw new BadCodeError("not a connection code");
  const pc = new RTCPeerConnection({ iceServers: iceServers(turn) });
  const link = new Promise<PeerLink>((resolve) => {
    pc.ondatachannel = (e) => {
      const channel = e.channel;
      channel.onopen = () => resolve(channelLink(pc, channel, "manual"));
    };
  });
  await pc.setRemoteDescription({ type: "offer", sdp });
  await pc.setLocalDescription(await pc.createAnswer());
  await gathered(pc);
  return { code: await encodeSignal("answer", pc.localDescription!.sdp), link, cancel: () => pc.close() };
}
