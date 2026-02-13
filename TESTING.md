# 測試指南 (Testing Guide)

## ✅ 當前狀態
- ✅ `.env.local` 已設定 API Key
- ✅ 開發伺服器已啟動於 `http://localhost:3000`
- ⚠️ Supabase Secrets 需要手動設定（Edge Functions 需要）

---

## 🧪 測試步驟

### 1. 打開應用程式
在瀏覽器中進入：**http://localhost:3000**

您應該看到：
- 🎨 **Landing Page**：標題 "Career Co-pilot"，描述 "Your AI-Powered Career Advisor"
- 📌 三個核心功能卡片
- 🔘 "Get Started" 按鈕

---

### 2. 註冊/登入測試
1. 點擊首頁的 **"Get Started"** 或右上角 **"Login"**
2. 在登入頁面輸入測試帳號：
   - Email: `test@example.com`
   - Password: `password123`（至少 6 個字元）
3. 點擊 **"Sign Up"** 註冊（如果已註冊，點 "Login"）
4. 成功後應該會跳轉到 **Profile 頁面**

---

### 3. 上傳履歷測試（測試 API Key）
在 Profile 頁面：
1. 填寫個人資料：
   - Full Name: `測試用戶`
   - Current Title: `前端工程師`
   - Target Role: `全端工程師`
2. **上傳履歷 PDF**（任一 PDF 文件即可，系統會嘗試解析）
3. 點擊 **"Save Profile"**

**預期結果**：
- ✅ 如果 API Key 設定正確：顯示 "Profile updated!" 並自動解析技能
- ❌ 如果 API Key 無效：可能出現錯誤訊息

---

### 4. 分析職缺 (Job Description)
1. 點擊導航欄的 **"Analyze"**
2. 貼上一段職缺描述（中英文皆可），例如：
   ```
   我們正在尋找一位 React 開發工程師，熟悉 TypeScript、Next.js、Tailwind CSS。需要有 3 年以上前端經驗。
   ```
3. 點擊 **"Analyze Gap"**

**預期結果**：
- ✅ 系統會解析 JD，辨識技能需求
- ✅ 跳轉到 **Dashboard** 顯示技能缺口
- ✅ 系統應該會生成 **5 個專案建議**（北極星項目）

---

### 5. 查看專案計畫
1. 在 Dashboard 選擇一個專案（點擊卡片）
2. 查看專案詳情頁面

**預期內容**：
- 📄 Implementation Plan (自動生成的 README)
- 🎯 Vibe Coding Prompt Pack（可複製的提示詞）
- 📚 Resources（學習資源連結）
- 💾 Download Plan（下載 PDF 按鈕）

---

## ⚠️ Supabase Secrets 手動設定（重要！）

由於 Edge Functions 也需要 API Key，但命令列設定失敗了，您需要手動新增：

### 方法一：透過 Dashboard（推薦）
1. 進入 Supabase Dashboard: https://supabase.com/dashboard/project/bsketcwyhtydrwlqkhkp
2. 點擊左側 **Settings** → **Edge Functions**
3. 找到 **Secrets** 區塊
4. 新增密鑰：
   - Name: `GOOGLE_API_KEY`
   - Value: `AIzaSyA7XoKI9pUgvgh2fCE05bkrQAlttm3LAso`
5. 點擊 **Save**

### 方法二：透過 CLI（需要登入）
```bash
# 登入 Supabase
npx supabase login

# 設定 Secret
npx supabase secrets set GOOGLE_API_KEY=AIzaSyA7XoKI9pUgvgh2fCE05bkrQAlttm3LAso --project-ref bsketcwyhtydrwlqkhkp
```

---

## 🐛 可能的錯誤排查

### 1. "Failed to parse resume"
- 檢查 `.env.local` 是否正確設定
- 確認 API Key 在 Google AI Studio 中處於啟用狀態

### 2. "Error generating projects"
- 確認 **Supabase Secrets** 已正確設定
- 檢查 Edge Functions 是否已部署

### 3. 畫面沒反應
- 打開瀏覽器 Console (F12) 查看錯誤訊息
- 檢查開發伺服器是否正常運行

---

## 📊 測試通過標準
- ✅ 可以登入/註冊
- ✅ 上傳履歷後能自動解析技能
- ✅ 貼上 JD 後能生成專案建議
- ✅ 可以查看專案詳情和 Prompt Pack
- ✅ 可以下載 PDF 計畫
