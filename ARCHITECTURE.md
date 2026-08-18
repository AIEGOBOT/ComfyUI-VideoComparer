# Architecture

ComfyUI Video Comparer is a small hybrid ComfyUI extension. The backend uses the V3
`comfy_api` schema, while the interactive comparison and recording interface runs in
the browser.

## Components

- `__init__.py` registers the extension and exposes `web/` to the frontend.
- `nodes.py` defines `IndiVideoComparer`, creates temporary MP4 previews, accepts a
  bounded WebM upload, and returns the recording as a core `VIDEO` value.
- `utils.py` validates recording paths and prunes old preview files.
- `web/video_comparer_v7.js` synchronizes both preview videos, draws the swipe UI,
  records the composite canvas, uploads the result, and re-queues the workflow.
- `tests/test_utils.py` covers backend path and cleanup helpers without requiring a
  running ComfyUI instance.

## Recording flow

1. The backend converts both core `VIDEO` inputs to temporary MP4 previews.
2. The browser loads the previews and keeps playback synchronized.
3. `REC` captures the composite canvas and optional audio from video A as WebM.
4. The browser uploads the file to `/indi_video_comparer/recording`.
5. The backend stores it under `input/video_comparer_recordings`.
6. The browser writes the filename into `recording_file` and re-queues the workflow.
7. The backend returns that recording as `recorded_video` for core `Save Video`.

Before a recording exists, an execution blocker prevents the connected save node from
writing an input video by mistake.

## Boundaries

- No model downloads or third-party Python packages are required.
- Browser recording is capped at 120 seconds and 512 MiB.
- Only the latest 12 generated previews are retained during a server session.
- Video B is always muted; optional captured audio comes from video A.
