# net/（联机对战）

- 连接：房间号经公共中转见面（`rooms.ts`）、手动交换连接码（`manual.ts`）、连接（`link.ts`）、消息（`messages.ts`）、检测网络（`check.ts`），用哪些公共服务在 `relays.ts`。
- 对局：双方各自运行同一份确定性的 Core，只互相发送"对决策的回答"（和录像里记录的输入相同），不同步整个局面。`online.ts` 负责准备（规则、卡组、种子）和转发：本机的回答从引擎后台线程（`localInput`）发给对方，对方的回答交给引擎（`remoteInput`），引擎按序号执行并核对局面指纹（`src/engine/game-host.ts`）。
- 状态在 `state.ts`（界面读它，不含连接代码）。
