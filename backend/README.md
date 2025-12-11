# Chat Application - Backend

シンプルなチャットアプリケーションのバックエンドAPI

## 技術スタック

- **Node.js** 20.x LTS
- **TypeScript** 5.x
- **Express** 5.x - REST APIフレームワーク
- **Socket.io** 4.x - リアルタイム通信
- **Prisma** 5.x - ORMとデータベース管理
- **PostgreSQL** 16.x - データベース
- **bcrypt** - パスワードハッシュ化
- **jsonwebtoken** - JWT認証
- **Jest** - テストフレームワーク

## セットアップ

### 前提条件

- Node.js 20.x以上
- PostgreSQL 16.x
- npm または yarn

### インストール

1. 依存関係をインストール:
```bash
npm install
```

2. 環境変数を設定:
```bash
cp .env.example .env
# .envファイルを編集して適切な値を設定
```

3. データベースをセットアップ（後のフェーズで実装）:
```bash
npm run prisma:migrate
npm run prisma:generate
```

### 開発

開発サーバーを起動:
```bash
npm run dev
```

### テスト

すべてのテストを実行:
```bash
npm test
```

ウォッチモードでテストを実行:
```bash
npm run test:watch
```

カバレッジレポートを生成:
```bash
npm run test:coverage
```

### ビルド

本番用にビルド:
```bash
npm run build
```

ビルドしたコードを実行:
```bash
npm start
```

### コード品質

リントを実行:
```bash
npm run lint
```

リントエラーを自動修正:
```bash
npm run lint:fix
```

コードをフォーマット:
```bash
npm run format
```

## プロジェクト構造

```
backend/
├── src/
│   ├── __tests__/       # テストファイル
│   ├── config/          # 設定ファイル
│   ├── middleware/      # Expressミドルウェア
│   ├── routes/          # APIルート
│   ├── services/        # ビジネスロジック
│   ├── utils/           # ユーティリティ関数
│   └── index.ts         # アプリケーションエントリーポイント
├── dist/                # ビルド出力
├── coverage/            # テストカバレッジレポート
├── .env.example         # 環境変数テンプレート
├── tsconfig.json        # TypeScript設定
├── jest.config.js       # Jest設定
├── eslint.config.js     # ESLint設定
└── package.json         # プロジェクトメタデータ
```

## API エンドポイント

### ヘルスチェック

```
GET /api/health
```

レスポンス:
```json
{
  "status": "ok",
  "timestamp": "2025-12-11T10:00:00.000Z"
}
```

## 開発ガイドライン

- TDD（テスト駆動開発）を実践
- TypeScriptの型安全性を活用
- ESLintとPrettierでコード品質を維持
- テストカバレッジ80%以上を目標
