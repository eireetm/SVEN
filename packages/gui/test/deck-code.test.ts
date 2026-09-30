import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createEngine } from "@sve/core";
import { ALL_CARDS, ALL_SCRIPTS } from "@sve/core/sets";
import { describe, expect, it } from "vitest";
import { Catalog } from "../src/app/catalog";
import { DECK_CODE_PREFIX, deckCode, importDeckText, nameKey, readDeckCode } from "../src/decks/deck-code";
import { cardCount, DeckFormatError, parseDeckFile, type DeckFile } from "../src/decks/format";

// Deck codes (src/decks/deck-code.ts): a deck in one line to share and import; importing a deck code of sve-server, whose
// cards are named in Chinese.

const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
const catalog = new Catalog(engine.db.all().map((def) => ({ ...def, status: engine.implementationStatus(def.id) })));
const samples = join(__dirname, "..", "decks", "samples");
const sample = (file: string): DeckFile => parseDeckFile(JSON.parse(readFileSync(join(samples, file), "utf8")));

/** What a code keeps of a deck file: all but its notes. */
const cards = ({ notes: _notes, ...deck }: DeckFile): DeckFile => deck;

/** The error key a deck code or text is refused with. */
function refusal(read: () => unknown): string | null {
  try {
    read();
    return null;
  } catch (err) {
    return err instanceof DeckFormatError ? err.key : String(err);
  }
}

describe("deck codes", () => {
  it("give back every sample deck as it was, in one line of letters, digits, - and _", () => {
    for (const file of readdirSync(samples)) {
      const deck = sample(file);
      const code = deckCode(deck);
      expect(code, file).toMatch(/^SVE1-[A-Za-z0-9_-]+$/);
      expect(code.length, file).toBeLessThan(300);
      expect(readDeckCode(code), file).toEqual(cards(deck));
    }
  });

  it("keep both leaders, printings with unusual numbers, copies, and the order of the cards", () => {
    const deck: DeckFile = {
      format: "sve-deck",
      version: 1,
      name: "テスト / 测试 deck",
      leader: "BP03-LDⓈ01",
      leader2: "BP01-LD05",
      main: { "BP01-002": 3, "PR-508": 1, "BP01-001": 2, "BP19-P31": 1, "BP01-SL01": 1 },
      evolve: { "BP01-121": 2, "BP16-119": 1 },
    };
    const back = readDeckCode(deckCode(deck));
    expect(back).toEqual(deck);
    expect(Object.keys(back.main)).toEqual(Object.keys(deck.main));
  });

  it("are read through spaces and line breaks a chat puts in, and whatever the case of SVE1-", () => {
    const deck = sample("sd01.json");
    const code = deckCode(deck);
    const wrapped = `  ${code.slice(0, 40)}\n${code.slice(40, 90)} ${code.slice(90)}\n`;
    expect(readDeckCode(wrapped)).toEqual(cards(deck));
    expect(readDeckCode("sve1-" + code.slice(DECK_CODE_PREFIX.length))).toEqual(cards(deck));
  });

  it("are refused when copied wrong or cut short, and other text isn't taken for one", () => {
    const code = deckCode(sample("sd02.json"));
    const i = Math.floor(code.length / 2);
    const changed = code.slice(0, i) + (code[i] === "A" ? "B" : "A") + code.slice(i + 1);
    expect(refusal(() => readDeckCode(changed))).toBe("deckFile.codeBroken");
    expect(refusal(() => readDeckCode(code.slice(0, code.length - 8)))).toBe("deckFile.codeBroken");
    expect(refusal(() => readDeckCode("hello"))).toBe("deckFile.notCode");
    expect(refusal(() => importDeckText("3 BP01-001", catalog))).toBe("deckFile.notCode");
    expect(refusal(() => importDeckText("{\"a\": 1}", catalog))).toBe("deckFile.notCode");
  });

  it("imported: cards this version doesn't know are left out and named; a deck file's JSON reads too", () => {
    const deck: DeckFile = { ...sample("sd01.json"), main: { "BP01-001": 2, "BP99-001": 3 } };
    const { deck: imported, notes } = importDeckText(deckCode(deck), catalog);
    expect(imported.main).toEqual({ "BP01-001": 2 });
    expect(notes).toEqual([{ kind: "unknownPrinting", printing: "BP99-001", count: 3 }]);
    const file = sample("sd03.json");
    expect(importDeckText(JSON.stringify(file), catalog)).toEqual({ deck: file, notes: [] });
  });
});

