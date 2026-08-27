"""Lead submission and portal path rules for bot protection."""

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_lead_guard_spec():
    proc = subprocess.run(
        "npx --yes tsx tests/leadGuard.spec.ts",
        cwd=ROOT,
        capture_output=True,
        text=True,
        shell=True,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr or proc.stdout
    assert "leadGuard spec passed" in proc.stdout
