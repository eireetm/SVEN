# SVEN — Shadowverse: Evolve NEXT

**[中文](#中文) · [English](#english)**

---

<a id="中文"></a>

## 中文

《Shadowverse: Evolve》（影之诗：进化对决）实体卡牌游戏的非官方对战引擎、AI 和客户端。规则由引擎自动处理，可以对战 AI、和朋友联机、组卡、看录像，电脑和安卓手机都能玩。定位类似 Yu-Gi-Oh! 的 YGOPro，用于个人学习和测试。

### 内容

- **Core（规则引擎，`@sve/core`）**
  - 纯 TypeScript，结果确定，可以在没有界面的环境里运行，不依赖界面或文件。
  - 按综合规则（v1.26.1）逐条实现，规则判断都注明条款编号。
  - 支持 56 个卡包的 3,568 个卡牌定义，共 7,296 个印刷版本，异画共用同一个定义。
- **Bot（`@sve/bot`）**：贪心 Bot。每个决策都模拟所有候选回答并评估局面，只用 Core 的公开 API。
- **GUI（`@sve/gui`）**：Web 界面（Vite + React），引擎和 Bot 在 Web Worker 里运行。
  - 牌桌按场地图摆放，点击或拖拽操作，有动画、箭头和音效；
  - 组卡界面：筛选、异画、赛制和禁卡表、卡组码；
  - 录像、复现包（逐字节重现一局）、撤销 / 倒回、手动调试；
  - P2P 联机，不需要自己的服务器；
  - 界面和卡牌文本都可以切换中文、英文、日文；
  - 外观、声音、字体都可以换成自己的文件（见"自定义资源"）。
- **安卓版**：同一个界面装进安卓 WebView（Capacitor），手机横屏使用。

### 声明

- 这是非官方的同人项目，与 Cygames、Bushiroad 等官方无关，不做商业用途。
- 仓库**不包含任何卡图、官方美术或声音**。
- 卡牌数据（`packages/core/data/`）包含卡名和卡牌文本，有英文、中文、日文三种，中文多为民间翻译，用于规则处理和显示。
- 想看到卡图，请把自己的图片放进 `packages/gui/public/`（见"自定义资源"）。

### 环境

- Node.js 24.x 和 npm（使用 npm workspaces）。
- 端到端测试使用本机安装的 Chrome，Playwright 不另外下载浏览器。
- 打安卓 APK 需要 Android Studio（自带 JDK 和 SDK）。

### 快速开始

```bash
npm install
npm run dev:gui
```

- `npm run dev:gui` 启动开发服务器，并自动打开 http://localhost:5173 。
- 页面打开就是主界面。引擎在后台加载几秒，加载完"对战 AI"才能点。
- 开发服务器只监听本机，改了界面代码，页面会自动刷新。端口被占用时换下一个，也可以用 `SVE_GUI_PORT` 指定。

### 常用命令

在仓库根目录执行：

| 命令 | 作用 |
|---|---|
| `npm run dev:gui` | 启动 GUI 开发服务器并打开浏览器 |
| `npm run build:gui` | GUI 的生产构建（`packages/gui/dist/`），用 `npm run preview -w @sve/gui` 查看 |
| `npm test` | 全部单元测试（Vitest：Core、Bot、GUI、工具） |
| `npm run typecheck` | 类型检查（源码、测试、工具） |
| `npm run test:gui` | GUI 的端到端测试（Playwright） |
| `npm run android:apk` | 打安卓 APK（见"安卓版"） |
| `npm run card -- <卡号>` | 查一张卡：各语言文本、日文类型、相关卡、官方 QA、脚本状态 |
| `npm run bench` | 性能基准：随机对局、复制和抽样一局、Bot 每个决策的耗时 |
| `npm run build:cards` | 从抓取的卡牌数据（仓库旁边的 `assets/`）重新生成 `packages/core/data/*.json` |
| `npm run scripts:index` | 新增卡牌脚本后，重新生成脚本注册表（`packages/core/src/script/<卡包>/index.ts`） |
| `npm run cards:status` | 生成每张卡的实现和测试状态表（写到 `docs/card-status*.md`） |
| `npm run rules:clauses` | 从综合规则的 PDF（仓库旁边的 `rules/`）提取条款编号表 `tools/data/cr-clauses.json` |
| `npm run rules:index` | 生成"条款 → 代码 / 测试"对照表（写到 `docs/rules-index.md`） |

环境变量：

| 变量 | 作用 |
|---|---|
| `SVE_ASSETS_DIR` | 本机素材文件夹（卡图、`Misc/`），默认是仓库旁边的 `assets/` |
| `SVE_GUI_PORT` | 开发服务器的端口，默认 5173 |
| `SVE_E2E_PORT` | 端到端测试的端口，默认 5199 |
| `SVE_E2E_CHANNEL` | 端到端测试用的浏览器，默认 `chrome`，也可以是 `msedge` |
| `SVE_E2E_HEADED=1` | 端到端测试时显示浏览器窗口 |
| `SVE_MONKEY_GAMES=18` | 端到端测试里随机乱点，多打几局 |
| `SVE_E2E_ONLINE=1` | 端到端测试里也测经过公共中转的联机（需要外网） |
| `BOT_GAMES=200` | Bot 的长时间对局测试（`npx vitest run packages/bot`） |

### 目录结构

```
packages/
  core/                 规则引擎（@sve/core）
    src/
      model/            数据类型：游戏状态、卡牌定义、决策和回答
      data/             卡牌 JSON → 卡牌定义（规范化、异画合并、卡牌数据库）
      engine/           规则引擎：flow/（回合流程）、abilities/（能力）、actions/（第 5 章的动作）、
                        state/（区域、数值）、effects/（给卡牌脚本用的接口）、runtime/（执行框架）
      script/           卡牌脚本：script/<卡包>/<卡号>.ts，一个卡牌定义一个文件
      events/ view/     对外事件；按玩家视角过滤隐藏信息
      sets/             各卡包的卡牌数据和脚本注册表
      testing/          测试工具（对局脚本、随机 agent、不变量检查）
    data/               卡牌数据（<卡包>.json，由 build:cards 生成，不要手改）
    test/               规则测试、卡牌测试、整局测试
  bot/                  Bot（@sve/bot），只用 Core 的公开 API
  gui/                  界面（@sve/gui）
    index.html
    vite.config.ts
    host/               本机服务层（Node，Vite 插件）：卡图、自定义资源、卡组文件、录像的 /api/*
    src/
      app/              主界面、设置、应用状态、卡池目录
      engine/           后台线程（引擎和 Bot）、消息协议
      game/             对局画面：牌桌、动画、卡牌、决策窗口、日志、调试
      decks/            组卡界面、卡组文件格式、卡组码、文本编辑器
      formats/          赛制和禁卡表
      net/ online/      联机
      replays/          录像
      resources/        自定义资源的查找、主题、音效
      host/             文件的读写：电脑上调用本机服务层，安卓上读写手机里的文件
      i18n/             界面文字（英文、中文、日文）
      styles/           内置样式
    public/             玩家的自定义资源（只有空文件夹进仓库）
    decks/samples/      示例卡组
    replays/            保存的录像（不进仓库）
    restrictions/       禁卡表，一个文件一张（格式见其中的 README.md）
    android/            安卓工程（Capacitor）
    scripts/            打安卓 APK、生成示例卡组
    test/               单元测试（随 npm test 运行）
    tests/e2e/          端到端测试（Playwright）
tools/                  卡牌数据构建、查卡、条款提取和核对、卡牌状态、性能基准
```

依赖方向：`gui` → `bot` → `core`。Core 不知道界面和 Bot 的存在。

### 自定义资源

游戏的外观和声音都可以用自己的文件替换或补充，不用改代码。

**查找顺序**，先找到的优先：
1. `packages/gui/public/` 里你自己的文件；
2. 本机素材文件夹：默认是仓库旁边的 `assets/`，`SVE_ASSETS_DIR` 可改。
   - 卡图是 `<卡号>/<卡号>.webp`，双面卡的背面是 `<卡号>_back.webp`；
   - `Misc/` 里放场地、卡背等图片（见本节最后）；
3. 内置的样子（纯色和文字）。声音没有内置的，没有文件就不响。

**规则**：
- 文件名（不含扩展名）要完全一致，区分大小写。
  - 图片可以是 `png`、`jpg`、`jpeg`、`webp`、`gif`、`avif`；
  - 声音可以是 `mp3`、`ogg`、`wav`、`m4a`；
  - 都按这个顺序找，同名的只用第一个。
- 界面启动时读一次文件清单。放进新文件后刷新页面；图片有缓存时按 Ctrl+F5。
- 按卡查找的资源，先找印刷编号（如 `BP01-SL01`，每个异画各有一个），再找卡牌定义编号（如 `BP01-001`）。给本体放一个文件，所有异画都会用它。

**图片**（下表的路径都在 `public/` 下，省略扩展名）

| 文件 | 用途 |
|---|---|
| `images/cards/<编号>` | 卡图；双面卡的背面是 `images/cards/<编号>_back` |
| `images/cards/unknown` | 卡图缺失时的替代图（上面会写出卡名） |
| `images/backs/default` | 主卡组的卡背（牌组、背面朝上的卡、对手的手牌） |
| `images/backs/evolve` | 进化牌组的卡背（没有时用主卡组的卡背） |
| `textures/board/field` | 一方的场地，对手的是同一张图旋转 180°。牌桌按原图（1586×992）上的格子摆卡，换图时要保持同样的尺寸和格子位置 |
| `textures/menu/background_m` | 主界面的背景（设置、开局页也用） |
| `textures/menu/background_d` | 组卡界面的背景（没有时用主界面的） |
| `textures/menu/background_f` | 对局画面的背景 |
| `textures/icons/<图标名>` | 卡牌文本里的图标（见下） |

图标名：`fanfare`、`lastwords`、`act`、`evolve`、`engage`、`quick`、`q`、`ub`、`feed`、`ride`、`adv`、`cost00` … `cost10`、`costX`、`attack`、`defense`、`forestcraft`、`swordcraft`、`runecraft`、`dragoncraft`、`abysscraft`、`havencraft`。

**声音**（音量在设置页调）

| 文件 | 什么时候放 |
|---|---|
| `audio/bgm/menu`、`audio/bgm/deck`、`audio/bgm/battle` | 背景音乐：主界面、组卡界面、对局中。循环播放，换界面时淡入淡出 |
| `audio/sfx/<名字>` | 通用音效，名字见下表 |
| `audio/cards/<编号>-p` | 这张卡被使用时（所有卡都可以有） |
| `audio/cards/<编号>-a` | 这只随从攻击时 |
| `audio/cards/<编号>-d` | 这只随从被破坏时 |

通用音效（26 个）：

| 名字 | 什么时候响 |
|---|---|
| `draw` | 抽牌 |
| `spell`、`follower`、`amulet` | 使用法术、随从、护符（没有时用 `play`） |
| `play` | 以上三种共用的后备 |
| `attack` | 随从攻击 |
| `damage`、`leader-damage` | 随从、主战者受到伤害（主战者的没有时用 `damage`） |
| `destroy` | 破坏 |
| `evolve`、`super-evolve` | 进化、超进化（超进化的没有时用 `evolve`） |
| `heal` | 回复 |
| `buff` | 获得攻击力、生命值 |
| `target` | 效果选择了卡 |
| `token` | 生成衍生物 |
| `banish` | 消失 |
| `discard` | 舍弃 |
| `bounce` | 回到手牌 |
| `counter` | 放置或取除指示物 |
| `shuffle` | 洗切牌组 |
| `turn` | 回合开始 |
| `quick` | 快速提示弹出 |
| `game-start` | 对局开始 |
| `win`、`lose` | 胜、负 |
| `click` | 界面点击 |

- 一张卡有自己的音效时，就不放对应的通用音效：`-p` 代替 `spell` / `follower` / `amulet`，`-a` 代替 `attack`，`-d` 代替 `destroy`。
- 进化后的随从，先找进化卡的编号，再找原来那张卡的编号。

**字体和样式**
- `fonts/<任意名>`：字体文件，在 `theme.css` 里用 `@font-face` 引用。
- `theme.css`：在内置样式之后加载，可以覆盖任何颜色、大小和字体。界面元素的类名都以 `sve-` 开头。例如：

```css
:root {
  --sve-ui-alpha: 0.88;       /* 面板、窗口、按钮的不透明度（1 为完全不透明） */
  --sve-area-alpha: 0.25;     /* 组卡界面的卡组区和卡池 */
  --sve-background-dim: 0.2;  /* 背景图压暗的程度（0 为不压暗） */
  --sve-accent: #f0b429;      /* 强调色 */
  --sve-card-base: 96px;      /* 牌桌以外的卡牌大小 */
  font-family: "My Font", sans-serif;
}
@font-face {
  font-family: "My Font";
  src: url("/fonts/MyFont.woff2") format("woff2");
}
```

**本机素材文件夹的 `Misc/`**（都可以不放）：

| 文件 | 用途 |
|---|---|
| `field.png` | 场地 |
| `back.png` | 主卡组的卡背 |
| `back_e.png` | 进化牌组的卡背 |
| `unknown.png` | 缺图时的替代图 |
| `background_m`、`background_d`、`background_f` | 三张背景图 |

`public/` 里有同用途的文件时，用 `public/` 的。

### 卡组

- **卡组文件**：`packages/gui/decks/<名字>.json`，也可以放在子文件夹里，`samples/` 里是示例卡组。

```json
{ "format": "sve-deck", "version": 1, "name": "My deck", "leader": "SD01-LD01",
  "main": { "SD01-011": 3 }, "evolve": { "SD01-004": 2 }, "notes": "备注" }
```

  - 键是印刷编号，异画用哪个编号都可以。
  - 双职业的卡组多一个 `leader2`。
- **组卡界面**：主菜单"构筑卡组"。
  - 点击或拖拽加入，右键或拖回卡池移除。
  - "文本编辑"用文字编辑卡组（每行一张，如 `3 SD01-011`）。
- **卡组码**：组卡界面的"卡组码…"。
  - 把卡组变成一行文字（`SVE1-…`）分享，粘贴就能导入；
  - 也能导入 sve-server（另一个模拟器）的卡组码，按卡名找卡。
- **赛制和禁卡表**：
  - 赛制有标准、双职业（综合规则附录 B-2）、无限制；
  - 禁卡表在 `packages/gui/restrictions/`，每张一个文件；
  - 组卡时只提醒不符合的地方，开局时不符合就不能开始。

### 联机

主菜单"联机对战"，不需要自己的服务器。
- **房间号**：一方创建房间，把 6 位房间号发给对方。双方借用公共的免费服务（Nostr、MQTT、BitTorrent）找到对方，然后用 WebRTC 直连。
- **手动连接**：房间号连不上时，双方互相发送连接码（`SVE1-O-…` / `SVE1-A-…`）。
- **连不上时**：可以在设置里填自己的 TURN 中转；"检测网络"会显示这台电脑的网络情况。
- **版本**：两边的程序要是同一个版本（卡牌、规则代码、禁卡表的指纹都相同）才能开始。
- **对局**：双方各自运行同一局，只同步每一步的回答。断线后可以重连，接着打。

### 录像和复现包

- **录像**：对局结束后点"保存录像"，存在 `packages/gui/replays/`（不进仓库）；主菜单"观看录像"播放。
- **复现包**：调试页"保存复现包"，里面是种子、双方卡组和全部回答，能逐字节重现一局，报告问题时附上它。开局页"高级"里可以载入。

### 安卓版

- **构建**：装好 Android Studio 后运行 `npm run android:apk`，得到调试版 APK `packages/gui/android/app/build/outputs/apk/debug/app-debug.apk`。
  - 脚本使用 Android Studio 自带的 JDK（`JAVA_HOME` 可改）；SDK 默认在 `%LOCALAPPDATA%\Android\Sdk`（`ANDROID_HOME` 可改）。
  - 第一次构建会自动下载 Gradle 和需要的 SDK。
- **发行版**：`npm run android:apk -- --release --public <资源文件夹> --out <APK 路径>`
  - `--release`：用发行版密钥签名。
    - 密钥写在仓库外的一个 properties 文件里：`storeFile`（相对这个文件）、`storePassword`、`keyAlias`、`keyPassword`。
    - 用 `--signing <文件>` 指定，默认是仓库旁边的 `SVE-signing/keystore.properties`。
  - `--public <文件夹>`：把这个文件夹里的资源打包进 App（手机上同名的文件优先）。
  - `--out <文件>`：打好后把 APK 拷到那里。
- **手机上的文件**：都在 `Android/data/local.sve.next/files/` 下。
  - `public/`：资源，用数据线拷进去，或者在设置页导入 zip；
  - `decks/`、`replays/`：卡组和录像；
  - `exports/`：导出的文件，导出后会弹出分享菜单。
- **要求**：安卓 7 以上，系统 WebView 103 以上；更旧时显示一个说明页。
- **小屏排版**：
  - 左栏变成抽屉，用按钮或长按卡牌打开；
  - 组卡分成"卡组"和"卡池"两页；
  - 返回键先关掉打开的东西。

### 在代码里使用 Core

```ts
import { createEngine } from "@sve/core";
import { ALL_CARDS, ALL_SCRIPTS } from "@sve/core/sets";

const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
const game = engine.newGame({
  seed: 42,
  players: [deckA, deckB], // { leader?, main: 印刷编号[], evolve: 印刷编号[] }
  config: { deckRestrictions: false },
});
while (game.decision) game.act(chooseAnswer(game.decision));
```

引擎是确定的：种子、卡组和每一步的回答都相同，就得到完全相同的一局。

---

<a id="english"></a>

## English

An unofficial rules engine, AI and client for the *Shadowverse: Evolve* trading card game. The engine applies the rules, so you can play against the AI, play online with friends, build decks and watch replays, on a computer or an Android phone. It is meant for personal study and testing, in the spirit of YGOPro for Yu-Gi-Oh!.

### What's inside

- **Core (the rules engine, `@sve/core`)**
  - Plain TypeScript and deterministic. It runs headless, with no dependency on a UI or on files.
  - It implements the Comprehensive Rules (v1.26.1) clause by clause, and every rules decision cites its clause number.
  - It supports 3,568 card definitions from 56 sets, 7,296 printings in all; alternate arts share one definition.
- **Bot (`@sve/bot`)**: a greedy bot. For each decision it simulates every candidate answer and scores the result, using only the Core's public API.
- **GUI (`@sve/gui`)**: a web interface (Vite + React). The engine and the bots run in a Web Worker.
  - A table laid out on the playmat picture, played by clicking and dragging, with animations, arrows and sounds.
  - A deck builder with filters, alternate arts, formats and restriction lists, and deck codes.
  - Replays, bug report files that replay a game exactly, undo and rewind, and manual debugging.
  - Peer-to-peer online play with no server of its own.
  - The interface and the card text can each be English, Chinese or Japanese.
  - Pictures, sounds and fonts can be replaced with your own files (see "Custom resources").
- **Android app**: the same interface in the Android WebView (Capacitor), played with the phone held sideways.

### Disclaimer

- This is an unofficial fan project. It is not affiliated with Cygames, Bushiroad or any other rights holder, and it is not for commercial use.
- The repository contains **no card images, official artwork or sounds**.
- The card data (`packages/core/data/`) holds card names and card text in English, Chinese and Japanese, used to apply the rules and to show the cards. Most of the Chinese text is a fan translation.
- To see card images, put your own pictures in `packages/gui/public/` (see "Custom resources").

### Requirements

- Node.js 24.x and npm (the repository uses npm workspaces).
- The end-to-end tests use the Chrome installed on the machine; Playwright downloads no browser.
- Building the Android APK needs Android Studio, which brings its own JDK and SDK.

### Getting started

```bash
npm install
npm run dev:gui
```

- `npm run dev:gui` starts the dev server and opens http://localhost:5173.
- The page opens on the main menu. The engine loads in the background for a few seconds; "Play vs AI" becomes available when it is ready.
- The dev server listens on this machine only and reloads the page when the interface code changes. If the port is taken it uses the next one; set `SVE_GUI_PORT` to choose it.

### Commands

Run these at the repository root:

| Command | What it does |
|---|---|
| `npm run dev:gui` | Start the GUI dev server and open the browser |
| `npm run build:gui` | Production build of the GUI (`packages/gui/dist/`); view it with `npm run preview -w @sve/gui` |
| `npm test` | All unit tests (Vitest: Core, Bot, GUI, tools) |
| `npm run typecheck` | Type-check sources, tests and tools |
| `npm run test:gui` | The GUI's end-to-end tests (Playwright) |
| `npm run android:apk` | Build the Android APK (see "Android app") |
| `npm run card -- <card number>` | Show a card: its text in each language, Japanese traits, related cards, official Q&A, script status |
| `npm run bench` | Benchmarks: random games, copying and sampling a game, the bot's time per decision |
| `npm run build:cards` | Rebuild `packages/core/data/*.json` from the scraped card data (the `assets/` folder next to the repository) |
| `npm run scripts:index` | Regenerate the card script registries (`packages/core/src/script/<set>/index.ts`) after adding scripts |
| `npm run cards:status` | Write each card's implementation and test status (to `docs/card-status*.md`) |
| `npm run rules:clauses` | Extract the clause table `tools/data/cr-clauses.json` from the Comprehensive Rules PDF (the `rules/` folder next to the repository) |
| `npm run rules:index` | Write the "clause → code / tests" index (to `docs/rules-index.md`) |

Environment variables:

| Variable | What it does |
|---|---|
| `SVE_ASSETS_DIR` | The local assets folder (card images, `Misc/`); by default `assets/` next to the repository |
| `SVE_GUI_PORT` | The dev server's port (5173 by default) |
| `SVE_E2E_PORT` | The end-to-end tests' port (5199 by default) |
| `SVE_E2E_CHANNEL` | The browser for the end-to-end tests: `chrome` by default, or `msedge` |
| `SVE_E2E_HEADED=1` | Show the browser window during the end-to-end tests |
| `SVE_MONKEY_GAMES=18` | Play more games at random in the end-to-end tests |
| `SVE_E2E_ONLINE=1` | Also test online play through the public relays (needs the internet) |
| `BOT_GAMES=200` | The bot's long test run (`npx vitest run packages/bot`) |

### Layout

```
packages/
  core/                 the rules engine (@sve/core)
    src/
      model/            data types: game state, card definitions, decisions and answers
      data/             card JSON → card definitions (normalizing, merging alternate arts, the card database)
      engine/           the engine: flow/ (turn structure), abilities/, actions/ (chapter 5 actions),
                        state/ (zones, values), effects/ (the API for card scripts), runtime/
      script/           card scripts: script/<set>/<card>.ts, one file per card definition
      events/ view/     events for the outside; hiding what a player can't see
      sets/             each set's card data and script registry
      testing/          test tools (game scripts, random agents, invariant checks)
    data/               card data (<set>.json, generated by build:cards: don't edit by hand)
    test/               rules tests, card tests, whole-game tests
  bot/                  the bot (@sve/bot), on the Core's public API only
  gui/                  the interface (@sve/gui)
    index.html
    vite.config.ts
    host/               the local service (Node, a Vite plugin): /api/* for card images, custom resources, decks, replays
    src/
      app/              main menu, settings, app state, card catalog
      engine/           the background thread (engine and bots), the message protocol
      game/             the game screen: table, animations, cards, decision window, log, debug
      decks/            deck builder, deck file format, deck codes, text editor
      formats/          formats and restriction lists
      net/ online/      online play
      replays/          replays
      resources/        finding custom resources, the theme, sounds
      host/             file access: the local service on a computer, the phone's files on Android
      i18n/             interface text (English, Chinese, Japanese)
      styles/           built-in style
    public/             your own resources (only the empty folders are in the repository)
    decks/samples/      sample decks
    replays/            saved replays (not in the repository)
    restrictions/       restriction lists, one file each (format in its README.md)
    android/            the Android project (Capacitor)
    scripts/            building the Android APK, generating the sample decks
    test/               unit tests (run by npm test)
    tests/e2e/          end-to-end tests (Playwright)
tools/                  building card data, card lookup, rules clauses and citation checks, card status, benchmarks
```

Dependencies go one way: `gui` → `bot` → `core`. The Core knows nothing about the interface or the bots.

### Custom resources

The game's look and sound can be replaced or extended with your own files, with no code change.

**Where things are looked for**, first found wins:
1. Your own files in `packages/gui/public/`.
2. The local assets folder: by default `assets/` next to the repository, or set `SVE_ASSETS_DIR`.
   - Card images are `<card>/<card>.webp`, and the back of a double-faced card is `<card>_back.webp`.
   - `Misc/` holds the playmat, card backs and other pictures (see the end of this section).
3. The built-in look (plain colors and text). There are no built-in sounds: without a file, nothing plays.

**Rules**:
- The file name without its extension must match exactly, case included.
  - Pictures can be `png`, `jpg`, `jpeg`, `webp`, `gif` or `avif`.
  - Sounds can be `mp3`, `ogg`, `wav` or `m4a`.
  - They are tried in that order, and only the first match is used.
- The interface reads the list of files once when it starts. After adding files, reload the page, with Ctrl+F5 if pictures are cached.
- Per-card resources are looked up by printing number first (e.g. `BP01-SL01`; each alternate art has its own), then by card definition number (e.g. `BP01-001`). One file for the base card serves all its alternate arts.

**Pictures** (paths under `public/`, extension left out)

| File | What it is |
|---|---|
| `images/cards/<number>` | A card image; the back of a double-faced card is `images/cards/<number>_back` |
| `images/cards/unknown` | Shown when a card image is missing (with the card name written on it) |
| `images/backs/default` | The main deck's card back (the deck, face-down cards, the opponent's hand) |
| `images/backs/evolve` | The evolve deck's card back (the main deck's back when missing) |
| `textures/board/field` | One side's playmat; the opponent's is the same picture turned 180°. Cards sit on the slots drawn on the original (1586×992), so a new picture must keep that size and those slots |
| `textures/menu/background_m` | The main menu's background (also settings and game setup) |
| `textures/menu/background_d` | The deck builder's background (the main menu's when missing) |
| `textures/menu/background_f` | The game screen's background |
| `textures/icons/<icon>` | Icons in card text (see below) |

