// Counter names (CR 15.1). The Core names a counter kind by an id ("fable"); the names here are the card texts' own:
// English as the English card texts write them, Chinese from the Chinese card texts ("童话指示物"), Japanese from the
// Japanese ones ("童話カウンター"). Stack counters are the rules' own (CR 13.3.2). New sets bring new counters:
// test/i18n.test.ts lists any counter kind of the card scripts missing here.
import type { UiLang } from "../app/settings";

export const COUNTER_NAMES: Readonly<Record<string, Readonly<Record<UiLang, string>>>> = {
  stack: { en: "Stack", zh: "蓄积", ja: "スタック" },
  arrow: { en: "Arrow", zh: "箭矢", ja: "矢" },
  battery: { en: "Battery", zh: "电池", ja: "バッテリー" },
  bunclie: { en: "Bunclie", zh: "卡班君", ja: "かばばん君" },
  calamity: { en: "Calamity", zh: "灾祸", ja: "災い" },
  curse: { en: "Curse", zh: "诅咒", ja: "呪い" },
  divineWater: { en: "Divine water", zh: "神汤", ja: "神湯" },
  dormancy: { en: "Dormancy", zh: "休眠", ja: "休眠" },
  fable: { en: "Fable", zh: "童话", ja: "童話" },
  fightingSpirit: { en: "Spirit", zh: "战意", ja: "戦意" },
  fusion: { en: "Fusion", zh: "融合", ja: "融合" },
  gigabyte: { en: "Gigabyte", zh: "千兆", ja: "ギガ" },
  grace: { en: "Grace", zh: "恩宠", ja: "恩寵" },
  lightning: { en: "Lightning", zh: "雷", ja: "雷" },
  mana: { en: "Mana", zh: "魔力", ja: "魔力" },
  pain: { en: "Pain", zh: "凌虐", ja: "加虐" },
  passion: { en: "Passion", zh: "情热", ja: "情熱" },
  prayer: { en: "Prayer", zh: "祈祷", ja: "祈り" },
  reversal: { en: "Reversal", zh: "归还", ja: "返戻" },
  seasonal: { en: "Seasonal", zh: "四季", ja: "四季" },
  soul: { en: "Soul", zh: "魂", ja: "魂" },
  spell: { en: "Spell", zh: "法术", ja: "スペル" },
};

/** A counter's name in the interface language (its id when it isn't listed). */
export function counterName(kind: string, lang: UiLang): string {
  return COUNTER_NAMES[kind]?.[lang] ?? kind;
}
