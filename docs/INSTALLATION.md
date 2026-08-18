# Installation, update, and uninstall / 설치·업데이트·삭제

[English](#english) · [한국어](#한국어)

Official ComfyUI references:
[custom-node installation](https://docs.comfy.org/installation/install_custom_node) ·
[new Manager UI](https://docs.comfy.org/manager/pack-management) ·
[legacy Manager UI](https://docs.comfy.org/manager/legacy-ui)

## English

### Requirements

- ComfyUI `0.33.1` or newer.
- Python `3.10` or newer.
- ComfyUI Manager for the recommended Registry installation.

This node does not download models and has no third-party Python dependencies.

### Option A: ComfyUI Manager

Use this method after `video-comparer` is available in the Comfy Registry.

1. Open ComfyUI.
2. Open **Manager** → **Custom Nodes**.
3. Set the search type to **Node Pack**.
4. Search for `video-comparer` or `ComfyUI Video Comparer`.
5. Confirm that the publisher is `aiegobot`.
6. Select a stable numbered version and click **Install**.
7. Restart ComfyUI and refresh the browser.

The current Manager UI only installs Registry packages and does not have an
**Install via Git URL** option. If the search returns no result, use Option B.

In the legacy Manager UI, open **Manager** → **Install Nodes**, search for the same
package, choose a stable numbered version, install, and restart ComfyUI.

### Option B: manual Git installation

Git must be installed. Open a terminal and move to your exact ComfyUI custom-node
directory:

```bash
cd /path/to/ComfyUI/custom_nodes
git clone https://github.com/AIEGOBOT/ComfyUI-VideoComparer.git
```

The final layout must contain this file directly:

```text
ComfyUI/custom_nodes/ComfyUI-VideoComparer/__init__.py
```

Do not leave an extra nested folder such as
`ComfyUI-VideoComparer/ComfyUI-VideoComparer/__init__.py`.

Restart ComfyUI and refresh the browser. No `pip install` step is required for this
project.

### Option C: ZIP installation

1. On GitHub, choose **Code → Download ZIP**.
2. Extract the archive.
3. Copy the extracted folder to `ComfyUI/custom_nodes`.
4. Make sure the folder layout matches the example above.
5. Restart ComfyUI and refresh the browser.

ZIP installation works without Git, but updating is easier with Manager or Git.

### Verify the installation

1. Search the node menu for `Video Comparer (Swipe)`.
2. It should appear under `video/preview`.
3. Import `example_workflows/video_comparer_smoke.json`.
4. Queue once. Red and blue synchronized videos should appear.

If the node is missing, check the ComfyUI startup log for the first `import failed`
or traceback and see [Troubleshooting](TROUBLESHOOTING.md).

### Update

In the current Manager UI, select the **Update available** filter, open this package,
choose the desired stable version, click **Update**, and restart ComfyUI.

For a Git installation:

```bash
cd /path/to/ComfyUI/custom_nodes/ComfyUI-VideoComparer
git pull --ff-only
```

Restart ComfyUI and hard-refresh the browser after updating.

### Uninstall

In Manager, filter by **Installed**, select this package, and click **Uninstall**.
Restart ComfyUI afterward.

For a manual installation, stop ComfyUI and delete only the exact
`ComfyUI/custom_nodes/ComfyUI-VideoComparer` folder, then start ComfyUI again.
Completed recordings in `ComfyUI/input/video_comparer_recordings` are user files and
are not removed automatically.

## 한국어

### 필요 환경

- ComfyUI `0.33.1` 이상.
- Python `3.10` 이상.
- 권장 Registry 설치 방법에는 ComfyUI Manager가 필요합니다.

이 노드는 모델을 내려받지 않으며 추가 Python 패키지도 필요하지 않습니다.

### 방법 A: ComfyUI Manager

`video-comparer`가 Comfy Registry에 공개된 뒤 사용하는 권장 방법입니다.

1. ComfyUI를 엽니다.
2. **Manager** → **Custom Nodes**를 엽니다.
3. 검색 종류를 **Node Pack**으로 맞춥니다.
4. `video-comparer` 또는 `ComfyUI Video Comparer`를 검색합니다.
5. 게시자가 `aiegobot`인지 확인합니다.
6. 숫자로 표시된 안정 버전을 선택하고 **Install**을 누릅니다.
7. ComfyUI를 재시작하고 브라우저를 새로고침합니다.

현재 Manager 기본 화면은 Registry 패키지만 설치하며 **Install via Git URL** 메뉴가
없습니다. 검색 결과가 없다면 방법 B를 사용하세요.

레거시 Manager 화면에서는 **Manager** → **Install Nodes**를 열고 같은 패키지를
검색합니다. 숫자로 표시된 안정 버전을 설치한 뒤 ComfyUI를 재시작합니다.

### 방법 B: Git 수동 설치

Git이 설치되어 있어야 합니다. 터미널을 열고 실제 ComfyUI의 custom_nodes 폴더로
이동합니다.

```bash
cd /path/to/ComfyUI/custom_nodes
git clone https://github.com/AIEGOBOT/ComfyUI-VideoComparer.git
```

다음 파일이 이 구조로 바로 보여야 합니다.

```text
ComfyUI/custom_nodes/ComfyUI-VideoComparer/__init__.py
```

`ComfyUI-VideoComparer/ComfyUI-VideoComparer/__init__.py`처럼 같은 폴더가 한 번 더
중첩되면 안 됩니다.

ComfyUI를 재시작하고 브라우저를 새로고침합니다. 이 프로젝트에는 별도의
`pip install` 과정이 없습니다.

### 방법 C: ZIP 설치

1. GitHub에서 **Code → Download ZIP**을 누릅니다.
2. 압축을 풉니다.
3. 압축을 푼 폴더를 `ComfyUI/custom_nodes`로 복사합니다.
4. 위의 폴더 구조와 같은지 확인합니다.
5. ComfyUI를 재시작하고 브라우저를 새로고침합니다.

Git 없이도 설치할 수 있지만 업데이트는 Manager 또는 Git 설치가 더 편리합니다.

### 설치 확인

1. 노드 메뉴에서 `Video Comparer (Swipe)`를 검색합니다.
2. `video/preview` 카테고리에 나타나야 합니다.
3. `example_workflows/video_comparer_smoke.json`을 불러옵니다.
4. 큐를 한 번 실행하면 빨강·파랑 동기화 영상이 나타나야 합니다.

노드가 없다면 ComfyUI 시작 로그의 첫 번째 `import failed` 또는 traceback을 확인하고
[문제 해결](TROUBLESHOOTING.md)을 참고하세요.

### 업데이트

현재 Manager에서는 **Update available** 필터를 선택하고 이 패키지를 연 뒤, 원하는
안정 버전을 골라 **Update**를 누릅니다. 완료 후 ComfyUI를 재시작합니다.

Git으로 설치했다면 다음 명령을 사용합니다.

```bash
cd /path/to/ComfyUI/custom_nodes/ComfyUI-VideoComparer
git pull --ff-only
```

업데이트 후 ComfyUI를 재시작하고 브라우저를 강력 새로고침합니다.

### 삭제

Manager에서는 **Installed** 필터로 이 패키지를 찾고 **Uninstall**을 누른 뒤
ComfyUI를 재시작합니다.

수동 설치는 ComfyUI를 종료한 다음 정확한
`ComfyUI/custom_nodes/ComfyUI-VideoComparer` 폴더만 삭제하고 다시 시작합니다.
`ComfyUI/input/video_comparer_recordings`의 완성된 녹화는 사용자 파일이므로 자동으로
삭제되지 않습니다.