Icon names: `fanfare`, `lastwords`, `act`, `evolve`, `engage`, `quick`, `q`, `ub`, `feed`, `ride`, `adv`, `cost00` … `cost10`, `costX`, `attack`, `defense`, `forestcraft`, `swordcraft`, `runecraft`, `dragoncraft`, `abysscraft`, `havencraft`.

**Sounds** (volume in the settings)

| File | When it plays |
|---|---|
| `audio/bgm/menu`, `audio/bgm/deck`, `audio/bgm/battle` | Music: main menu, deck builder, in a game. Loops, and fades between screens |
| `audio/sfx/<name>` | Sound effects, names below |
| `audio/cards/<number>-p` | When this card is played (any card) |
| `audio/cards/<number>-a` | When this follower attacks |
| `audio/cards/<number>-d` | When this follower is destroyed |

Sound effects (26):

| Name | When it plays |
|---|---|
| `draw` | Drawing |
| `spell`, `follower`, `amulet` | Playing a spell, follower or amulet (`play` when missing) |
| `play` | The fallback for those three |
| `attack` | A follower attacks |
| `damage`, `leader-damage` | A follower or a leader takes damage (`damage` when the leader's is missing) |
| `destroy` | A card is destroyed |
| `evolve`, `super-evolve` | Evolving, super-evolving (`evolve` when the latter is missing) |
| `heal` | Healing |
| `buff` | Gaining attack or defense |
| `target` | An effect selects a card |
| `token` | A token is created |
| `banish` | Banishing |
| `discard` | Discarding |
| `bounce` | Returning to the hand |
| `counter` | Putting or removing counters |
| `shuffle` | Shuffling the deck |
| `turn` | A turn starts |
| `quick` | The Quick announcement appears |
| `game-start` | The game starts |
| `win`, `lose` | Winning, losing |
| `click` | Clicking in the interface |

- A card's own sound replaces the matching effect: `-p` replaces `spell` / `follower` / `amulet`, `-a` replaces `attack`, `-d` replaces `destroy`.
- An evolved follower looks for its evolved card's number first, then the original card's.

**Fonts and style**
- `fonts/<any name>`: font files, referenced from `theme.css` with `@font-face`.
- `theme.css`: loaded after the built-in style, so it can override any color, size or font. Every element of the interface has a class starting with `sve-`. For example:

```css
:root {
  --sve-ui-alpha: 0.88;       /* opacity of panels, windows, buttons (1 = opaque) */
  --sve-area-alpha: 0.25;     /* the deck builder's card areas */
  --sve-background-dim: 0.2;  /* how much the background pictures are darkened (0 = not at all) */
  --sve-accent: #f0b429;      /* accent color */
  --sve-card-base: 96px;      /* card size outside the table */
  font-family: "My Font", sans-serif;
}
@font-face {
  font-family: "My Font";
  src: url("/fonts/MyFont.woff2") format("woff2");
}
```

**`Misc/` in the local assets folder** (all optional):

| File | What it is |
|---|---|
| `field.png` | The playmat |
| `back.png` | The main deck's card back |
| `back_e.png` | The evolve deck's card back |
| `unknown.png` | Shown when a picture is missing |
| `background_m`, `background_d`, `background_f` | The three backgrounds |

A file in `public/` with the same purpose wins.

### Decks

- **Deck files**: `packages/gui/decks/<name>.json`, also in sub-folders. `samples/` holds the sample decks.

```json
{ "format": "sve-deck", "version": 1, "name": "My deck", "leader": "SD01-LD01",
  "main": { "SD01-011": 3 }, "evolve": { "SD01-004": 2 }, "notes": "notes" }
```

  - Keys are printing numbers; any printing of an alternate art will do.
  - A Cross Craft deck has a `leader2` as well.
- **Deck builder**: "Build decks" on the main menu.
  - Click or drag a card to add it; right-click it or drag it back to the pool to remove it.
  - "Edit as text" edits the deck as text, one card per line (e.g. `3 SD01-011`).
- **Deck codes**: "Deck code…" in the deck builder.
  - It turns a deck into one line of text (`SVE1-…`) to share; paste a code to import the deck.
  - It also imports deck codes of sve-server (another simulator), finding the cards by name.
- **Formats and restriction lists**:
  - The formats are Standard, Cross Craft (Comprehensive Rules Appendix B-2) and Unlimited.
  - The restriction lists are in `packages/gui/restrictions/`, one file each.
  - The deck builder only points out what a deck doesn't meet; a game can't start with such a deck.

### Online play

"Online play" on the main menu, with no server of its own.
- **Room code**: one player creates a room and sends the 6-letter code to the other. Both find each other through free public services (Nostr, MQTT, BitTorrent), then connect directly with WebRTC.
- **Manual connection**: when a room code doesn't connect, the players exchange connection codes (`SVE1-O-…` / `SVE1-A-…`).
- **If you can't connect**: set your own TURN relay in the settings; "Check the network" shows what this computer can reach.
- **Versions**: both programs must be the same version (cards, rules code and restriction lists have the same fingerprints) to start a game.
- **The game**: each program runs the same game and only the answers are exchanged. After a lost connection, reconnect and play on.

### Replays and bug report files

- **Replays**: "Save replay" after a game stores it in `packages/gui/replays/` (not in the repository); "Watch replays" on the main menu plays it.
- **Bug report files**: "Save a bug report file" on the debug tab stores the seed, both decks and every answer, enough to replay the game exactly. Attach it when reporting a problem; "Advanced (testing)" on the game setup page loads it.

### Android app

- **Build**: with Android Studio installed, `npm run android:apk` makes a debug APK at `packages/gui/android/app/build/outputs/apk/debug/app-debug.apk`.
  - The script uses Android Studio's JDK (or `JAVA_HOME`), and the SDK in `%LOCALAPPDATA%\Android\Sdk` (or `ANDROID_HOME`).
  - The first build downloads Gradle and the SDK parts it needs.
- **Release**: `npm run android:apk -- --release --public <resource folder> --out <APK path>`
  - `--release`: signs with the release key.
    - The key is described in a properties file kept outside the repository: `storeFile` (relative to that file), `storePassword`, `keyAlias`, `keyPassword`.
    - Pass it with `--signing <file>`; by default it is `SVE-signing/keystore.properties` next to the repository.
  - `--public <folder>`: builds that folder's resources into the app (files on the phone with the same name win).
  - `--out <file>`: copies the APK there.
- **Files on the phone**: all under `Android/data/local.sve.next/files/`.
  - `public/`: resources, copied over USB or imported from a zip in the settings.
  - `decks/`, `replays/`: decks and replays.
  - `exports/`: exported files, handed to the share menu.
- **Requirements**: Android 7 or later, with a system WebView of version 103 or later. An older WebView shows a page that says so.
- **Small screens**:
  - The left column becomes a drawer, opened by its button or a long press on a card.
  - The deck builder has a "Deck" tab and a "Card pool" tab.
  - The back button first closes whatever is open.

### Using the Core in code

```ts
import { createEngine } from "@sve/core";
import { ALL_CARDS, ALL_SCRIPTS } from "@sve/core/sets";

const engine = createEngine({ cards: ALL_CARDS, scripts: ALL_SCRIPTS });
const game = engine.newGame({
  seed: 42,
  players: [deckA, deckB], // { leader?, main: printing numbers[], evolve: printing numbers[] }
  config: { deckRestrictions: false },
});
while (game.decision) game.act(chooseAnswer(game.decision));
```

The engine is deterministic: the same seed, decks and answers give exactly the same game.
