"""Content-versioned URLs for application assets outside Frappe's bundle builder."""
from hashlib import sha256
from pathlib import Path


def operations_script_url():
    content=(Path(__file__).parent/"public/js/operations.js").read_bytes()
    return f"/assets/sds_ops/js/operations.js?v={sha256(content).hexdigest()[:16]}"
