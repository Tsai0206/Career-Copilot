# 環境變數配置指南

由於 `.env.local` 文件被系統鎖定無法自動創建，請手動完成以下步驟：

## 步驟

1. 在 `career-copilot` 資料夾中創建文件：`.env.local`
2. 複製以下內容並貼上：

```env
GOOGLE_API_KEY=AIzaSyA7XoKI9pUgvgh2fCE05bkrQAlttm3LAso
NEXT_PUBLIC_SUPABASE_URL=https://bsketcwyhtydrwlqkhkp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJza2V0Y3d5aHR5ZHJ3bHFraGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NDc4OTEsImV4cCI6MjA4NjUyMzg5MX0.jQDtF2OMTjo9Plpy2Hd5inL1WMhwbbBfF2aVCWSeA_o
```

3. **儲存文件** (Ctrl+S)
4. 開發伺服器會自動重新載入
5. 重新整理瀏覽器：http://localhost:3000

## 已完成的修正
✅ 修正了 `middleware.ts` 的語法錯誤（第 11 行：`constsupabase` → `const supabase`）
✅ 確認 Supabase 專案資訊正確

完成後應用程式就能正常運行了！
