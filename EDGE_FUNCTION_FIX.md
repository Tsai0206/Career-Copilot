# 修復 Edge Function 錯誤

## 問題診斷

當您點擊 "Start Gap Analysis" 時，系統呼叫 Supabase Edge Function `parse-jd`，但該函數需要 `GOOGLE_API_KEY` 環境變數才能運作。

錯誤訊息：`Edge Function returned a non-2xx status code`

---

## ✅ 解決方案：設定 Supabase Edge Function Secrets

您需要在 Supabase 後台手動設定 API Key：

### 步驟 1: 進入 Supabase Dashboard

1. 前往 [Supabase Edge Function Settings](https://supabase.com/dashboard/project/bsketcwyhtydrwlqkhkp/settings/functions)
2. 或從 Dashboard 左側選單： **Project Settings** → **Edge Functions**

### 步驟 2: 新增 Secret

1. 在 "Edge Function Secrets" 區域，點擊 **Add New Secret**
2. 填入以下資訊：
   - **Name**: `GOOGLE_API_KEY`
   - **Value**: `AIzaSyA7XoKI9pUgvgh2fCE05bkrQAlttm3LAso`

3. 點擊 **Save** 或 **Add Secret**

### 步驟 3: 驗證設定

1. 確認 Secret 已經出現在列表中（Value 會被隱藏，只顯示 `GOOGLE_API_KEY`）
2. 回到您的應用程式
3. 重新整理瀏覽器頁面
4. 再次嘗試點擊 **"Start Gap Analysis"**

---

## 🔍 如何確認是否成功？

成功後，系統應該：
1. 顯示 "Analyzing with Agents..." 載入畫面
2. 幾秒鐘後自動跳轉到 Dashboard 頁面
3. 在 Dashboard 看到分析結果

如果仍然失敗，請查看瀏覽器 Console (F12) 的錯誤訊息並告訴我。

---

## 📋 其他可能需要的設定

如果您想本地測試 Edge Functions，需要：
1. 在專案根目錄創建 `.env` 文件（已完成）
2. Supabase CLI 登入： `npx supabase login`
3. 本地執行： `npx supabase functions serve`

但對於目前的使用情境，只需要在 Dashboard 設定 Secret 即可。
