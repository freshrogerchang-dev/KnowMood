# Gemini TTS 台灣華語情緒示範

這是本機預先製作音檔的工具。App 播放靜態檔案，可離線使用，不會在瀏覽器呼叫 Gemini，也不需要在前端放 API key。

## 準備

需要 Node.js 22.9 以上（本專案使用 22.21）。至 https://aistudio.google.com/apikey 建立 API key，確認所屬專案可使用 TTS 模型與必要的計費設定。在專案根目錄建立 `.env.local`：

```dotenv
GEMINI_API_KEY=你的金鑰
```

不要使用 `VITE_GEMINI_API_KEY`。`.env.local` 已加入 gitignore，不要提交或把金鑰貼到對話。

## 先試聽六種情緒

```powershell
node scripts/generate-gemini-tts.mjs --dry-run
node scripts/generate-gemini-tts.mjs
```

第一個指令只列出工作，不呼叫 API。第二個會產生六段「我要出去了」，涵蓋開心、難過、生氣、害怕、驚訝、累了，寫入 `.tts-output/sample/`。用瀏覽器開啟其中的 `index.html` 試聽；此頁只有原生音訊播放器，無需伺服器。

預設固定 Aoede 音色及 `gemini-2.5-flash-preview-tts` 模型。台灣口音是提示要求，並非品質保證。可改用 `--voice Leda` 或 `--voice Kore` 比較；全套請使用同一個音色。模型可透過 `--model` 改成帳號可用的 Gemini TTS 模型。

試聽重點：台灣日常說話口吻、台詞沒有多字漏字、指令未被唸出、沒有音樂、音量舒適、情緒可分辨且不過度誇張。若目前的答題提示與聲音不符，需調整表演指令或提示，不能只以檔案生成成功視為驗收。

## 製作及匯入完整 48 段

```powershell
node scripts/generate-gemini-tts.mjs --all
node scripts/generate-gemini-tts.mjs --install
npm test
npm run build
```

`--all` 會呼叫 API 48 次，依現有 8 句台詞與 6 種情緒生成至 `.tts-output/full/`，不立刻修改 App。先開啟該目錄的 `index.html` 試聽整套，再執行 `--install`。匯入不呼叫 API，會檢查完整性與台詞，將 WAV 及來源紀錄加入 App；播放器優先使用同名 WAV，舊 MP3 保留作為未匯入時的來源。PWA 會快取 WAV。

每次生成都會重新請求，可能產生費用；HTTP 400 最多請求三次，其他錯誤立即停止。可加 `--resume` 沿用相同音色、模型與提示的已完成音檔。HTTP 401/403 請查金鑰與模型權限，429 請查配額／計費，5xx 可稍後重試。失敗或中斷的整套不能匯入，可執行 `--all --resume` 補齊。生成後沒有自動部署或提交 git。

目前六段 Gemini 2.5 Flash TTS / Aoede 試聽已生成並經使用者確認；尚未匯入正式 App。

## 替換整個 App 的固定語音

```powershell
node scripts/generate-app-tts.mjs --dry-run
node scripts/generate-app-tts.mjs --concurrency 1
node scripts/generate-app-tts.mjs --install
```

完整工具涵蓋 48 段情緒示範、既有固定旁白，以及程式中新增加但尚未預錄的提示。預設使用 Gemini 3.8 Flash TTS、Aoede 音色與結構化 `speech_metadata`，輸出保存在 `.tts-output/app-3.8/`；舊版 2.5 進度留在 `.tts-output/app/`，不會混用。每段均記錄提示、內容雜湊及檔案雜湊；重跑會自動續傳。只有全部音檔齊全且雜湊吻合時，`--install` 才會修改 App 資源。

Gemini Developer API 免費層目前對此 TTS 模型有每日請求上限。達到上限時工具會停止並保留進度；等 API 顯示的重置時間後執行相同指令即可續傳。若專案升級為付費額度，可以直接繼續，不必重新生成已完成的檔案。

Gemini 3.8 Flash TTS 支援 Batch API。大量生成可使用 `generate-app-tts-batch.mjs --submit` 提交、`download-app-tts-batch.mjs` 將大型回應串流至磁碟，再以 `import-app-tts-batch-stream.mjs` 逐段轉檔與更新 manifest。不要重複提交已有 `batch-state.json` 的工作。

官方 API 與音訊格式：https://ai.google.dev/gemini-api/docs/generate-content/speech-generation
