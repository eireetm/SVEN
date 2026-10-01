Shadowverse: Evolve NEXT  {{version}}
==============================

中文 / 日本語 / English


【中文】

这是什么
  《Shadowverse: Evolve》（影之诗：进化对决）的非官方对战模拟器，个人学习和测试用，不做商业用途。
  和官方（Cygames、Bushiroad）没有关系。不附带任何官方素材。

需要
  - Windows 10 / 11
  - Node.js 20 或更新的版本（推荐 24 LTS）：https://nodejs.org/
    国内下载慢时可以用镜像：https://npmmirror.com/mirrors/node/
  - 浏览器：Chrome 或 Edge

启动
  1. 解压到任意文件夹。
  2. 双击 start.bat：会打开一个黑色窗口，浏览器自动打开 http://127.0.0.1:5170/
  3. 玩的时候不要关黑色窗口，关掉它会退出。
  其他系统：在这个文件夹里运行  node server.mjs

能做的
  - 对战 AI：Bot-简单、Bot-中等、Bot-困难、Bot-困难 beta（困难和困难 beta 会作弊：看得到你的手牌和双方牌组）。
  - 构筑卡组、观看录像、设置（语言：English / 中文 / 日本語）。
  - 联机对战：双方都要用同一个版本（{{version}}）。一方"创建房间"，把房间号发给对方；连不上时用"手动连接"。

从旧版更新
  把这个版本里的 app 文件夹、server.mjs、start.bat、README.txt、VERSION.txt 复制到旧版的文件夹里，覆盖原来的。
  decks、replays、public 里你自己的文件和 settings.ini 不用动。

文件夹
  decks/     卡组文件（samples/ 里是示例卡组）
  replays/   保存的录像
  public/    你自己的图片、声音、字体，全部可选，放进去后刷新页面：
               images/cards/<卡号>.png         卡图（例如 BP01-001.png；双面卡的背面加 _back；卡号里的 Ⓢ 也可以写成 S）
               images/backs/default.png         卡背（evolve.png 是进化卡组的卡背）
               textures/board/field.png         场地（1586×992）
               textures/menu/background_m.png   主界面背景（background_d 组卡界面，background_f 对战）
               textures/icons/<图标名>.png      卡面文本里的图标
               audio/bgm/menu.mp3               背景音乐（menu、deck、battle）
               audio/sfx/                        通用音效
               audio/cards/<卡号>-p.mp3         每张卡的音效（-p 使用、-a 攻击、-d 被破坏）
               fonts/                            字体
  settings.ini  设置：第一次启动时生成，可以直接编辑（游戏关着时改，或者改完后刷新页面），说明在文件里
  app/       程序本身，不要改动

遇到问题
  - 打开后一片黑、或者显示"界面出错了"：对这个页面关掉网页翻译和浏览器插件，再刷新。
  - 其他问题：对局画面右上角"显示侧边栏" → "调试" → "保存复现包"，把文件发给作者。


【日本語】

これは何か
  『Shadowverse: Evolve』の非公式対戦シミュレーターです。個人の学習・テスト用で、商用目的ではありません。
  公式（Cygames、ブシロード）とは関係ありません。カード画像や公式の画像素材は含まれていません。

必要なもの
  - Windows 10 / 11
  - Node.js 20 以降（24 LTS 推奨）：https://nodejs.org/
  - ブラウザ：Chrome または Edge

起動
  1. 好きなフォルダに展開します。
  2. start.bat をダブルクリック：黒いウィンドウが開き、ブラウザで http://127.0.0.1:5170/ が開きます。
  3. 遊んでいる間は黒いウィンドウを閉じないでください。閉じると終了します。
  他の OS：このフォルダで  node server.mjs  を実行します。

できること
  - AI と対戦：Bot-かんたん、Bot-ふつう、Bot-むずかしい、Bot-むずかしい beta（むずかしいとむずかしい beta はずるをします：あなたの手札と両方のデッキが見えます）。
  - デッキ構築、リプレイ、設定（言語：English / 中文 / 日本語）。
  - オンライン対戦：お互いに同じバージョン（{{version}}）が必要です。片方が「ルームを作る」でルームコードを相手に送ります。
    つながらないときは「手動で接続」を使ってください。

