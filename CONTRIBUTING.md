# Contributing / 기여 안내

[English](#english) · [한국어](#한국어)

Thank you for helping improve ComfyUI Video Comparer.

ComfyUI Video Comparer를 더 좋게 만드는 데 관심을 가져주셔서 감사합니다.

## English

### Before opening an issue

- Check the [troubleshooting guide](docs/TROUBLESHOOTING.md).
- Search existing issues to avoid duplicates.
- Remove private paths, API keys, prompts, and personal media from logs and workflows.
- For a security problem, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

### Bug reports

Please include:

- ComfyUI and frontend versions.
- Python version, operating system, and browser.
- The exact steps needed to reproduce the problem.
- The first relevant traceback or browser-console error.
- A minimal workflow JSON when it is safe to share.

### Pull requests

1. Fork the repository and create a focused branch.
2. Keep behavior changes small and explain the user-facing effect.
3. Add or update tests and bilingual documentation when appropriate.
4. Run the checks below before submitting the pull request.

```bash
python -m py_compile __init__.py nodes.py utils.py tests/test_utils.py
python -m unittest discover -s tests -v
node --check web/video_comparer_v7.js
```

For frontend or recording changes, also test in a real ComfyUI session with two core
`VIDEO` inputs and the core `Save Video` node. Do not commit generated recordings,
temporary previews, private workflows, or credentials.

## 한국어

### 이슈를 작성하기 전에

- [문제 해결 안내](docs/TROUBLESHOOTING.md)를 확인합니다.
- 중복 이슈가 없는지 기존 이슈를 검색합니다.
- 로그와 워크플로우에서 개인 경로, API 키, 프롬프트와 개인 미디어를 제거합니다.
- 보안 문제는 공개 이슈 대신 [SECURITY.md](SECURITY.md)의 비공개 신고 방법을 사용합니다.

### 버그 신고

다음 정보를 포함해 주세요.

- ComfyUI와 프론트엔드 버전.
- Python 버전, 운영체제와 브라우저.
- 문제를 재현하는 정확한 순서.
- 관련된 첫 번째 traceback 또는 브라우저 콘솔 오류.
- 안전하게 공유할 수 있는 최소 워크플로우 JSON.

### Pull Request

1. 저장소를 Fork하고 하나의 목적에 집중한 브랜치를 만듭니다.
2. 동작 변경은 작게 유지하고 사용자에게 어떤 변화가 생기는지 설명합니다.
3. 필요한 경우 테스트와 한글·영문 문서를 함께 갱신합니다.
4. Pull Request를 보내기 전에 위의 검사 명령을 실행합니다.

프론트엔드나 녹화 기능을 바꿨다면 실제 ComfyUI에서 코어 `VIDEO` 입력 두 개와
코어 `Save Video` 노드를 연결해 확인해 주세요. 생성된 녹화물, 임시 미리보기,
개인 워크플로우와 인증 정보는 커밋하지 마세요.
