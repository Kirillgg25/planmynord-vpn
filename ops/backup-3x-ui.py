#!/usr/bin/env python3
"""Create a consistent monthly 3X-UI SQLite backup with three-month retention."""

import datetime as dt
import hashlib
import io
import json
import os
from pathlib import Path
import re
import sqlite3
import tarfile
import tempfile


DATABASE = Path("/etc/x-ui/x-ui.db")
CERTIFICATES = Path("/root/cert")
DESTINATION = Path("/home/kk/Syncthing/VPN/3x-ui-backups")
ARCHIVE_RE = re.compile(r"^3x-ui-(\d{4})-(\d{2})\.tar\.gz$")
KEEP = 3


def add_file(archive, source, name):
    archive.add(source, arcname=name, recursive=False)


def main():
    if not DATABASE.is_file():
        raise FileNotFoundError(f"3X-UI database not found: {DATABASE}")
    DESTINATION.mkdir(mode=0o700, parents=True, exist_ok=True)
    os.chmod(DESTINATION, 0o700)
    stamp = dt.datetime.now(dt.timezone.utc)
    month = stamp.astimezone().strftime("%Y-%m")
    target = DESTINATION / f"3x-ui-{month}.tar.gz"

    with tempfile.TemporaryDirectory(prefix="3x-ui-backup-") as work:
        snapshot = Path(work) / "x-ui.db"
        source = sqlite3.connect(f"file:{DATABASE}?mode=ro", uri=True, timeout=30)
        try:
            copied = sqlite3.connect(snapshot)
            try:
                source.backup(copied)
            finally:
                copied.close()
        finally:
            source.close()

        check = sqlite3.connect(f"file:{snapshot}?mode=ro", uri=True)
        try:
            result = check.execute("PRAGMA quick_check").fetchone()[0]
        finally:
            check.close()
        if result != "ok":
            raise RuntimeError(f"SQLite integrity check failed: {result}")

        digest = hashlib.sha256(snapshot.read_bytes()).hexdigest()
        manifest = {
            "created_utc": stamp.isoformat(),
            "database": "etc/x-ui/x-ui.db",
            "database_sha256": digest,
            "certificates": "root/cert" if CERTIFICATES.is_dir() else None,
        }
        with tempfile.NamedTemporaryFile(dir=DESTINATION, prefix=".3x-ui-", suffix=".tmp", delete=False) as temp:
            temporary = Path(temp.name)
        try:
            os.chmod(temporary, 0o600)
            with tarfile.open(temporary, "w:gz") as archive:
                add_file(archive, snapshot, "etc/x-ui/x-ui.db")
                if CERTIFICATES.is_dir():
                    archive.add(CERTIFICATES, arcname="root/cert", recursive=True)
                data = json.dumps(manifest, indent=2).encode("utf-8")
                entry = tarfile.TarInfo("manifest.json")
                entry.size = len(data)
                entry.mode = 0o600
                entry.mtime = int(stamp.timestamp())
                archive.addfile(entry, io.BytesIO(data))
            with tarfile.open(temporary, "r:gz") as archive:
                names = set(archive.getnames())
                if "etc/x-ui/x-ui.db" not in names or "manifest.json" not in names:
                    raise RuntimeError("Archive verification failed")
            os.replace(temporary, target)
        finally:
            temporary.unlink(missing_ok=True)

    # Syncthing runs as kk and needs read access to replicate the private archive.
    import pwd
    account = pwd.getpwnam("kk")
    os.chown(DESTINATION, account.pw_uid, account.pw_gid)
    os.chown(target, account.pw_uid, account.pw_gid)
    os.chmod(target, 0o600)

    backups = sorted(
        (entry for entry in DESTINATION.iterdir() if entry.is_file() and ARCHIVE_RE.fullmatch(entry.name)),
        key=lambda entry: entry.name,
        reverse=True,
    )
    for old in backups[KEEP:]:
        old.unlink()
    print(f"Created {target}; retained {min(len(backups), KEEP)} monthly backup(s)")


if __name__ == "__main__":
    main()
