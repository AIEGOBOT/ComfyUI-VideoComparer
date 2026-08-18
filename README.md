# ComfyUI Video Comparer

[English](#english) · [한국어](#한국어)

<a href="docs/assets/video-comparer-demo.mp4">
  <img src="docs/assets/video-comparer-demo-poster.jpg" width="420" alt="Video Comparer swipe recording example">
</a>

Click the image to open the example recording.

이미지를 누르면 예제 녹화 영상을 볼 수 있습니다.

## English

`Video Comparer (Swipe)` previews two core ComfyUI `VIDEO` inputs in sync inside one node. Video A is the base/original and video B is progressively revealed as the divider moves from left to right.

The node can record the live swipe interaction and pass the browser recording directly to ComfyUI's core `Save Video` node.

### Features

- Native core `VIDEO` inputs and output.
- Synchronized play, pause, seek, loop, and drift correction.
- Hover or drag anywhere in the preview to move the divider.
- Responsive in-node preview with A/B labels and a 50% reset button.
- Optional audio from video A; video B always remains muted.
- Browser recording of the video, divider, handle, and labels.
- Automatic re-queue after recording when `recorded_video` is connected.
- No third-party Python dependencies or model requirements.
- Safety limits: 2-minute/512 MiB recording cap and bounded temporary previews.

### Compatibility

- ComfyUI `0.33.1` or newer.
- Python `3.10` or newer.
- A current Chromium-based browser is recommended for browser recording.
- Tested on ComfyUI `0.33.1`, frontend `1.48.7`, and Python `3.12.10`.

### Installation

In ComfyUI Manager, choose **Install via Git URL** and enter:

```text
https://github.com/AIEGOBOT/ComfyUI-VideoComparer.git
```

For a manual install, run this from `ComfyUI/custom_nodes` and restart ComfyUI:

```bash
git clone https://github.com/AIEGOBOT/ComfyUI-VideoComparer.git
```

### Quickstart

1. Add two core `Load Video` nodes.
2. Add `Video Comparer (Swipe)` from `video/preview`.
3. Connect the original video to `video_a` and the comparison video to `video_b`.
4. Connect `recorded_video` to the core `Save Video` node.
5. Queue once to create the synchronized preview.
6. Press `REC`, move the divider, then press the recording button again.
7. The browser uploads the recording and re-queues the connected save path.

The shared comparison duration is the shorter input duration. The browser recording is limited to 2 minutes and 512 MiB.

### Example files

- [`video_comparer_smoke.json`](example_workflows/video_comparer_smoke.json): portable red/blue test that needs no input files or model.
- [`video_comparer_load_and_record.json`](example_workflows/video_comparer_load_and_record.json): practical two-video load, compare, record, and save layout.
- [`video-comparer-demo.mp4`](docs/assets/video-comparer-demo.mp4): real swipe recording shown above.
- [Full node reference](docs/IndiVideoComparer.md)

### Node reference

| Port | Type | Description |
|---|---|---|
| `video_a` | `VIDEO` | Base/original video and optional audio source. |
| `video_b` | `VIDEO` | Comparison video progressively revealed from the left. |
| `recorded_video` | `VIDEO` | Latest completed swipe recording for core `Save Video`. |

Before a recording exists, `recorded_video` returns an execution blocker so the initial preview queue does not accidentally save a source video.

Temporary MP4 previews are written under ComfyUI's temp directory. The node retains only the 12 most recent preview files, and ComfyUI clears its temp directory at startup and shutdown. Completed browser recordings are stored under `input/video_comparer_recordings` until you remove them.

### Troubleshooting

- **Empty preview:** connect both core `VIDEO` inputs and queue once.
- **An MP4 will not connect:** use core `Load Video`; `VHS_FILENAMES` is a different type.
- **Recording did not reach Save Video:** connect `recorded_video` before recording, then stop the recording with the same button.
- **A WebM downloaded in the browser:** upload or automatic queueing failed, so the browser preserved a fallback copy.
- **Comparison ends early:** the shared duration intentionally uses the shorter input.
- **Browser recording will not start:** use a current Chromium-based browser and wait for both previews to load.

## 한국어

`Video Comparer (Swipe)`는 ComfyUI 코어 `VIDEO` 입력 두 개를 하나의 노드 안에서 동기화해 재생합니다. 비디오 A는 원본이고, 구분선을 왼쪽에서 오른쪽으로 움직일수록 비디오 B가 더 많이 나타납니다.

실시간 스와이프 조작 화면을 브라우저에서 녹화하고, 그 결과를 ComfyUI 코어 `Save Video` 노드로 바로 전달할 수도 있습니다.

### 주요 기능

- ComfyUI 코어 `VIDEO` 입출력 사용.
- 재생, 일시정지, 탐색, 반복과 재생 오차 자동 보정.
- 미리보기 위에서 마우스를 움직이거나 드래그해 구분선 조작.
- 노드 크기에 맞게 반응하는 미리보기, A/B 라벨과 50% 초기화 버튼.
- 비디오 A의 오디오를 선택적으로 사용하며 비디오 B는 항상 음소거.
- 영상, 구분선, 핸들, 라벨을 함께 브라우저에서 녹화.
- `recorded_video`가 연결되어 있으면 녹화 후 워크플로우 자동 재실행.
- 추가 Python 의존성과 모델이 필요하지 않음.
- 녹화 2분/512MiB 제한과 임시 미리보기 개수 제한 적용.

### 호환성

- ComfyUI `0.33.1` 이상.
- Python `3.10` 이상.
- 브라우저 녹화에는 최신 Chromium 계열 브라우저 권장.
- ComfyUI `0.33.1`, 프론트엔드 `1.48.7`, Python `3.12.10`에서 확인.

### 설치

ComfyUI Manager에서 **Install via Git URL**을 선택하고 다음 주소를 입력합니다.

```text
https://github.com/AIEGOBOT/ComfyUI-VideoComparer.git
```

수동 설치는 `ComfyUI/custom_nodes`에서 다음 명령을 실행한 뒤 ComfyUI를 재시작합니다.

```bash
git clone https://github.com/AIEGOBOT/ComfyUI-VideoComparer.git
```

### 빠른 사용법

1. 코어 `Load Video` 노드 두 개를 추가합니다.
2. `video/preview` 카테고리에서 `Video Comparer (Swipe)`를 추가합니다.
3. 원본을 `video_a`, 비교 영상을 `video_b`에 연결합니다.
4. `recorded_video`를 코어 `Save Video`에 연결합니다.
5. 한 번 큐를 실행해 동기화 미리보기를 만듭니다.
6. `REC`를 누르고 구분선을 움직인 뒤 같은 버튼을 다시 눌러 녹화를 끝냅니다.
7. 브라우저가 녹화물을 업로드하고 연결된 저장 경로를 자동으로 다시 실행합니다.

비교 길이는 두 입력 중 더 짧은 영상에 맞춰집니다. 브라우저 녹화는 최대 2분과 512MiB로 제한됩니다.

### 예제 파일

- [`video_comparer_smoke.json`](example_workflows/video_comparer_smoke.json): 입력 파일과 모델 없이 실행되는 빨강/파랑 테스트.
- [`video_comparer_load_and_record.json`](example_workflows/video_comparer_load_and_record.json): 영상 두 개를 불러와 비교·녹화·저장하는 실사용 구성.
- [`video-comparer-demo.mp4`](docs/assets/video-comparer-demo.mp4): 위 대표 이미지에 사용한 실제 스와이프 녹화 영상.
- [상세 노드 설명](docs/IndiVideoComparer.md)

### 노드 입출력

| 포트 | 타입 | 설명 |
|---|---|---|
| `video_a` | `VIDEO` | 원본 영상이며 선택적 오디오 소스입니다. |
| `video_b` | `VIDEO` | 왼쪽부터 점차 나타나는 비교 영상입니다. |
| `recorded_video` | `VIDEO` | 코어 `Save Video`로 보낼 최근 스와이프 녹화입니다. |

녹화 전에는 `recorded_video`가 실행 차단 값을 반환하므로 첫 미리보기 실행에서 원본 영상이 실수로 저장되지 않습니다.

임시 MP4 미리보기는 ComfyUI의 temp 폴더에 저장됩니다. 노드는 최근 12개만 유지하며 ComfyUI도 시작과 종료 시 temp 폴더를 정리합니다. 완성된 브라우저 녹화는 사용자가 지울 때까지 `input/video_comparer_recordings`에 보관됩니다.

### 문제 해결

- **미리보기가 비어 있음:** 코어 `VIDEO` 두 개를 연결하고 한 번 큐를 실행합니다.
- **MP4가 연결되지 않음:** 코어 `Load Video`를 사용합니다. `VHS_FILENAMES`는 다른 타입입니다.
- **녹화가 Save Video로 전달되지 않음:** 녹화 전에 `recorded_video`를 연결하고 같은 버튼으로 녹화를 종료합니다.
- **브라우저에서 WebM이 다운로드됨:** 업로드 또는 자동 큐 실행에 실패해 브라우저가 백업 파일을 보존한 것입니다.
- **비교가 일찍 종료됨:** 의도적으로 더 짧은 입력 영상의 길이를 사용합니다.
- **브라우저 녹화가 시작되지 않음:** 최신 Chromium 계열 브라우저를 사용하고 두 미리보기 로딩이 끝날 때까지 기다립니다.

## License / 라이선스

MIT. See [`LICENSE`](LICENSE). / MIT 라이선스입니다.
