# Video Comparer (Swipe)

Node ID: `IndiVideoComparer`

Category: `video/preview`

## Purpose

Compare two core ComfyUI `VIDEO` values in a synchronized swipe preview. Video A is the base/original and video B is the improved version. Moving the pointer from left to right reveals more of video B.

## Inputs

| Input | Type | Purpose |
|---|---|---|
| `video_a` | `VIDEO` | Base/original video and optional preview audio source. |
| `video_b` | `VIDEO` | Improved/comparison video. |
| `label_a` | `STRING` | Overlay label for video A. |
| `label_b` | `STRING` | Overlay label for video B. |
| `autoplay` | `BOOLEAN` | Start synchronized playback automatically. |
| `loop` | `BOOLEAN` | Restart both videos at the end of their shared duration. |
| `muted` | `BOOLEAN` | Mute or enable audio from video A. Video B always remains muted. |
| `initial_split` | `FLOAT` | Initial B reveal position from `0.0` to `1.0`. |
| `sync_tolerance_ms` | `INT` | Maximum allowed playback drift before video B is resynchronized. |
| `recording_file` | `STRING` | Advanced internal state containing the latest browser recording filename. |

## Output

| Output | Type | Purpose |
|---|---|---|
| `recorded_video` | `VIDEO` | Latest completed swipe recording for the core `Save Video` node. |

Before a recording exists, `recorded_video` returns an execution blocker. This prevents a connected `Save Video` node from writing one of the source videos during the initial preview queue.

## Preview behavior

- Hover or drag over the preview to move the divider.
- Moving left to right reveals progressively more of video B.
- Play, pause, seek, loop, reset-to-50%, and A-audio mute controls are synchronized.
- Mouse-wheel input over the preview is forwarded to the ComfyUI canvas zoom.
- Resizing the node refits the preview while playing or paused.
- The shared comparison duration is the shorter of the two input videos.

## Recording behavior

1. Connect `recorded_video` to core `Save Video`.
2. Queue once to build the A/B preview.
3. Press `REC` and move the divider as desired.
4. Press the recording button again.

The browser records the composite preview, uploads a WebM file to ComfyUI's `input/video_comparer_recordings` subfolder, updates `recording_file`, and queues the workflow automatically. Core `Save Video` controls the final container, codec, and output path.

When browser audio capture is supported and the preview is unmuted, audio from video A is included. If upload fails, the browser downloads a fallback WebM so the recording is not lost.
