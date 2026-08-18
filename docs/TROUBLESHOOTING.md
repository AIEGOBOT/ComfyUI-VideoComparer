# Troubleshooting / 문제 해결

[English](#english) · [한국어](#한국어)

## English

### The node does not appear

1. Confirm that `ComfyUI/custom_nodes/ComfyUI-VideoComparer/__init__.py` exists.
2. Restart ComfyUI; a browser refresh alone does not import Python nodes.
3. Check the startup log and use the first relevant `import failed` or traceback.
4. Confirm ComfyUI is `0.33.1+` and Python is `3.10+`.
5. Hard-refresh the browser after the server starts.

### The example workflow reports a missing node

Search for `Video Comparer (Swipe)` or node ID `IndiVideoComparer`. If that node is
missing, complete the installation checks above. `SaveVideo`, `LoadVideo`,
`CreateVideo`, `SolidMask`, and `MaskToImage` are core ComfyUI nodes; update ComfyUI
if one of those is missing.

### A video cannot connect to `video_a` or `video_b`

Both inputs require the core `VIDEO` type. Use the core `Load Video` node. Outputs
such as `VHS_FILENAMES` from VideoHelperSuite are different types and cannot connect
directly.

### The preview is empty or stays on “Waiting for preview”

- Connect both `VIDEO` inputs.
- Queue the workflow once after changing an input.
- Wait for both temporary previews to finish encoding.
- Open the browser developer console and the ComfyUI server log if loading fails.

### The videos drift or jump

The node deliberately corrects video B when the difference exceeds
`sync_tolerance_ms`. A very small value can cause more visible corrections. Try the
default `80 ms`. Inputs with very different frame rates, duration metadata, or damaged
timestamps may still seek differently in the browser.

### The comparison stops earlier than one source

This is expected. The shared duration is the shorter of the two inputs so both sides
remain valid for the entire comparison.

### `REC` is disabled or recording does not start

- Wait for both previews to load.
- Use a current Chromium-based browser.
- Confirm the page is not blocking browser media APIs.
- Try muted recording if the input audio format is not supported by the browser.

### Recording finishes but `Save Video` does not run

Connect `recorded_video` to the core `Save Video` node before starting `REC`. Queue
once to load the preview, start and stop recording with the same button, and wait for
the upload to finish. The node then updates `recording_file` and re-queues the path.

### The browser downloads a WebM file

The browser preserves a fallback download when upload or automatic re-queue fails.
Keep the file, then inspect the browser console and ComfyUI log. Common causes are a
stopped server, a proxy or size limit, or a workflow changed during recording.

### A recording is rejected

Recordings are limited to 120 seconds and 512 MiB. Shorten the recording. Extremely
large browser captures may reach the size limit before the time limit.

### Where files are stored

- Temporary previews: ComfyUI temp directory, under `video_comparer`.
- Completed recordings: `ComfyUI/input/video_comparer_recordings`.
- Core `Save Video` results: the location configured by that core node.

When opening an issue, use the
[bug report form](https://github.com/AIEGOBOT/ComfyUI-VideoComparer/issues/new/choose)
and remove private data from logs and workflows.

## 한국어

### 노드가 나타나지 않음

1. `ComfyUI/custom_nodes/ComfyUI-VideoComparer/__init__.py`가 있는지 확인합니다.
2. ComfyUI를 재시작합니다. 브라우저 새로고침만으로는 Python 노드가 로드되지 않습니다.
3. 시작 로그에서 관련된 첫 번째 `import failed` 또는 traceback을 확인합니다.
4. ComfyUI가 `0.33.1+`, Python이 `3.10+`인지 확인합니다.
5. 서버가 시작된 뒤 브라우저를 강력 새로고침합니다.

### 예제 워크플로우에 누락된 노드가 표시됨

`Video Comparer (Swipe)` 또는 노드 ID `IndiVideoComparer`를 검색합니다. 없다면 위의
설치 확인을 진행합니다. `SaveVideo`, `LoadVideo`, `CreateVideo`, `SolidMask`,
`MaskToImage`는 ComfyUI 코어 노드이므로 이 노드가 없다면 ComfyUI를 업데이트합니다.

### 영상이 `video_a` 또는 `video_b`에 연결되지 않음

두 입력 모두 코어 `VIDEO` 타입이 필요합니다. 코어 `Load Video` 노드를 사용하세요.
VideoHelperSuite의 `VHS_FILENAMES` 같은 출력은 타입이 달라 바로 연결되지 않습니다.

### 미리보기가 비어 있거나 “Waiting for preview”에서 멈춤

- `VIDEO` 입력 두 개를 모두 연결합니다.
- 입력을 바꾼 뒤 워크플로우를 한 번 큐에 넣습니다.
- 두 임시 미리보기의 인코딩이 끝날 때까지 기다립니다.
- 로딩에 실패하면 브라우저 개발자 콘솔과 ComfyUI 서버 로그를 확인합니다.

### 영상이 어긋나거나 순간적으로 이동함

두 영상의 차이가 `sync_tolerance_ms`를 넘으면 비디오 B를 의도적으로 보정합니다.
값이 너무 작으면 보정이 더 자주 보일 수 있으므로 기본값 `80 ms`를 사용해 보세요.
프레임률, 길이 메타데이터나 타임스탬프 상태가 크게 다른 입력은 브라우저 탐색 결과가
다를 수 있습니다.

### 한쪽 원본보다 비교가 일찍 끝남

정상 동작입니다. 전체 비교 구간에서 두 영상이 모두 유효하도록 더 짧은 입력의
길이를 공통 재생 길이로 사용합니다.

### `REC`가 비활성화되거나 녹화가 시작되지 않음

- 두 미리보기의 로딩이 끝날 때까지 기다립니다.
- 최신 Chromium 계열 브라우저를 사용합니다.
- 페이지에서 브라우저 미디어 API를 차단하지 않는지 확인합니다.
- 입력 오디오 형식을 브라우저가 지원하지 않으면 음소거 녹화를 시도합니다.

### 녹화는 끝났지만 `Save Video`가 실행되지 않음

`REC`를 시작하기 전에 `recorded_video`를 코어 `Save Video`에 연결합니다. 미리보기를
위해 큐를 한 번 실행하고, 같은 버튼으로 녹화를 시작하고 끝낸 뒤 업로드가 완료될
때까지 기다립니다. 이후 노드가 `recording_file`을 갱신하고 저장 경로를 다시 실행합니다.

### 브라우저에서 WebM 파일이 다운로드됨

업로드 또는 자동 큐가 실패하면 브라우저가 백업 파일을 보존합니다. 파일은 유지한
채 브라우저 콘솔과 ComfyUI 로그를 확인하세요. 서버 중단, 프록시나 크기 제한 또는
녹화 중 워크플로우 변경이 원인일 수 있습니다.

### 녹화가 거부됨

녹화는 120초와 512MiB로 제한됩니다. 녹화 시간을 줄이세요. 브라우저 캡처 용량이
매우 크면 시간 제한보다 먼저 용량 제한에 도달할 수 있습니다.

### 파일 저장 위치

- 임시 미리보기: ComfyUI temp 폴더 아래 `video_comparer`.
- 완성된 녹화: `ComfyUI/input/video_comparer_recordings`.
- 코어 `Save Video` 결과: 해당 코어 노드에서 지정한 위치.

이슈를 작성할 때는 [버그 신고 양식](https://github.com/AIEGOBOT/ComfyUI-VideoComparer/issues/new/choose)을
사용하고 로그와 워크플로우에서 개인정보를 제거해 주세요.
