#!/usr/bin/env python3
"""Remove only this user's inactive Unix socket before a realtime restart."""
import argparse
import os
from pathlib import Path
import socket
import stat


def prepare(path):
    path = Path(path)
    if not path.is_absolute():
        raise ValueError("Use an absolute socket path.")
    try:
        original = path.lstat()
    except FileNotFoundError:
        return False
    if not stat.S_ISSOCK(original.st_mode) or original.st_uid != os.geteuid():
        raise ValueError("Refusing to remove a non-socket or another user's socket.")
    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as connection:
        connection.settimeout(1)
        try:
            connection.connect(str(path))
        except FileNotFoundError:
            return False
        except ConnectionRefusedError:
            current = path.lstat()
            if (current.st_dev, current.st_ino) != (original.st_dev, original.st_ino):
                raise RuntimeError("The socket changed during preparation.")
            path.unlink()
            return True
        else:
            raise RuntimeError("Refusing to remove a live socket.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", required=True, type=Path)
    args = parser.parse_args()
    prepare(args.path)
