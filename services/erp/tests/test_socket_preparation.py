import os
from pathlib import Path
import socket
import tempfile
import unittest

from deploy.prepare_socket import prepare


@unittest.skipUnless(hasattr(os, "geteuid") and hasattr(socket, "AF_UNIX"), "Linux deployment socket checks")
class SocketPreparationTests(unittest.TestCase):
    def test_preserves_a_regular_file(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "socketio.sock"
            path.write_text("keep this file")
            with self.assertRaises(ValueError):
                prepare(path)
            self.assertEqual(path.read_text(), "keep this file")

    def test_preserves_a_live_listener(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "socketio.sock"
            with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as listener:
                listener.bind(str(path))
                listener.listen(1)
                with self.assertRaises(RuntimeError):
                    prepare(path)
                self.assertTrue(path.exists())

    def test_preserves_a_symbolic_link_and_its_target(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "keep.txt"
            target.write_text("keep this target")
            path = Path(directory) / "socketio.sock"
            path.symlink_to(target)
            with self.assertRaises(ValueError):
                prepare(path)
            self.assertTrue(path.is_symlink())
            self.assertEqual(target.read_text(), "keep this target")

    def test_removes_a_stale_socket_and_allows_rebinding(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "socketio.sock"
            with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as previous:
                previous.bind(str(path))
            self.assertTrue(prepare(path))
            with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as replacement:
                replacement.bind(str(path))
                replacement.listen(1)


if __name__ == "__main__":
    unittest.main()
