import json
from pathlib import Path
import secrets
import tarfile
import tempfile
import unittest
from cryptography.exceptions import InvalidTag
from sds_ops.backup import encrypt,decrypt,unpack,digest


class BackupTests(unittest.TestCase):
    def test_streamed_roundtrip_and_tampering(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);source=root/"source";source.write_bytes(secrets.token_bytes(2*1024*1024+37))
            key=secrets.token_bytes(32);bundle=root/"backup";encrypt(source,bundle,key)
            restored=root/"restored";decrypt(bundle,restored,key)
            self.assertEqual(digest(source),digest(restored))
            altered=bytearray(bundle.read_bytes());altered[50]^=1;bundle.write_bytes(altered)
            with self.assertRaises(InvalidTag):decrypt(bundle,root/"invalid",key)

    def test_archive_paths_cannot_escape_restore_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);source=root/"data";source.write_text("synthetic")
            archive=root/"bad.tar"
            with tarfile.open(archive,"w") as tar:tar.add(source,arcname="../escaped")
            key=secrets.token_bytes(32);encrypt(archive,root/"bundle",key)
            work=root/"work";work.mkdir()
            with self.assertRaises(ValueError):unpack(root/"bundle",key,work)
            self.assertFalse((root/"escaped").exists())
