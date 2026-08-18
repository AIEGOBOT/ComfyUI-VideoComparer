from __future__ import annotations

import os
from collections.abc import Iterable


PREVIEW_FILENAME_PREFIX = "video_comparer_"
PREVIEW_FILENAME_SUFFIX = ".mp4"


def _normalized_path(path: str) -> str:
    return os.path.normcase(os.path.realpath(path))


def safe_recording_path(directory: str, recording_file: str) -> str | None:
    """Return a verified recording path contained directly in ``directory``."""
    if not recording_file or "/" in recording_file or "\\" in recording_file:
        return None
    if os.path.basename(recording_file) != recording_file:
        return None
    if not recording_file.lower().endswith(".webm"):
        return None

    real_directory = os.path.realpath(directory)
    path = os.path.realpath(os.path.join(real_directory, recording_file))
    try:
        common = os.path.commonpath([real_directory, path])
    except ValueError:
        return None
    if os.path.normcase(common) != os.path.normcase(real_directory):
        return None
    if not os.path.isfile(path):
        return None
    return path


def prune_preview_files(
    directory: str,
    *,
    keep_paths: Iterable[str] = (),
    max_files: int = 12,
) -> list[str]:
    """Delete old generated previews while preserving current and recent files."""
    if max_files < 1:
        raise ValueError("max_files must be at least 1")
    if not os.path.isdir(directory):
        return []

    real_directory = os.path.realpath(directory)
    normalized_directory = _normalized_path(real_directory)
    keep: set[str] = set()
    for path in keep_paths:
        normalized = _normalized_path(path)
        try:
            common = os.path.commonpath([normalized_directory, normalized])
        except ValueError:
            continue
        if common == normalized_directory and os.path.isfile(path):
            keep.add(normalized)

    candidates: list[tuple[float, str, str]] = []
    with os.scandir(real_directory) as entries:
        for entry in entries:
            if not entry.name.startswith(PREVIEW_FILENAME_PREFIX):
                continue
            if not entry.name.lower().endswith(PREVIEW_FILENAME_SUFFIX):
                continue
            try:
                if not entry.is_file(follow_symlinks=False):
                    continue
                modified = entry.stat(follow_symlinks=False).st_mtime
            except OSError:
                continue
            candidates.append((modified, entry.name, entry.path))

    candidates.sort(reverse=True)
    retained = set(keep)
    deleted: list[str] = []
    for _modified, _name, path in candidates:
        normalized = _normalized_path(path)
        if normalized in retained:
            continue
        if len(retained) < max_files:
            retained.add(normalized)
            continue
        os.remove(path)
        deleted.append(path)
    return deleted