古いバージョンからの更新
  このバージョンの app フォルダ、server.mjs、start.bat、README.txt、VERSION.txt を古いバージョンのフォルダにコピーして上書きします。
  decks、replays、public の自分のファイルと settings.ini はそのままで大丈夫です。

フォルダ
  decks/     デッキファイル（samples/ はサンプルデッキ）
  replays/   保存したリプレイ
  public/    自分の画像・音声・フォント（すべて任意。入れたらページを再読み込み）：
               images/cards/<カード番号>.png   カード画像（例：BP01-001.png。両面カードの裏面は _back。カード番号の Ⓢ は S でも可）
               images/backs/default.png         カードの裏面（evolve.png はエボルヴデッキの裏面）
               textures/board/field.png         プレイマット（1586×992）
               textures/menu/background_m.png   メニューの背景（background_d デッキ構築、background_f 対戦）
               textures/icons/<アイコン名>.png  カードテキストのアイコン
               audio/bgm/menu.mp3               BGM（menu、deck、battle）
               audio/sfx/                        効果音
               audio/cards/<カード番号>-p.mp3   カードごとの効果音（-p プレイ、-a 攻撃、-d 破壊）
               fonts/                            フォント
  settings.ini  設定：初回起動時に作られます。直接編集できます（ゲームを閉じているときに編集するか、編集後にページを再読み込み）。説明はファイルの中にあります
  app/       プログラム本体（変更しないでください）

困ったとき
  - 開いても真っ黒、または「画面でエラーが起きました」と出るとき：このページではページ翻訳とブラウザ拡張機能をオフにして、再読み込みしてください。
  - その他：対戦画面右上の「サイドバーを表示」→「デバッグ」→「不具合報告用に保存」で保存したファイルを作者に送ってください。


【English】

What this is
  An unofficial simulator of the card game Shadowverse: Evolve, for personal study and testing, not for commercial use.
  Not affiliated with Cygames or Bushiroad. No card images or official picture assets are included.

You need
  - Windows 10 / 11
  - Node.js 20 or newer (24 LTS recommended): https://nodejs.org/
  - Chrome or Edge

Start
  1. Unzip it anywhere.
  2. Double-click start.bat: a black window opens, and the browser opens http://127.0.0.1:5170/
  3. Keep the black window open while playing; closing it quits.
  Other systems: run  node server.mjs  in this folder.

What it does
  - Play against the AI: Bot-Easy, Bot-Medium, Bot-Hard, Bot-Hard beta (Hard and Hard beta cheat: they see your hand and both decks).
  - Build decks, watch replays, settings (language: English / 中文 / 日本語).
  - Online play: both players need the same version ({{version}}). One makes a room and sends the room code;
    if it can't connect, use "Connect by hand".

Updating from an older version
  Copy this version's app folder, server.mjs, start.bat, README.txt and VERSION.txt into the old version's folder, replacing theirs.
  Your own files in decks, replays and public, and settings.ini, stay as they are.

Folders
  decks/     deck files (samples/: sample decks)
  replays/   saved replays
  public/    your own images, sounds and fonts, all optional; reload the page after adding files:
               images/cards/<card number>.png   card images (e.g. BP01-001.png; a back face adds _back; a Ⓢ in the number may be a plain S)
               images/backs/default.png          the card back (evolve.png: the evolve deck's)
               textures/board/field.png          the playmat (1586×992)
               textures/menu/background_m.png    the menu background (background_d deck builder, background_f battle)
               textures/icons/<icon name>.png    icons in card text
               audio/bgm/menu.mp3                background music (menu, deck, battle)
               audio/sfx/                         sound effects
               audio/cards/<card number>-p.mp3   a card's own sounds (-p play, -a attack, -d destroyed)
               fonts/                             fonts
  settings.ini  the settings: made at the first start, and can be edited by hand (while the game is closed, or reload the page
             after saving it); the comments in it explain each one
  app/       the program itself; don't change it

Problems
  - A black page, or "The interface stopped working": turn off page translation and browser extensions for this page, then reload.
  - Anything else: in a game, "Show sidebar" (top right) → "Debug" → "Save a bug report file", and send the file to the author.
