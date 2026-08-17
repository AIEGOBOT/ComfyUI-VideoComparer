from __future__ import annotations

import os
import uuid

import folder_paths
from aiohttp import web
from comfy_api.v0_0_2 import ComfyExtension, Input, InputImpl, Types, io, ui
from comfy_execution.graph_utils import ExecutionBlocker
from server import PromptServer


PREVIEW_SUBFOLDER = "video_comparer"
RECORDING_SUBFOLDER = "video_comparer_recordings"


def _preview_target(run_id: str, side: str) -> tuple[str, str]:
    filename = f"video_comparer_{run_id}_{side}.mp4"
    directory = os.path.join(folder_paths.get_temp_directory(), PREVIEW_SUBFOLDER)
    os.makedirs(directory, exist_ok=True)
    return filename, os.path.join(directory, filename)


def _recording_directory() -> str:
    directory = os.path.realpath(
        os.path.join(folder_paths.get_input_directory(), RECORDING_SUBFOLDER)
    )
    os.makedirs(directory, exist_ok=True)
    return directory


def _recording_path(recording_file: str) -> str | None:
    if not recording_file or os.path.basename(recording_file) != recording_file:
        return None
    if not recording_file.lower().endswith(".webm"):
        return None
    directory = _recording_directory()
    path = os.path.realpath(os.path.join(directory, recording_file))
    if os.path.commonpath([directory, path]) != directory or not os.path.isfile(path):
        return None
    return path


@PromptServer.instance.routes.post("/indi_video_comparer/recording")
async def upload_recording(request: web.Request) -> web.Response:
    if not (request.content_type or "").lower().startswith("multipart/"):
        return web.json_response(
            {"error": "multipart/form-data is required."}, status=415
        )

    recording_file = f"video_comparison_{uuid.uuid4().hex}.webm"
    directory = _recording_directory()
    final_path = os.path.join(directory, recording_file)
    part_path = final_path + ".part"
    total_bytes = 0
    found_recording = False

    try:
        reader = await request.multipart()
        while True:
            field = await reader.next()
            if field is None:
                break
            if field.name != "recording":
                while await field.read_chunk(1024 * 1024):
                    pass
                continue

            found_recording = True
            with open(part_path, "xb") as output:
                while True:
                    chunk = await field.read_chunk(1024 * 1024)
                    if not chunk:
                        break
                    output.write(chunk)
                    total_bytes += len(chunk)

        if not found_recording or total_bytes == 0:
            raise ValueError("The recording upload was empty.")
        with open(part_path, "rb") as uploaded:
            if uploaded.read(4) != b"\x1a\x45\xdf\xa3":
                raise ValueError("The recording is not a valid WebM file.")
        os.replace(part_path, final_path)
    except ValueError as error:
        try:
            os.remove(part_path)
        except FileNotFoundError:
            pass
        return web.json_response({"error": str(error)}, status=400)
    except BaseException:
        try:
            os.remove(part_path)
        except FileNotFoundError:
            pass
        raise

    return web.json_response(
        {"recording_file": recording_file, "size": total_bytes}
    )


class IndiVideoComparer(io.ComfyNode):
    """Preview two VIDEO inputs with a synchronized, draggable wipe comparison."""

    @classmethod
    def define_schema(cls) -> io.Schema:
        return io.Schema(
            node_id="IndiVideoComparer",
            display_name="Video Comparer (Swipe)",
            category="video/preview",
            description=(
                "Synchronously previews two VIDEO inputs. Move the pointer across "
                "the preview to compare A and B with a vertical wipe."
            ),
            inputs=[
                io.Video.Input("video_a", tooltip="Base/original video."),
                io.Video.Input(
                    "video_b",
                    tooltip="Improved video revealed progressively as the divider moves right.",
                ),
                io.String.Input("label_a", default="A", tooltip="Label for the base/original video."),
                io.String.Input("label_b", default="B", tooltip="Label for the improved video."),
                io.Boolean.Input("autoplay", default=True),
                io.Boolean.Input("loop", default=True),
                io.Boolean.Input(
                    "muted",
                    default=True,
                    tooltip="Mute preview audio. When unmuted, audio comes from video A only.",
                ),
                io.Float.Input(
                    "initial_split",
                    default=0.5,
                    min=0.05,
                    max=0.95,
                    step=0.01,
                    tooltip="Initial position of the A/B divider.",
                ),
                io.Int.Input(
                    "sync_tolerance_ms",
                    default=80,
                    min=10,
                    max=500,
                    step=10,
                    advanced=True,
                    tooltip="Resynchronize video B when drift exceeds this value.",
                ),
                io.String.Input(
                    "recording_file",
                    default="",
                    advanced=True,
                    socketless=True,
                    tooltip=(
                        "Managed automatically after browser recording. Connect the "
                        "recorded_video output to the core Save Video node."
                    ),
                ),
            ],
            is_output_node=True,
            outputs=[
                io.Video.Output(
                    "recorded_video",
                    tooltip="The latest completed swipe recording.",
                )
            ],
        )

    @classmethod
    def execute(
        cls,
        video_a: Input.Video,
        video_b: Input.Video,
        label_a: str,
        label_b: str,
        autoplay: bool,
        loop: bool,
        muted: bool,
        initial_split: float,
        sync_tolerance_ms: int,
        recording_file: str,
    ) -> io.NodeOutput:
        run_id = uuid.uuid4().hex
        filename_a, path_a = _preview_target(run_id, "a")
        filename_b, path_b = _preview_target(run_id, "b")

        try:
            # MP4/H.264 keeps the browser preview path consistent for file-backed
            # and tensor-backed VIDEO inputs. Compatible sources are remuxed by
            # ComfyUI; other sources are transcoded by its existing video API.
            video_a.save_to(
                path_a,
                format=Types.VideoContainer.MP4,
                codec=Types.VideoCodec.H264,
            )
            video_b.save_to(
                path_b,
                format=Types.VideoContainer.MP4,
                codec=Types.VideoCodec.H264,
            )

            width_a, height_a = video_a.get_dimensions()
            width_b, height_b = video_b.get_dimensions()
            duration_a = float(video_a.get_duration())
            duration_b = float(video_b.get_duration())
        except BaseException:
            # Only remove exact temporary files created by this execution.
            for path in (path_a, path_b):
                try:
                    os.remove(path)
                except FileNotFoundError:
                    pass
            raise

        payload = {
            "video_a": ui.SavedResult(filename_a, PREVIEW_SUBFOLDER, io.FolderType.temp),
            "video_b": ui.SavedResult(filename_b, PREVIEW_SUBFOLDER, io.FolderType.temp),
            "label_a": label_a,
            "label_b": label_b,
            "autoplay": bool(autoplay),
            "loop": bool(loop),
            "muted": bool(muted),
            "initial_split": float(initial_split),
            "sync_tolerance_ms": int(sync_tolerance_ms),
            "width_a": int(width_a),
            "height_a": int(height_a),
            "width_b": int(width_b),
            "height_b": int(height_b),
            "duration_a": duration_a,
            "duration_b": duration_b,
            "recording_file": recording_file,
        }
        recording_path = _recording_path(recording_file)
        recorded_video = (
            InputImpl.VideoFromFile(recording_path)
            if recording_path is not None
            else ExecutionBlocker(None)
        )
        return io.NodeOutput(
            recorded_video,
            ui={"video_comparer": [payload]},
        )


class VideoComparerExtension(ComfyExtension):
    async def get_node_list(self) -> list[type[io.ComfyNode]]:
        return [IndiVideoComparer]


async def comfy_entrypoint() -> ComfyExtension:
    return VideoComparerExtension()
