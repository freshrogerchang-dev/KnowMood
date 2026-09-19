#!/usr/bin/env python3
"""一次性工具：用 Azure AI Speech 重新烘焙 App 裡所有預錄的旁白/語音遊戲音檔。

只在 GitHub Actions 的 workflow_dispatch 裡跑（本機/沙箱環境連不到 Azure 的網域）。
資料來源是同目錄的 bake-azure-tts-data.json，每一筆是
{ path, text, pitch(半音), ratePct(相對語速百分比), volumeDb }。

環境變數：
  AZURE_SPEECH_KEY    - Azure 語音資源的金鑰
  AZURE_SPEECH_REGION - 資源所在地區（例如 southeastasia）
  AZURE_SPEECH_VOICE  - 選用的語音（預設 zh-TW-HsiaoChenNeural）
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = Path(__file__).resolve().parent / "bake-azure-tts-data.json"

KEY = os.environ["AZURE_SPEECH_KEY"].strip()
REGION = os.environ["AZURE_SPEECH_REGION"].strip()
VOICE = os.environ.get("AZURE_SPEECH_VOICE", "zh-TW-HsiaoChenNeural").strip()
ENDPOINT = f"https://{REGION}.tts.speech.microsoft.com/cognitiveservices/v1"


def build_ssml(text, pitch, rate_pct, volume_db):
    return (
        '<speak version="1.0" xml:lang="zh-TW">'
        f'<voice name="{VOICE}">'
        f'<prosody rate="{rate_pct:+.2f}%" pitch="{pitch:+.2f}st" volume="{volume_db:+.2f}dB">'
        f"{escape(text)}"
        "</prosody></voice></speak>"
    )


def synthesize(text, pitch, rate_pct, volume_db):
    ssml = build_ssml(text, pitch, rate_pct, volume_db)
    req = urllib.request.Request(
        ENDPOINT,
        data=ssml.encode("utf-8"),
        headers={
            "Ocp-Apim-Subscription-Key": KEY,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
            "User-Agent": "knowmood-tts-bake",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def preflight():
    """先送測試請求，失敗的話把所有能看到的診斷資訊印出來就中止，
    不要再花 8-10 分鐘把同一個錯誤重複 561 次。

    先打一個簡單的 GET（語音清單）確認金鑰/地區本身沒問題，
    再打實際會用到的 SSML 合成請求 —— 這樣兩步驟哪一步先炸，
    就知道問題是出在認證/地區，還是 SSML 格式本身。"""
    print(f"key length: {len(KEY)}, region: {REGION!r}, voice: {VOICE!r}")

    voices_url = f"https://{REGION}.tts.speech.microsoft.com/cognitiveservices/voices/list"
    req = urllib.request.Request(
        voices_url,
        headers={"Ocp-Apim-Subscription-Key": KEY, "User-Agent": "knowmood-tts-bake"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            voices = json.loads(resp.read())
        names = [v["ShortName"] for v in voices if v.get("Locale", "").lower().startswith("zh-tw")]
        print(f"voices/list OK, {len(voices)} total voices, zh-TW ones: {names}")
        if VOICE not in names:
            print(f"WARNING: {VOICE!r} not in the zh-TW voice list above!", file=sys.stderr)
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        print(f"PREFLIGHT FAILED at voices/list: HTTP {e.code}", file=sys.stderr)
        print(f"response headers: {dict(e.headers)}", file=sys.stderr)
        print(f"response body: {body!r}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"PREFLIGHT FAILED at voices/list: network error: {e}", file=sys.stderr)
        sys.exit(1)

    text, pitch, rate_pct, volume_db = "測試", 0.0, 0.0, 0.0
    ssml = build_ssml(text, pitch, rate_pct, volume_db)
    print(f"preflight synth endpoint: {ENDPOINT}")
    print(f"preflight synth ssml: {ssml}")
    try:
        audio = synthesize(text, pitch, rate_pct, volume_db)
        print(f"preflight synth OK, {len(audio)} bytes")
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        print(f"PREFLIGHT FAILED at synth: HTTP {e.code}", file=sys.stderr)
        print(f"response headers: {dict(e.headers)}", file=sys.stderr)
        print(f"response body: {body!r}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"PREFLIGHT FAILED at synth: network error: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    preflight()
    items = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    print(f"total items: {len(items)}")

    errors = []
    for i, item in enumerate(items, start=1):
        out_path = ROOT / item["path"]
        out_path.parent.mkdir(parents=True, exist_ok=True)
        audio = None
        for attempt in range(4):
            try:
                audio = synthesize(item["text"], item["pitch"], item["ratePct"], item["volumeDb"])
                break
            except urllib.error.HTTPError as e:
                body = e.read().decode(errors="replace")
                if e.code == 429 and attempt < 3:
                    time.sleep(2 * (attempt + 1))
                    continue
                errors.append((item["path"], item["text"], f"{e.code}: {body[:200]}"))
                break
            except urllib.error.URLError as e:
                # 網路層級的錯誤（DNS 解析失敗、連不上……）通常是設定問題，
                # 重試也不會好，直接整批中止，不要傻等幾個小時才發現全部失敗。
                print(f"FATAL network error, aborting: {e}", file=sys.stderr)
                print("檢查 AZURE_SPEECH_REGION / AZURE_SPEECH_KEY 這兩個 secret 是否有正確設定。", file=sys.stderr)
                sys.exit(1)
        if audio:
            out_path.write_bytes(audio)
        if i % 25 == 0 or i == len(items):
            print(f"... {i}/{len(items)}")
        time.sleep(0.3)  # 免費 F0 方案有速率限制，慢一點比較不會被 429

    print(f"done. success: {len(items) - len(errors)}/{len(items)}")
    if errors:
        print(f"ERRORS: {len(errors)}", file=sys.stderr)
        for path, text, msg in errors[:20]:
            print(f" - {path} ({text!r}): {msg}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
