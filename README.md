# SVE Core

《Shadowverse: Evolve》对战规则引擎（个人学习与 Bot 测试用途，不对外分发）。

当前阶段只有 Core：纯逻辑、确定性、可 headless 运行，不依赖任何 GUI / IO。

进度：BP01 全部卡牌已实现（209 个卡牌定义：187 个有脚本，22 个没有卡面文本无需脚本；异画共用脚本），见 [docs/card-status.md](docs/card-status.md)。

## 快速开始

需要 Node.js（已在 24.x 上验证）。

```bash
npm install          # 安装开发依赖（TypeScript、Vitest、tsx）
npm test             # 运行全部测试
npm run typecheck    # 类型检查（源码 / 测试 / 工具）
```

```ts
import { createEngine } from "@sve/core";
import { BP01_CARDS, BP01_SCRIPTS } from "@sve/core/sets/bp01";

const engine = createEngine({ cards: BP01_CARDS, scripts: BP01_SCRIPTS });
const game = engine.newGame({
  seed: 42,
  players: [deckA, deckB], // { leader?, main: 卡号[], evolve: 卡号[] }
  config: { deckRestrictions: false }, // 构筑限制开关
});
while (game.decision) game.act(chooseAnswer(game.decision));
```

## 常用命令

| 命令 | 作用 |
|---|---|
| `npm run build:cards` | 从 `../assets` 重新生成 `packages/core/data/BP01.json` |
| `npm run cards:status` | 生成 `docs/card-status.md`（每张卡的实现 / 测试状态） |
| `npm run scripts:index` | 重新生成 `src/script/BP01/index.ts`（卡牌脚本注册表） |
| `npm run card -- <卡号>` | 打印一张卡的全部信息：各语言文本、日文种族、相关卡、官方 QA、脚本状态 |
| `npm run rules:clauses` | 从 `../rules/*.pdf` 提取条款编号表 `docs/cr-clauses.json` |
| `npm run rules:index` | 生成「条款 → 代码 / 测试」对照表 `docs/rules-index.md` |

## 文档

- [docs/architecture.md](docs/architecture.md)：架构、执行模型、改规则时改哪里
- [docs/decisions/](docs/decisions/)：架构决策记录
- [docs/open-questions.md](docs/open-questions.md)：**待确认的规则问题**
- [docs/data-notes.md](docs/data-notes.md)：卡牌数据的差异与问题
- [docs/NOTE-card-scripts.md](docs/NOTE-card-scripts.md)：**写卡指南**（流程、API 速查、踩过的坑、快速测试），给参与写卡的 AI 看
- [docs/card-status.md](docs/card-status.md)、[docs/rules-index.md](docs/rules-index.md)：自动生成的状态表
