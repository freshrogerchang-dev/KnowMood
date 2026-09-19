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

KEY = os.environ["AZURE_SPEECH_KEY"]
REGION = os.environ["AZURE_SPEECH_REGION"]
VOICE = os.environ.get("AZURE_SPEECH_VOICE", "zh-TW-HsiaoChenNeural")
ENDPOINT = f"https://{REGION}.tts.speech.microsoft.com/cognitiveservices/v1"


def synthesize(text, pitch, rate_pct, volume_db):
    ssml = (
        '<speak version="1.0" xml:lang="zh-TW">'
        f'<voice name="{VOICE}">'
        f'<prosody rate="{rate_pct:+.2f}%" pitch="{pitch:+.2f}st" volume="{volume_db:+.2f}dB">'
        f"{escape(text)}"
        "</prosody></voice></speak>"
    )
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


def main():
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
                if e.code == 429 or attempt < 3:
                    time.sleep(2 * (attempt + 1))
                else:
                    errors.append((item["path"], item["text"], f"{e.code}: {body[:200]}"))
            except Exception as e:  # noqa: BLE001 - one-off batch script, log and continue
                if attempt < 3:
                    time.sleep(2 * (attempt + 1))
                else:
                    errors.append((item["path"], item["text"], str(e)))
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
