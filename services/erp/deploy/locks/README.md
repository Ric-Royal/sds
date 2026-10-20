# Installer download locks

`python-downloads.json` pins the official Astral Python standalone builds for CPython 3.14.8 on Linux x86-64 and ARM64. The URLs and SHA-256 checksums come from [Astral's download catalogue](https://github.com/astral-sh/uv/blob/main/crates/uv-python-managed/download-metadata.json), retrieved on 20 October 2026, and refer to the [20261013 release](https://github.com/astral-sh/python-build-standalone/releases/tag/20261013).

The pinned uv 0.11.33 has an older built-in catalogue. `install.py` passes this local catalogue explicitly so the required Python version remains available without upgrading uv or selecting an older Python. Update the catalogue with the Python pin, preserving official HTTPS download URLs and published checksums.

`frappe-ui.yarn.lock` pins the shared framework UI dependency graph used by `assets.py`.
