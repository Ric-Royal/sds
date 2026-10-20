import unittest
from unittest.mock import patch

from sds_ops.assets import operations_script_url
from sds_ops import hooks


class AssetVersionTests(unittest.TestCase):
    def test_desk_publishes_the_content_versioned_operations_script(self):
        self.assertEqual(hooks.app_include_js,[operations_script_url()])
        self.assertRegex(hooks.app_include_js[0],r"^/assets/sds_ops/js/operations\.js\?v=[a-f0-9]{16}$")

    def test_changed_script_bytes_get_a_different_browser_cache_key(self):
        with patch("sds_ops.assets.Path.read_bytes",return_value=b"first script"):
            first=operations_script_url()
            self.assertEqual(first,operations_script_url())
        with patch("sds_ops.assets.Path.read_bytes",return_value=b"changed script"):
            second=operations_script_url()
        self.assertNotEqual(first,second)
        self.assertEqual(first.split("?")[0],second.split("?")[0])
