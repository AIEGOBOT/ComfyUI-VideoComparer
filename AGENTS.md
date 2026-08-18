# Repository guidance

## Scope

This repository contains one ComfyUI V3 custom node plus its browser extension.
Preserve the public node ID `IndiVideoComparer`, package ID `video-comparer`, and
publisher ID `aiegobot` unless a breaking migration is explicitly approved.

## Validation

Run before committing:

```bash
python -m py_compile __init__.py nodes.py utils.py tests/test_utils.py
python -m unittest discover -s tests -v
node --check web/video_comparer_v7.js
```

Frontend and recording changes also require a real ComfyUI smoke test using the core
`Load Video` and `Save Video` nodes.

## Documentation and assets

- Keep essential installation and first-use instructions in `README.md`.
- Keep public user documentation bilingual in English and Korean.
- Do not add local absolute paths, private workflows, personal media, recordings, or
  credentials to public files.
- Example workflows must remain portable and valid JSON.

## Publishing

- Registry publishing is a separate, explicit release action.
- Do not run the `Publish to Comfy Registry` workflow without the owner's approval.
- Keep the manual publish workflow dispatch-only.
- The Registry package ID becomes immutable after the first publication.
