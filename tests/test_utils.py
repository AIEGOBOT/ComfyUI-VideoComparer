from __future__ import annotations

import os
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from utils import prune_preview_files, safe_recording_path  # noqa: E402


class SafeRecordingPathTests(unittest.TestCase):
    def test_accepts_existing_webm_in_recording_directory(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            recording = Path(directory, "recording.webm")
            recording.write_bytes(b"webm")
            self.assertEqual(
                safe_recording_path(directory, recording.name),
                str(recording),
            )

    def test_rejects_traversal_and_non_webm_files(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            self.assertIsNone(safe_recording_path(directory, "../recording.webm"))
            self.assertIsNone(safe_recording_path(directory, "..\\recording.webm"))
            self.assertIsNone(safe_recording_path(directory, "recording.mp4"))


class PreviewRetentionTests(unittest.TestCase):
    def test_keeps_explicit_and_newest_preview_files(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            paths: list[Path] = []
            for index in range(8):
                path = Path(directory, f"video_comparer_run_{index}.mp4")
                path.write_bytes(str(index).encode("ascii"))
                os.utime(path, (index + 1, index + 1))
                paths.append(path)

            deleted = prune_preview_files(
                directory,
                keep_paths=(str(paths[0]),),
                max_files=4,
            )

            remaining = {path.name for path in Path(directory).iterdir()}
            self.assertEqual(
                remaining,
                {
                    paths[0].name,
                    paths[5].name,
                    paths[6].name,
                    paths[7].name,
                },
            )
            self.assertEqual(len(deleted), 4)

    def test_ignores_unrelated_files(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            unrelated = Path(directory, "keep-me.txt")
            unrelated.write_text("keep", encoding="utf-8")
            prune_preview_files(directory, max_files=1)
            self.assertTrue(unrelated.exists())


if __name__ == "__main__":
    unittest.main()
