// The table's effects, drawn in a layer over the whole window (outside React: they are short-lived copies of card elements
// and numbers). A card that arrives somewhere is see-through while its copy flies in, so it lands (it still takes clicks
// and drags); a card that goes into a pile flies there from where it was.
import type { CardShot } from "./snapshot";

const EASE = "cubic-bezier(.2,.7,.25,1)";

function layer(): HTMLElement {
  let root = document.getElementById("sve-fx");
  if (!root) {
    root = document.createElement("div");
    root.id = "sve-fx";
    root.className = "sve-fx-layer";
    document.body.appendChild(root);
  }
  return root;
}

/** A copy of a card element to fly around: fixed at `box`, same size (its card width `w`), inert. */
function ghostOf(element: HTMLElement, box: DOMRect, w: string): HTMLElement {
  const ghost = element.cloneNode(true) as HTMLElement;
  ghost.removeAttribute("data-card");
  for (const inner of ghost.querySelectorAll("[data-card]")) inner.removeAttribute("data-card");
  ghost.removeAttribute("style");
  ghost.classList.add("sve-ghost");
  ghost.style.left = `${box.left}px`;
  ghost.style.top = `${box.top}px`;
  if (w) ghost.style.setProperty("--w", w);
  layer().appendChild(ghost);
  return ghost;
}

/**
 * The card element has just arrived: a copy flies from `from` to it while it stays see-through. After `delay` ms: until
 * then the copy waits where the card was (a card being hit is seen there first).
 */
export function flyIn(element: HTMLElement, from: DOMRect, duration = 380, delay = 0): void {
  const to = element.getBoundingClientRect();
  if (to.width === 0 || (Math.abs(to.left - from.left) < 2 && Math.abs(to.top - from.top) < 2)) return;
  const ghost = ghostOf(element, to, getComputedStyle(element).getPropertyValue("--w"));
  element.style.opacity = "0";
  const animation = ghost.animate(
    [{ transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})` }, { transform: "translate(0, 0) scale(1)" }],
    { duration, delay, easing: EASE, fill: "backwards" },
  );
  const done = () => {
    ghost.remove();
    element.style.opacity = "";
  };
  animation.onfinish = done;
  animation.oncancel = done;
}

/** A card went where it isn't shown (a deck, a pile's back): its old picture flies to that place and fades (after `delay` ms). */
export function flyOut(shot: CardShot, to: DOMRect, duration = 420, delay = 0): void {
  const from = shot.rect;
  if (from.width === 0) return;
  const ghost = ghostOf(shot.element, from, shot.width);
  const scale = Math.min(1, to.width / from.width);
  const dx = to.left + to.width / 2 - (from.left + (from.width * scale) / 2);
  const dy = to.top + to.height / 2 - (from.top + (from.height * scale) / 2);
  const animation = ghost.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.25 },
    ],
    { duration, delay, easing: EASE, fill: "backwards" },
  );
  animation.onfinish = () => ghost.remove();
  animation.oncancel = () => ghost.remove();
}

/** A card that came from nowhere visible (a new token): it grows in place. */
export function popIn(element: HTMLElement): void {
  const frame = element.querySelector<HTMLElement>(".sve-card-frame") ?? element;
  frame.animate([{ transform: "scale(0.4)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 320, easing: EASE });
}

/** A number rising from a card: damage, healing. */
export function floatText(x: number, y: number, text: string, kind: "damage" | "heal"): void {
  const label = document.createElement("div");
  label.className = `sve-float sve-float-${kind}`;
  label.textContent = text;
  label.style.left = `${x}px`;
  label.style.top = `${y}px`;
  layer().appendChild(label);
  const animation = label.animate(
    [
      { transform: "translate(-50%, -50%) scale(0.5)", opacity: 0 },
      { transform: "translate(-50%, -90%) scale(1.3)", opacity: 1, offset: 0.2 },
      { transform: "translate(-50%, -200%) scale(1)", opacity: 0 },
    ],
    { duration: 1150, easing: "ease-out" },
  );
  animation.onfinish = () => label.remove();
}

/** A follower evolves: it turns over, lit up. */
export function flip(element: HTMLElement): void {
  const frame = element.querySelector<HTMLElement>(".sve-card-frame") ?? element;
  frame.animate(
    [
      { transform: "perspective(700px) rotateY(90deg)", filter: "brightness(2.2)" },
      { transform: "perspective(700px) rotateY(0deg)", filter: "brightness(1)" },
    ],
    { duration: 460, easing: "ease-out" },
  );
}

/** A follower attacks: it leans toward its target and back. */
export function lunge(attacker: HTMLElement, target: HTMLElement): void {
  const a = attacker.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const dx = (b.left + b.width / 2 - (a.left + a.width / 2)) * 0.28;
  const dy = (b.top + b.height / 2 - (a.top + a.height / 2)) * 0.28;
  const frame = attacker.querySelector<HTMLElement>(".sve-card-frame") ?? attacker;
  frame.animate(
    [{ transform: "translate(0, 0)" }, { transform: `translate(${dx}px, ${dy}px) scale(1.08)`, offset: 0.45 }, { transform: "translate(0, 0)" }],
    { duration: 380, easing: "ease-in-out" },
  );
}

/** A card is hit: a short shake. */
export function shake(element: HTMLElement): void {
  const frame = element.querySelector<HTMLElement>(".sve-card-frame") ?? element;
  frame.animate(
    [{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(-2px)" }, { transform: "translateX(0)" }],
    { duration: 260, delay: 120 },
  );
}
