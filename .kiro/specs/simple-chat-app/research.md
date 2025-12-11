# Research & Design Decisions

---
**Feature**: simple-chat-app
**Discovery Scope**: New Feature (グリーンフィールド)
**Last Updated**: 2025-12-10
---

## Summary

- **Feature**: `simple-chat-app`
- **Discovery Scope**: New Feature / グリーンフィールドプロジェクト
- **Key Findings**:
  - React + Socket.io + Node.js + PostgreSQL/MongoDB が2025年の標準スタック
  - Socket.ioはネイティブWebSocketより高機能（自動再接続、フォールバック対応）
  - 水平スケーリングにはRedis Pub/Subアダプターが必須
  - JWTトークンはHttpOnly Cookieでの保存が最もセキュア
  - MongoDBはメッセージ保存に適し、PostgreSQLは構造化データに適する

## Research Log

### トピック1: リアルタイム通信技術の選定

**Context**: チャットアプリケーションにはリアルタイム双方向通信が必要。WebSocketまたはSocket.ioのどちらを採用すべきか調査。

**Sources Consulted**:
- [WebSocket architecture best practices](https://ably.com/topic/websocket-architecture-best-practices)
- [The complete guide to WebSockets with React](https://ably.com/blog/websockets-react-tutorial)
- [React WebSocket tutorial with Socket.IO](https://blog.logrocket.com/websocket-tutorial-socket-io/)
- [Building a Real-Time Chat Application with React and WebSocket](https://medium.com/@abhishekkhaiwale007/building-a-real-time-chat-application-with-react-and-websocket-a-complete-guide-9458eb9742d1)

**Findings**:
- **Socket.io**: 自動再接続、フォールバック対応（長いポーリング）、イベントベースAPI、ルーム/ネームスペース機能が組み込み
- **Native WebSocket**: 軽量・高速だが、再接続やメッセージパーシングは手動実装が必要
- **2025年のベストプラクティス**: シングルトン接続パターン、堅牢な再接続戦略、パフォーマンスチューニング
- **状態管理**: React Context APIまたはZustandでグローバル状態管理を推奨

**Implications**:
- Socket.ioを採用：開発効率とメンテナンス性を優先
- フロントエンドではシングルトンパターンでWebSocket接続を管理
- 再接続ロジックはSocket.ioのビルトイン機能を活用

### トピック2: 水平スケーリング戦略

**Context**: 将来的なユーザー増加に備えて、複数サーバーインスタンスでのスケーリング方法を調査。

**Sources Consulted**:
- [Build a Scalable Chat App with Node.js, Socket.IO & Redis Pub/Sub](https://blog.kawaljain.com/building-a-scalable-chat-app)
- [Scaling a realtime chat app on AWS using Socket.io, Redis, and AWS Fargate](https://medium.com/containers-on-aws/scaling-a-realtime-chat-app-on-aws-using-socket-io-redis-and-aws-fargate-4ed63fb1b681)
- [Redis adapter | Socket.IO](https://socket.io/docs/v4/redis-adapter/)
- [How We Solved Real-Time Scaling Issues with Redis and Socket.IO](https://medium.com/@sasidharan_s/how-we-solved-real-time-scaling-issues-with-redis-and-socket-io-1479857f39f3)

**Findings**:
- **Redis Pub/Sub**: Socket.ioの複数サーバーインスタンス間でメッセージをブロードキャストするために必須
- **Redis Adapter**: `@socket.io/redis-adapter` パッケージがデファクトスタンダード
- **Redis 7.0+**: Sharded Pub/Sub機能により、さらなるパフォーマンス向上が可能
- **ロードバランサー**: HAProxy、Nginx、Traefikが推奨され、Sticky Sessionの設定が必要
- **Kafka**: メッセージキューとして使用することで、DB障害時のデータ損失を防止（オプション）

**Implications**:
- 初期実装: 単一サーバーでスタート、Redis Adapterの設定は準備
- スケーリング準備: Redis Pub/Subを設計に組み込む
- 将来の拡張: Kafkaによるメッセージキューを検討（Phase 2）

### トピック3: 認証とセキュリティ

**Context**: ユーザー認証の実装方法とトークン保存のセキュリティベストプラクティスを調査。

**Sources Consulted**:
- [JWT Security Best Practices for 2025](https://jwt.app/blog/jwt-best-practices/)
- [Token Best Practices - Auth0](https://auth0.com/docs/secure/tokens/token-best-practices)
- [JWT storage 101: How to keep your tokens secure](https://workos.com/blog/secure-jwt-storage)
- [Secure JWT Storage: Best Practices](https://www.syncfusion.com/blogs/post/secure-jwt-storage-best-practices)

**Findings**:
- **トークン保存**: HttpOnly Cookie（Secure、SameSite属性付き）が最もセキュア
- **LocalStorage/SessionStorageは非推奨**: XSS攻撃に脆弱
- **署名アルゴリズム**: EdDSA（量子耐性）> ES256（ECDSA）> RS256の順に推奨
- **トークン有効期限**: アクセストークン5-15分、リフレッシュトークンで長期セッション維持
- **XSS対策**: Content Security Policy (CSP)ヘッダーの使用、トークンをDOM/URLに露出しない
- **HTTPS必須**: すべてのトークン通信はHTTPS経由

**Implications**:
- JWT認証を採用し、HttpOnly Cookieに保存
- アクセストークン有効期限: 15分、リフレッシュトークン: 7日
- パスワードハッシュ化: bcrypt（コスト12）を使用
- HTTPS強制、CSPヘッダーの設定

### トピック4: データベース選定とスキーマ設計

**Context**: PostgreSQLとMongoDBのどちらがチャットアプリケーションに適しているか調査。

**Sources Consulted**:
- [How to Design a Real-Time Chat System with MongoDB and Express.js (2025 Guide)](https://kritimyantra.com/blogs/how-to-design-a-real-time-chat-system-with-mongodb-and-expressjs-2025-guide)
- [Build a Real-time Chat App Using Strapi, Next, Socket.io, and Postgres](https://strapi.io/blog/real-time-chat-application-using-strapi-next-socket-io-and-postgre-sql)
- [MongoDB chat schema and Mongoose chat schema for Chat Application](https://stackfame.com/mongodb-chat-schema-mongoose-chat-schema-chat-application)
- [Database design for storing chats - Indie Hackers](https://www.indiehackers.com/post/database-design-for-storing-chats-12085e9f8e)

**Findings**:
- **MongoDB**: メッセージ保存に適している（高い書き込みスループット、柔軟なスキーマ、水平スケーリング）
- **PostgreSQL**: ユーザー情報、ルーム情報、関係データに適している（ACID保証、複雑なクエリ）
- **ハイブリッドアプローチ**: PostgreSQL（構造化データ）+ MongoDB（メッセージ履歴）
- **MongoDBスキーマ**: Users、Rooms、Messages の3つのコレクション
- **PostgreSQLスキーマ**: users、rooms、room_members、messages テーブル

**Implications**:
- 初期実装: PostgreSQL単体で開始（シンプル性を優先）
- スキーマ設計: users、rooms、room_members、messages テーブル
- 将来の拡張: メッセージ履歴が膨大になった場合、MongoDBへの移行を検討

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Monolithic (React + Node.js + PostgreSQL) | フロントエンドとバックエンドを単一プロジェクトに統合 | シンプル、開発速度が速い | スケーリングが困難、責任境界が曖昧 | 小規模プロジェクトに適合 |
| Separated (SPA + REST API + WebSocket) | React SPA（フロントエンド）とNode.js API（バックエンド）を分離 | 明確な責任分離、独立してスケール可能 | 初期セットアップが複雑 | **推奨**: 将来の拡張性を確保 |
| BaaS (Firebase/Supabase) | バックエンドサービスを外部に委託 | 開発速度が非常に速い | ベンダーロックイン、カスタマイズ性が低い | プロトタイプには有用だが本番環境には不向き |
| Microservices | 認証、メッセージング、ルーム管理を個別サービスに分割 | 高いスケーラビリティ、独立したデプロイ | 過度に複雑、運用コストが高い | 現時点では過剰設計 |

**選定**: **Separated (SPA + REST API + WebSocket)** - 明確な責任分離と将来のスケーラビリティを確保

## Design Decisions

### Decision: フロントエンド技術スタック

**Context**: モダンなUIフレームワークを選定する必要がある。

**Alternatives Considered**:
1. **React** - 最も人気があり、エコシステムが充実
2. **Vue.js** - 学習曲線が緩やか、シンプル
3. **Angular** - エンタープライズ向け、フルフレームワーク

**Selected Approach**: **React 18+**
- TypeScriptでの型安全性
- Hooks（useState, useEffect, useContext）による状態管理
- React Context APIまたはZustandでグローバル状態管理
- ViteまたはNext.jsでビルド（開発速度優先）

**Rationale**:
- 最も広く使用されており、ドキュメントとコミュニティサポートが充実
- Socket.ioとの統合例が豊富
- TypeScript対応が優れている

**Trade-offs**:
- ✅ エコシステムの充実、豊富なライブラリ
- ✅ 開発者の採用が容易
- ❌ 初期学習コストが中程度

### Decision: バックエンド技術スタック

**Context**: リアルタイム通信を処理できるバックエンドフレームワークが必要。

**Alternatives Considered**:
1. **Node.js + Express** - JavaScript統一、Socket.ioとのネイティブ統合
2. **Python + FastAPI** - 高パフォーマンス、型ヒント
3. **Go + Gin** - 高速、並行処理に優れる

**Selected Approach**: **Node.js + Express + Socket.io**
- Express.js 4.x でREST APIを構築
- Socket.io 4.x でリアルタイム通信
- TypeScriptで型安全性を確保

**Rationale**:
- JavaScript/TypeScriptでフロントエンドとバックエンドを統一
- Socket.ioはNode.js向けに最適化されている
- npm エコシステムが豊富

**Trade-offs**:
- ✅ フロントエンドとバックエンドで言語を統一できる
- ✅ Socket.ioとのシームレスな統合
- ❌ シングルスレッド（CPU集約的タスクには不向き）

### Decision: データベース選定

**Context**: ユーザー、ルーム、メッセージを保存するデータベースが必要。

**Alternatives Considered**:
1. **PostgreSQL** - リレーショナル、ACID保証
2. **MongoDB** - ドキュメント指向、水平スケーリング
3. **Hybrid (PostgreSQL + MongoDB)** - 構造化データ + メッセージ履歴

**Selected Approach**: **PostgreSQL 16+**
- 構造化データとメッセージを単一DBで管理
- TypeORMまたはPrismaでORMを使用

**Rationale**:
- 初期段階ではシンプル性を優先
- ACID保証により、ユーザー・ルーム管理の整合性を確保
- メッセージ数が膨大になった場合、MongoDBへ移行可能

**Trade-offs**:
- ✅ データ整合性が保証される
- ✅ 複雑なクエリが可能
- ❌ 水平スケーリングがMongoDBより困難

### Decision: 認証方式

**Context**: セキュアなユーザー認証メカニズムが必要。

**Alternatives Considered**:
1. **JWT (JSON Web Tokens)** - ステートレス、スケーラブル
2. **Session-based** - サーバー側でセッション管理
3. **OAuth 2.0** - 外部プロバイダー（Google、GitHub）

**Selected Approach**: **JWT (Access Token + Refresh Token)**
- Access Token: 15分有効、HttpOnly Cookieに保存
- Refresh Token: 7日有効、HttpOnly Cookieに保存
- bcryptでパスワードハッシュ化（コスト12）

**Rationale**:
- ステートレスで水平スケーリングが容易
- HTTPSとHttpOnly Cookieでセキュリティを確保
- 外部依存なし（OAuth 2.0は将来追加可能）

**Trade-offs**:
- ✅ スケーラビリティが高い
- ✅ サーバー側のセッション管理が不要
- ❌ トークンの無効化が困難（ブラックリスト管理が必要）

### Decision: リアルタイム通信プロトコル

**Context**: クライアントとサーバー間のリアルタイム双方向通信が必要。

**Alternatives Considered**:
1. **Socket.io** - 自動再接続、フォールバック、イベントベース
2. **Native WebSocket** - 軽量、標準プロトコル
3. **Server-Sent Events (SSE)** - 単方向（サーバー→クライアント）

**Selected Approach**: **Socket.io 4.x**
- イベントベースAPI（`emit`、`on`）
- ルーム機能でチャットルームを管理
- 自動再接続とフォールバック対応

**Rationale**:
- 開発効率が高く、再接続ロジックが不要
- ルーム機能がチャットアプリに最適
- ブラウザ互換性が高い（長いポーリングにフォールバック）

**Trade-offs**:
- ✅ 開発効率が高い
- ✅ 豊富な機能（ルーム、ネームスペース）
- ❌ ネイティブWebSocketよりオーバーヘッドがある

## Risks & Mitigations

### リスク1: スケーラビリティ制約
**説明**: 単一サーバーでは同時接続数に限界がある

**Mitigation**:
- Redis Pub/Subアダプターを設計段階で組み込む
- 水平スケーリングに備えたアーキテクチャ設計
- ロードバランサー（Nginx）の導入計画

### リスク2: WebSocket接続の安定性
**説明**: ネットワーク不安定時の接続切断

**Mitigation**:
- Socket.ioの自動再接続機能を活用
- 指数バックオフによる再接続戦略
- ユーザーへの接続状態の可視化

### リスク3: メッセージ履歴のパフォーマンス
**説明**: メッセージ数が増加するとクエリが遅延

**Mitigation**:
- カーソルベースページネーション（limit + offset）
- messagesテーブルにインデックス（room_id、created_at）
- 将来的にMongoDBへの移行を検討

### リスク4: セキュリティ脆弱性
**説明**: XSS、CSRF、SQLインジェクション

**Mitigation**:
- HTTPSの強制使用
- HttpOnly Cookie + SameSite属性
- ORMによるSQLインジェクション対策
- Content Security Policy (CSP) ヘッダー
- 入力バリデーション（クライアント + サーバー）

### リスク5: トークンの盗難・漏洩
**説明**: JWTトークンが盗まれると不正アクセスが可能

**Mitigation**:
- 短いアクセストークン有効期限（15分）
- リフレッシュトークンローテーション
- トークンブラックリスト（Redis）の実装
- 異常ログイン検知

## References

### Architecture & Best Practices
- [WebSocket architecture best practices](https://ably.com/topic/websocket-architecture-best-practices)
- [The complete guide to WebSockets with React](https://ably.com/blog/websockets-react-tutorial)
- [Building a Real-Time Chat Application with React and WebSocket](https://medium.com/@abhishekkhaiwale007/building-a-real-time-chat-application-with-react-and-websocket-a-complete-guide-9458eb9742d1)

### Scalability
- [Build a Scalable Chat App with Node.js, Socket.IO & Redis Pub/Sub](https://blog.kawaljain.com/building-a-scalable-chat-app)
- [How We Solved Real-Time Scaling Issues with Redis and Socket.IO](https://medium.com/@sasidharan_s/how-we-solved-real-time-scaling-issues-with-redis-and-socket-io-1479857f39f3)
- [Redis adapter | Socket.IO](https://socket.io/docs/v4/redis-adapter/)

### Security
- [JWT Security Best Practices for 2025](https://jwt.app/blog/jwt-best-practices/)
- [JWT storage 101: How to keep your tokens secure](https://workos.com/blog/secure-jwt-storage)
- [Secure JWT Storage: Best Practices](https://www.syncfusion.com/blogs/post/secure-jwt-storage-best-practices)

### Database Design
- [How to Design a Real-Time Chat System with MongoDB and Express.js (2025 Guide)](https://kritimyantra.com/blogs/how-to-design-a-real-time-chat-system-with-mongodb-and-expressjs-2025-guide)
- [Build a Real-time Chat App Using Strapi, Next, Socket.io, and Postgres](https://strapi.io/blog/real-time-chat-application-using-strapi-next-socket-io-and-postgre-sql)
