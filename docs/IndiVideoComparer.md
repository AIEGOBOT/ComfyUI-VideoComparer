# Video Comparer (Swipe)

[English](#english) · [한국어](#한국어)

- Node ID: `IndiVideoComparer`
- Category: `video/preview`

[Installation](INSTALLATION.md) · [Troubleshooting](TROUBLESHOOTING.md) ·
[Example workflows](../example_workflows/README.md)

## English

### Purpose

Compare two core ComfyUI `VIDEO` values in a synchronized swipe preview. Video A is the base/original and video B is progressively revealed from left to right.

### Inputs

| Input | Type | Purpose |
|---|---|---|
| `video_a` | `VIDEO` | Base/original video and optional preview audio source. |
| `video_b` | `VIDEO` | Improved or comparison video. |
| `label_a` | `STRING` | Overlay label for video A. |
| `label_b` | `STRING` | Overlay label for video B. |
| `autoplay` | `BOOLEAN` | Start synchronized playback automatically. |
| `loop` | `BOOLEAN` | Restart both videos at the end of the shared duration. |
| `muted` | `BOOLEAN` | Mute or enable audio from video A. Video B remains muted. |
| `initial_split` | `FLOAT` | Initial B reveal position from `0.05` to `0.95`. |
| `sync_tolerance_ms` | `INT` | Maximum drift before video B is resynchronized. |
| `recording_file` | `STRING` | Internal state containing the latest browser recording filename. |

### Output

| Output | Type | Purpose |
|---|---|---|
| `recorded_video` | `VIDEO` | Latest completed swipe recording for core `Save Video`. |

Before a recording exists, `recorded_video` returns an execution blocker. This prevents a connected `Save Video` node from writing a source video during the initial preview queue.

### Preview and recording behavior

- Hover or drag over the preview to move the divider.
- Play, pause, seek, loop, reset-to-50%, and A-audio mute controls are synchronized.
- Mouse-wheel input over the preview is forwarded to the ComfyUI canvas zoom.
- The shared duration is the shorter input duration.
- Recording captures the composite video, divider, handle, and A/B labels.
- Recordings are limited to 2 minutes and 512 MiB.
- The latest 12 generated MP4 preview files are retained during a server session.

To record, connect `recorded_video` to core `Save Video`, queue once, press `REC`, interact with the divider, and press the recording button again. The browser uploads the WebM under `input/video_comparer_recordings`, updates `recording_file`, and re-queues the connected output. If upload fails, the browser downloads a fallback WebM.

## 한국어

### 목적

ComfyUI 코어 `VIDEO` 값 두 개를 동기화된 스와이프 미리보기로 비교합니다. 비디오 A가 원본이고, 구분선을 왼쪽에서 오른쪽으로 움직일수록 비디오 B가 점차 나타납니다.

### 입력

| 입력 | 타입 | 용도 |
|---|---|---|
| `video_a` | `VIDEO` | 원본 영상이며 선택적 미리보기 오디오 소스입니다. |
| `video_b` | `VIDEO` | 개선본 또는 비교 영상입니다. |
| `label_a` | `STRING` | 비디오 A에 표시할 라벨입니다. |
| `label_b` | `STRING` | 비디오 B에 표시할 라벨입니다. |
| `autoplay` | `BOOLEAN` | 미리보기를 자동으로 재생합니다. |
| `loop` | `BOOLEAN` | 공통 재생 길이 끝에서 두 영상을 다시 시작합니다. |
| `muted` | `BOOLEAN` | 비디오 A의 오디오를 끄거나 켭니다. 비디오 B는 항상 음소거됩니다. |
| `initial_split` | `FLOAT` | 처음 표시할 B 영역의 비율이며 `0.05`부터 `0.95`까지입니다. |
| `sync_tolerance_ms` | `INT` | 이 값을 넘는 재생 오차가 생기면 비디오 B를 다시 동기화합니다. |
| `recording_file` | `STRING` | 최근 브라우저 녹화 파일명을 보관하는 내부 상태입니다. |

### 출력

| 출력 | 타입 | 용도 |
|---|---|---|
| `recorded_video` | `VIDEO` | 코어 `Save Video`로 보낼 최근 스와이프 녹화입니다. |

녹화 전에는 `recorded_video`가 실행 차단 값을 반환합니다. 따라서 첫 미리보기 실행에서 연결된 `Save Video`가 원본 영상을 잘못 저장하지 않습니다.

### 미리보기와 녹화 동작

- 미리보기 위에서 마우스를 움직이거나 드래그해 구분선을 조절합니다.
- 재생, 일시정지, 탐색, 반복, 50% 초기화와 A 오디오 음소거가 동기화됩니다.
- 미리보기 위의 마우스 휠 입력은 ComfyUI 캔버스 확대·축소로 전달됩니다.
- 공통 재생 길이는 두 입력 중 더 짧은 영상에 맞춰집니다.
- 합성 영상, 구분선, 핸들과 A/B 라벨을 함께 녹화합니다.
- 녹화는 최대 2분과 512MiB로 제한됩니다.
- 서버 세션 중에는 최근 MP4 미리보기 파일 12개만 유지합니다.

녹화하려면 `recorded_video`를 코어 `Save Video`에 연결하고 한 번 큐를 실행합니다. `REC`를 누른 뒤 구분선을 조작하고 같은 버튼을 다시 누릅니다. 브라우저는 WebM을 `input/video_comparer_recordings`에 업로드하고 `recording_file`을 갱신한 뒤 연결된 출력을 자동으로 다시 실행합니다. 업로드에 실패하면 브라우저가 백업 WebM을 다운로드합니다.
