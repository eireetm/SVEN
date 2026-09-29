# net/（联机对战）

说明见 `docs/online.md`。

- 第 1 步（已完成）：连接——房间号经公共中转见面（`rooms.ts`）、手动交换连接码（`manual.ts`）、连接（`link.ts`）、消息（`messages.ts`）、状态（`online.ts`）、检测网络（`check.ts`），用哪些公共服务在 `relays.ts`。
- 第 2 步（下一步）：通过连接进行对局。双方各自运行同一份确定性的 Core，只互相发送"对决策的回答"（和录像里记录的输入相同），不同步整个局面；对手的回答经 `src/engine/client.ts` 交给引擎后台线程，和本地的回答走同一条路。
