# 帳號與登入問題排查指南

## 常見問題：無法重新註冊 / 密碼錯誤 / 收不到驗證信

在開發階段，Supabase 預設開啟了 **"Email Confirmation" (信箱驗證)**。這會導致以下情況：
1. 您註冊了帳號（但可能打錯密碼）。
2. 因為還沒驗證信箱，您無法登入。
3. 您想重新註冊（修正密碼），但系統說 **"User already registered"**（使用者已存在）。
4. 結果：卡住了。

---

## ✅ 解決方案 1: 關閉信箱驗證 (推薦用於開發)

這是最簡單的方法，讓您註冊後可以直接登入，不需要收信。

1. 進入 [Supabase Dashboard](https://supabase.com/dashboard/project/bsketcwyhtydrwlqkhkp/auth/providers)
2. 左側選單點選 **Authentication** -> **Providers**。
3. 點選 **Email**。
4. **取消勾選** `Confirm email` (Enable Email Confirmations)。
5. 點擊 **Save**。

*設定後，新註冊的使用者將自動視為「已驗證」，可以直接登入。*

---

## ✅ 解決方案 2: 删除卡住的帳號

如果您已經註冊了一個「壞掉」的帳號（例如密碼打錯），您可以手動刪除它來重新開始：

1. 進入 [Supabase Dashboard - Users](https://supabase.com/dashboard/project/bsketcwyhtydrwlqkhkp/auth/users)
2. 找到您剛才註冊的 Email。
3. 點擊右側的 **三個點 (...)** -> **Delete User**。
4. 確認刪除。
5. 現在您可以回到應用程式，使用同一個 Email **重新註冊**（設定正確的密碼）。

---

## 💡 總結
為了開發順利，建議您：
1. **去後台刪除** 剛才那個有問題的帳號。
2. **關閉 Email Verification**。
3. 重新註冊。
