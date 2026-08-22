# ComfyUI Video Comparer

<img src="assets/registry-banner.png" width="100%" alt="ComfyUI Video Comparer banner">

[![Validate](https://github.com/AIEGOBOT/ComfyUI-VideoComparer/actions/workflows/validate.yml/badge.svg)](https://github.com/AIEGOBOT/ComfyUI-VideoComparer/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[English](#english) · [한국어](#한국어)

Compare two core ComfyUI `VIDEO` inputs with a synchronized swipe preview, then
record the comparison and send it to the core `Save Video` node.

ComfyUI 코어 `VIDEO` 두 개를 동기화된 스와이프로 비교하고, 비교 장면을 녹화해
코어 `Save Video` 노드로 전달합니다.

## English

### Features

- Synchronized play, pause, seek, loop, and drift correction.
- Move the divider anywhere in the preview to reveal video B over video A.
- A/B labels, responsive preview, audio toggle, and 50% reset.
- Browser recording of the video, divider, handle, and labels.
- Direct `recorded_video` output for the core `Save Video` node.
- No models or third-party Python packages.

### Requirements and installation

- ComfyUI `0.33.1` or newer.
- Python `3.10` or newer.
- A current Chromium-based browser is recommended for recording.

Install `video-comparer` from ComfyUI Manager, or clone it manually:

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/AIEGOBOT/ComfyUI-VideoComparer.git
```

Restart ComfyUI and refresh the browser. There is no `requirements.txt` because
the node has no additional Python dependencies.

### Quickstart

1. Add two core `Load Video` nodes.
2. Add `Video Comparer (Swipe)` from `video/preview`.
3. Connect the original to `video_a` and the comparison to `video_b`.
4. Connect `recorded_video` to the core `Save Video` node before recording.
5. Queue once, press `REC`, move the divider, and press `REC` again to stop.

The shared duration is the shorter input duration. Recording is limited to 2
minutes and 512 MiB. Before a recording exists, `recorded_video` intentionally
blocks execution so the first preview queue cannot save a source video.

For a model-free smoke test, open
[`example_workflows/video_comparer_smoke.json`](example_workflows/video_comparer_smoke.json).

### Inputs, output, and storage

| Item | Purpose |
|---|---|
| `video_a` | Base/original core `VIDEO` and optional audio source. |
| `video_b` | Comparison core `VIDEO`, revealed from the left. |
| `recorded_video` | Latest swipe recording for core `Save Video`. |

Temporary previews use ComfyUI's temp directory. Completed WebM recordings remain
in `ComfyUI/input/video_comparer_recordings` until deleted. Videos stay on the
local ComfyUI server and browser.

If the node is missing, restart ComfyUI, refresh the browser, and inspect the
startup log. If a preview is empty, connect two core `VIDEO` inputs and queue once.
Use the core `Load Video` node for MP4 files; `VHS_FILENAMES` is a different type.

## 한국어

### 기능

- 재생, 일시정지, 탐색, 반복과 재생 오차 자동 보정.
- 미리보기에서 구분선을 움직여 비디오 A 위에 비디오 B를 표시.
- A/B 라벨, 반응형 미리보기, 오디오 버튼과 50% 초기화.
- 영상, 구분선, 핸들과 라벨을 함께 브라우저에서 녹화.
- 코어 `Save Video`로 연결하는 `recorded_video` 출력.
- 추가 모델과 외부 Python 패키지가 필요하지 않음.

### 요구 사항과 설치

- ComfyUI `0.33.1` 이상.
- Python `3.10` 이상.
- 녹화에는 최신 Chromium 계열 브라우저 권장.

ComfyUI Manager에서 `video-comparer`를 설치하거나 다음 명령으로 설치합니다.

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/AIEGOBOT/ComfyUI-VideoComparer.git
```

ComfyUI를 재시작하고 브라우저를 새로고침합니다. 추가 Python 의존성이 없으므로
`requirements.txt`는 없습니다.

### 빠른 사용법

1. 코어 `Load Video` 노드 두 개를 추가합니다.
2. `video/preview`에서 `Video Comparer (Swipe)`를 추가합니다.
3. 원본을 `video_a`, 비교 영상을 `video_b`에 연결합니다.
4. 녹화 전에 `recorded_video`를 코어 `Save Video`에 연결합니다.
5. 큐를 한 번 실행한 뒤 `REC`를 누르고 구분선을 움직인 다음 다시 눌러 끝냅니다.

비교 길이는 더 짧은 입력에 맞춰지며 녹화는 최대 2분, 512MiB입니다. 녹화물이
생기기 전에는 첫 미리보기 큐가 원본을 저장하지 않도록 출력 실행을 차단합니다.

모델과 입력 파일이 필요 없는 테스트는
[`example_workflows/video_comparer_smoke.json`](example_workflows/video_comparer_smoke.json)을
사용합니다.

완성된 WebM은 사용자가 삭제할 때까지
`ComfyUI/input/video_comparer_recordings`에 남습니다. 영상은 로컬 ComfyUI 서버와
브라우저에서만 처리됩니다.

노드가 보이지 않으면 ComfyUI를 재시작하고 브라우저를 새로고침한 뒤 시작 로그를
확인합니다. 미리보기가 비어 있으면 코어 `VIDEO` 두 개를 연결하고 큐를 실행합니다.
MP4는 코어 `Load Video`로 불러와야 하며 `VHS_FILENAMES`는 다른 타입입니다.

## License / 라이선스

MIT. See [`LICENSE`](LICENSE). / MIT 라이선스입니다.
