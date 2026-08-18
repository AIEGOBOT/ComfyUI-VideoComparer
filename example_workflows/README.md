# Example workflows / 예제 워크플로우

## `video_comparer_smoke.json`

Creates short red and blue videos with core nodes, compares them, and connects the recording output to `Save Video`. It needs no model or input file and is the fastest compatibility test.

코어 노드로 짧은 빨강·파랑 영상을 만들고 비교한 뒤 녹화 출력을 `Save Video`에 연결합니다. 모델과 입력 파일이 필요 없어 가장 빠른 호환성 테스트입니다.

## `video_comparer_load_and_record.json`

A practical layout based on the author's working workflow. Upload or select an original video in the first `Load Video` node and a comparison video in the second, then queue once before recording.

실제 사용 중인 워크플로우를 공개용으로 정리한 구성입니다. 첫 번째 `Load Video`에서 원본을, 두 번째 노드에서 비교 영상을 선택하거나 업로드한 뒤 녹화 전에 한 번 큐를 실행합니다.
