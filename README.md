# 聖約翰產學合作專班 - 成績表現分析儀表板

本專案是一個基於 React 的互動式成績分析系統，專為「進階 BIM 理論與工作」課程設計。它能自動處理學生成績 CSV 數據，並提供直觀的視覺化圖表、榮譽榜、以及具備個資保護功能的教師評語分析系統。

## 🌟 主要功能

- **數據視覺化**：自動生成全班成績分佈與對比圖表。
- **機密個資保護**：採用 **AES-256** 強度加密，需輸入密碼才能存取學生資訊。
- **教師評語整合**：從 CSV 自動提取教師對個別學生的具體意見。
- **現代化介面**：深色調玻璃擬態（Glassmorphism）設計，適配各類顯示裝置。

---

## 🚀 部署至 GitHub Pages

本專案已配置自動化部署工具。請按照以下步驟操作：

### 1. 準備數據 (初次或更新時)

確保您的 `總成績.csv` 位在專案根目錄，然後執行以下指令進行同步並加密：

```bash
npm run secure GAMUDABIM
```

*(註：`GAMUDABIM` 為預設解密密碼)*

### 2. 初始化 Git 倉庫 (如果尚未建立)

```bash
git init
git add .
git commit -m "Initial commit with secure grade dashboard"
```

### 3. 建立並連接 GitHub 倉庫

在 GitHub 上建立一個新的公開倉庫（名稱建議為 `stjohn_grade`），然後在本地端執行：

```bash
git remote add origin https://github.com/您的用戶名/stjohn_grade.git
git branch -M main
git push -u origin main
```

### 4. 執行一鍵部署

執行以下指令，系統會自動執行加密、編譯並將成品推送到 `gh-pages` 分支：

```bash
npm run deploy
```

### 5. 開啟網頁

部署完成後，約一分鐘後即可在以下網址查看：
`https://您的用戶名.github.io/stjohn_grade/`

---

## 🛠️ 開發與維護指令

- **本地開發模式**：`npm run dev`
- **數據手動加密**：`npm run secure <密碼>`
- **產出編譯成品**：`npm run build`

## 🔒 安全注意事項

- 原始 `.csv` 與 `.json` 檔案已被設定於 `.gitignore` 中，**不會**被上傳至 GitHub。
- 下載或克隆本專案的人無法直接讀取檔案，必須具備解密密碼。

---
© 2026 聖約翰科技大學產學合作專班 - BIM 成績分析系統
