# Example workflows / 예제 워크플로우

Download a JSON file and drag it onto the ComfyUI canvas, or open it from
**Workflows → Open**. Install this node and restart ComfyUI first.

JSON 파일을 내려받아 ComfyUI 캔버스로 드래그하거나 **Workflows → Open**으로
불러옵니다. 먼저 이 노드를 설치하고 ComfyUI를 재시작하세요.

## `video_comparer_smoke.json`

Creates short red and blue videos with core nodes, compares them, and connects the recording output to `Save Video`. It needs no model or input file and is the fastest compatibility test.

코어 노드로 짧은 빨강·파랑 영상을 만들고 비교한 뒤 녹화 출력을 `Save Video`에 연결합니다. 모델과 입력 파일이 필요 없어 가장 빠른 호환성 테스트입니다.

Queue once, wait for both colors to appear, press `REC`, move the divider, and press
the same button again. The saved recording proves the full browser-to-ComfyUI path.

큐를 한 번 실행하고 두 색상이 나타나면 `REC`를 누릅니다. 구분선을 움직인 뒤 같은
버튼을 다시 누르세요. 결과가 저장되면 브라우저부터 ComfyUI까지의 전체 녹화 경로가
정상입니다.

## `video_comparer_load_and_record.json`

A practical layout based on the author's working workflow. Upload or select an original video in the first `Load Video` node and a comparison video in the second, then queue once before recording.

실제 사용 중인 워크플로우를 공개용으로 정리한 구성입니다. 첫 번째 `Load Video`에서 원본을, 두 번째 노드에서 비교 영상을 선택하거나 업로드한 뒤 녹화 전에 한 번 큐를 실행합니다.

Both inputs must use the core `VIDEO` type. The shared comparison stops at the shorter
input duration. Connect `recorded_video` to core `Save Video` before starting `REC`.

두 입력은 모두 코어 `VIDEO` 타입이어야 합니다. 비교는 더 짧은 입력의 길이에
맞춰집니다. `REC`를 누르기 전에 `recorded_video`를 코어 `Save Video`에 연결하세요.
