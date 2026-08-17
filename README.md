# ComfyUI Video Comparer

`Video Comparer (Swipe)` previews two ComfyUI `VIDEO` inputs in sync inside one node. Video A is the base/original and video B is the improved version; moving the pointer from left to right progressively reveals more of video B.

The node can also record the live swipe interaction and pass the recording to ComfyUI's core `Save Video` node.

## Features

- Native `VIDEO` inputs; compatible with core `Load Video`, `Create Video`, and `Save Video` outputs.
- Synchronized play, pause, seek, and looping.
- Hover or drag anywhere in the preview to move the comparison divider.
- Mouse-wheel zoom is forwarded to the ComfyUI canvas while the pointer is over the preview.
- The preview remains fitted to the node while paused or playing when the node is resized.
- `REC` records the live swipe, divider, handle, and A/B labels at the source preview resolution.
- A `recorded_video` output can be connected directly to the core `Save Video` node.
- Video A/B labels and a reset-to-50% button.
- Optional audio from video A; video B always stays muted to prevent doubled audio.
- No third-party Python dependencies.

## Compatibility

- ComfyUI `0.33.1` or newer.
- Python `3.10` or newer.
- A current Chromium-based browser is recommended for browser-side recording.
- Uses ComfyUI's core `VIDEO`, `Load Video`, `Create Video`, and `Save Video` APIs. No model is required.

## Installation

### ComfyUI Manager

Use **Install via Git URL** and enter:

```text
https://github.com/AIEGOBOT/ComfyUI-VideoComparer.git
```

### Manual

From the `ComfyUI/custom_nodes` directory:

```bash
git clone https://github.com/AIEGOBOT/ComfyUI-VideoComparer.git
```

Restart ComfyUI after installation.

## Quickstart

1. Search for `Video Comparer (Swipe)` under `video/preview`.
2. Connect the original video to `video_a` and the improved video to `video_b`.
3. Connect `recorded_video` to the core `Save Video` node.
4. Queue the workflow once. The node creates browser-compatible temporary previews and displays them inside the node.
5. Press `REC`, move the divider, and press the button again. The recording is registered and the workflow is queued automatically so `Save Video` receives it.

An inexpensive red/blue smoke workflow is included at `example_workflows/video_comparer_smoke.json`.

The shared comparison duration is the shorter of the two videos. The preview files are written under ComfyUI's temporary directory and do not overwrite source videos or normal outputs.

Recordings are created in the browser, uploaded under ComfyUI input subfolder `video_comparer_recordings`, and exposed through `recorded_video`. If preview audio is unmuted, the recording includes audio from video A when the browser supports video stream audio capture. If upload fails, the browser downloads a fallback WebM copy so the recording is not lost.

## Node reference

| Port | Type | Description |
|---|---|---|
| `video_a` | `VIDEO` | Base/original video. Its audio is used when preview audio is enabled. |
| `video_b` | `VIDEO` | Improved/comparison video. It is revealed progressively from left to right. |
| `recorded_video` | `VIDEO` | The latest completed swipe recording, intended for core `Save Video`. Before recording, this output is blocked so source video is not saved accidentally. |

The node also provides labels, autoplay, loop, mute, initial divider position, synchronization tolerance, and an advanced `recording_file` state widget. See [the full node reference](docs/IndiVideoComparer.md).

## Troubleshooting

- **The preview is empty:** connect both `VIDEO` inputs and queue the workflow once.
- **An existing MP4 will not connect:** use two core `Load Video` nodes. `VHS_FILENAMES` is a different type from core `VIDEO`.
- **The recording did not reach `Save Video`:** connect `recorded_video` before pressing `REC`, then stop the recording with the same button.
- **The browser downloaded a WebM instead:** the upload failed, so the node preserved a fallback copy. Check the ComfyUI server log and upload-size settings.
- **The comparison ends early:** the shared preview duration is intentionally limited to the shorter input video.

## Notes

- `VHS_FILENAMES` is not the same as the core `VIDEO` type. For existing MP4 files, use two core `Load Video` nodes.
- The preview is encoded or remuxed as MP4/H.264 through ComfyUI's built-in video API for browser compatibility.

## License

MIT. See [LICENSE](LICENSE).