describe("importing a deck code of sve-server", () => {
  // The user's example (2026-09-30): a deck of its program, cards named in Chinese.
  const example = {
    DeckName: "血族",
    Craft: "血族",
    Cards: {
      绝叫的崇拜者: 1, "轮回统治者·泽勒尔": 1, "机锋的罪人·卡托司瑞德": 3, 猛毒之牙: 1, 凌虐囚房: 1, "罗刹的罪人·葛洛达特": 1, "蛇殿执行者·盖诺姆尔": 1,
      寒气死灵术师: 1, 悄然逼近的残酷: 1, "灵魂向导·艾米": 1, "友魂少女·露娜": 1, "终幕吸血鬼·尤里亚斯": 1, "奔放的狱炎·凯尔贝洛斯": 1, 骨之贵公子: 1,
      激愤的副总长: 1, 凶猛嚎叫: 1, 欲望的信徒: 1, 欲望之翼: 1, 血色圆舞曲: 1, 鲜血项链: 1, 欲望之吻: 1, 欲望的狂信者: 1, "绝叫沉默·鲁鲁纳伊": 1,
      "魔眼蛇神·梅杜莎": 1, "欲望绝杰·瓦娜蕾格": 1, 捕食灵魂: 1, 猛袭的特攻队长: 1, 利爪的一击: 1, 威迫的防卫队长: 1, 世界殒灭: 1, "芭伦·双生之念": 1,
      疯狂的刽子手: 1, 生命量产: 1, 轰: 1, 熔铁亲信: 1, "冲撞恶魔·戴莫尼亚": 1, "迸发的光明·阿波罗": 1, 业火魔犬: 1, 圆环看守: 1,
    },
    EvolveCards: {
      "机锋的罪人·卡托司瑞德": 2, "罗刹的罪人·葛洛达特": 1, "流转统治者·泽勒尔": 1, 绝叫的崇拜者: 1, "芭伦·双生之念": 1, 猛袭的特攻队长: 1,
      疯狂的刽子手: 1, "终幕吸血鬼·尤里亚斯": 1, "迸发的光明·阿波罗": 1,
    },
    Skin: "尤利亚斯",
    WinCount: 2,
    BattleCount: 2,
  };

  it("finds every card by its Chinese name, a similar one when the translation differs, and the leader by the skin", () => {
    const { deck, notes } = importDeckText(JSON.stringify(example), catalog);
    expect(deck.name).toBe("血族");
    expect(cardCount(deck.main)).toBe(41);
    expect(cardCount(deck.evolve)).toBe(10);
    // Each section's cards are of that section: evolved or advanced cards in the evolve deck (CR 6.1.1.3).
    for (const printing of Object.keys(deck.evolve)) {
      const def = catalog.printing(printing)!;
      expect(def.evolved || def.advanced, printing).toBeTruthy();
    }
    for (const printing of Object.keys(deck.main)) expect(catalog.printing(printing)!.evolved, printing).toBe(false);
    // "迸发的光明·阿波罗" is "飞驰的光明·阿波罗" in the card data: taken by the similar name, in both decks.
    expect(deck.main["BP16-118"]).toBe(1);
    expect(deck.evolve["BP16-119"]).toBe(1);
    expect(notes.filter((n) => n.kind === "similar")).toEqual([
      { kind: "similar", name: "迸发的光明·阿波罗", card: "BP16-118" },
      { kind: "similar", name: "迸发的光明·阿波罗", card: "BP16-119" },
    ]);
    expect(notes.filter((n) => n.kind === "unknownName")).toEqual([]);
    // "尤利亚斯" is "尤里亚斯" (Abysscraft), most of the deck's cards being Abysscraft.
    expect(catalog.printing(deck.leader!)!.names.cn).toBe("尤里亚斯");
    expect(catalog.printing(deck.leader!)!.class).toBe("Abysscraft");
    expect(notes).toContainEqual({ kind: "leaderBySkin", skin: "尤利亚斯", leader: catalog.printing(deck.leader!)!.id });
  });

  it("without a skin takes the first leader of the deck's class, names the cards it can't find, and skips the serializer's notes", () => {
    const { deck, notes } = importDeckText(
      JSON.stringify({ Craft: "法师", Cards: { $type: "System.Collections.Generic.Dictionary", 不存在的卡牌名字: 2, "轮回统治者·泽勒尔": 1, "终幕吸血鬼·尤里亚斯": 3 }, EvolveCards: {} }),
      catalog,
    );
    expect(deck.name).toBe("法师");
    expect(cardCount(deck.main)).toBe(4);
    expect(notes).toContainEqual({ kind: "unknownName", name: "不存在的卡牌名字", count: 2 });
    const leader = catalog.printing(deck.leader!)!;
    expect(leader.type).toBe("leader");
    expect(leader.class).toBe("Abysscraft");
    expect(notes).toContainEqual({ kind: "leaderByClass", className: "Abysscraft", leader: leader.id });
  });

  it("compares names without the marks translations write differently", () => {
    expect(nameKey("机锋的罪人·卡托司瑞德")).toBe(nameKey("机锋的罪人・卡托司瑞德"));
    expect(nameKey("Apollo, Heaven's Envoy")).toBe(nameKey("apollo heavens envoy"));
    expect(nameKey("ＡＢＣ　１")).toBe("abc1");
  });
});
