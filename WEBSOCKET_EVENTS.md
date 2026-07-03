# Petoria WebSocket Events Reference

Backend: NestJS WsAdapter (`ws` library) — port 3007 (mapped to 4001 externally via Docker)  
Frontend: Browser-native `WebSocket` API — URI from `NEXT_PUBLIC_API_WS`

---

## Connection

### URL format
```
ws://host:port?token=<JWT>
```
The `?token=` query param is read by `handleConnection` in `SocketGateway` as a fallback when the `accessToken` cookie is absent (browser WebSocket cannot set custom headers).

### On connect — server emits (to all clients)
```json
{
  "event": "info",
  "totalClients": 42,
  "memberData": { "_id": "...", "memberNick": "..." },
  "action": "joined"
}
```

### On connect — server emits (to new client only)
```json
{
  "event": "getMessages",
  "list": [
    { "event": "message", "text": "Hello", "memberData": { "_id": "...", "memberNick": "..." } }
  ]
}
```

### On disconnect — server emits (to all except disconnected client)
```json
{
  "event": "info",
  "totalClients": 41,
  "memberData": { "_id": "...", "memberNick": "..." },
  "action": "left"
}
```

---

## Chat Events

### `message` — Client → Server
Sends a chat message. Requires authenticated member (guests receive an error).
```json
{ "event": "message", "data": "Hello world!" }
```
Max length: 500 characters.

### `message` — Server → All clients (broadcast)
```json
{
  "event": "message",
  "text": "Hello world!",
  "memberData": { "_id": "...", "memberNick": "...", "memberImage": "..." }
}
```

### `error` — Server → Client
Returned when auth is missing or payload is invalid.
```json
{ "event": "error", "message": "Authentication required to send messages" }
```

---

## Notification Events (Phase 2)

### `notification` — Server → Specific user
Emitted by `SocketGateway.emitNotificationToUser(memberId, notification)` after a notification is persisted to MongoDB. Only the target user's connected socket receives this.
```json
{
  "event": "notification",
  "data": {
    "_id": "64a...",
    "notificationType": "LIKE",
    "notificationStatus": "WAIT",
    "notificationGroup": "PRODUCT",
    "notificationTitle": "Someone liked your product",
    "notificationDesc": "Royal Canin Dog Food",
    "authorId": "64b...",
    "receiverId": "64c...",
    "productId": "64d...",
    "articleId": null,
    "createdAt": "2026-07-02T10:00:00.000Z",
    "updatedAt": "2026-07-02T10:00:00.000Z"
  }
}
```

### `notificationCount` — Server → Specific user
Can be emitted to sync the unread badge count (e.g., on reconnect).
```json
{ "event": "notificationCount", "count": 5 }
```

---

## Notice Events (Phase 3)

### `notice` — Server → All clients (broadcast)
Emitted by `SocketGateway.broadcastNotice(notice)` when a notice is created or updated to `ACTIVE` status. All connected clients receive this and the frontend shows a modal.
```json
{
  "event": "notice",
  "data": {
    "_id": "64e...",
    "noticeCategory": "FAQ",
    "noticeStatus": "ACTIVE",
    "noticeTitle": "Platform maintenance tonight",
    "noticeContent": "We will be performing maintenance from 2am–4am UTC.",
    "memberId": "64f...",
    "createdAt": "2026-07-02T10:00:00.000Z",
    "updatedAt": "2026-07-02T10:00:00.000Z"
  }
}
```

---

## Frontend Event Dispatch

Events are handled in two places:

| Handler location | Events handled |
|---|---|
| `Chat.tsx` — `socket.onmessage` | `info`, `getMessages`, `message` |
| `_app.tsx` — `socket.addEventListener('message', ...)` | `notification`, `notificationCount`, `notice` |

Both handlers coexist on the same socket instance — `addEventListener` does not override `onmessage`.

---

## GraphQL Operations Added

### User Queries
- `getMyNotifications(input: NotificationsInquiry): Notifications`
- `getUnreadNotificationCount: Int`
- `getNotices(input: NoticesInquiry): Notices`

### User Mutations
- `markNotificationRead(notificationId: String!): Notification`
- `markAllNotificationsRead: Boolean`

### Admin Mutations
- `createNotice(input: NoticeInput!): Notice`
- `updateNotice(input: NoticeUpdate!): Notice`
- `deleteNotice(noticeId: String!): Notice`

---

## Enum Reference

### NotificationType
| Value | Meaning |
|---|---|
| `LIKE` | Someone liked a product, article, or member profile |
| `COMMENT` | Someone commented on a product or article |

### NotificationGroup
| Value | Ref field used |
|---|---|
| `MEMBER` | `authorId` → navigate to member profile |
| `PRODUCT` | `productId` → navigate to `/shop/:id` |
| `ARTICLE` | `articleId` → navigate to `/community/detail?id=:id` |

### NotificationStatus
| Value | Meaning |
|---|---|
| `WAIT` | Unread |
| `READ` | Read |

### NoticeCategory
| Value | Meaning |
|---|---|
| `FAQ` | Frequently asked questions |
| `TERMS` | Terms and conditions |
| `INQUIRY` | General announcements |

### NoticeStatus
| Value | Meaning |
|---|---|
| `HOLD` | Draft, not visible to users |
| `ACTIVE` | Published — triggers WS broadcast |
| `DELETE` | Soft-deleted |
