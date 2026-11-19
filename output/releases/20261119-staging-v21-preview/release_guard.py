#!/usr/bin/env python3
"""Fingerprint reviewed release inputs and reject staging/runtime drift. No network or Git required."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
import re
import sys

CACHE_DIRS = {".git", "node_modules", ".venv", "venv", "__pycache__", ".pytest_cache", ".mypy_cache", ".ruff_cache"}
RUNTIME_PATHS = {"data", "server/data", "uploads", "server/uploads", "web/uploads"}
BUILD_PATHS = {"dist", "web/dist", "server/dist", "build", "web/build", "server/build", ".deploy", "tmp", "logs", "coverage"}
PRIVATE_FILE = re.compile(r"(?:\.(?:db|sqlite|sqlite3)(?:-(?:wal|shm|journal))?|\.(?:pem|key|p12))$", re.I)


def relative_path(value: str) -> str:
    p = PurePosixPath(value)
    if p.is_absolute() or ".." in p.parts or "\\" in value or not value:
        raise ValueError("include必须是根目录内的相对路径，不能包含..或反斜杠")
    return p.as_posix()


def excluded(relative: str, kind: str) -> bool:
    p = PurePosixPath(relative)
    if any(part in CACHE_DIRS for part in p.parts):
        return True
    if p.name.startswith(".env") or p.name in {".DS_Store", "id_rsa", "id_ed25519"} or p.name.endswith(".tsbuildinfo") or PRIVATE_FILE.search(p.name):
        return True
    prefixes = RUNTIME_PATHS | (BUILD_PATHS if kind == "source" else set())
    return any(relative == prefix or relative.startswith(prefix + "/") for prefix in prefixes)


def collect(root: Path, includes: list[str], kind: str) -> tuple[dict, int]:
    root = root.resolve(strict=True)
    if not root.is_dir():
        raise ValueError("root必须是存在的目录")
    selected: set[str] = set()
    skipped = 0
    for include in includes:
        rel = relative_path(include)
        item = root / rel
        if excluded(rel, kind):
            raise ValueError("不能显式选择被排除的数据、密钥或生成目录：" + rel)
        cursor = root
        for part in PurePosixPath(rel).parts:
            cursor = cursor / part
            if cursor.is_symlink():
                raise ValueError("选中路径含符号链接，需要先审阅并确定发布输入：" + rel)
        if not item.exists():
            raise ValueError("所选路径不存在：" + rel)
        if item.is_file():
            selected.add(rel)
            continue
        for directory, dirs, files in os.walk(item, followlinks=False):
            directory = Path(directory)
            for name in list(dirs):
                child = directory / name
                child_rel = child.relative_to(root).as_posix()
                if excluded(child_rel, kind):
                    dirs.remove(name)
                    skipped += 1
                elif child.is_symlink():
                    raise ValueError("选中的符号链接需要先审阅并确定发布输入：" + child_rel)
            for name in files:
                child = directory / name
                child_rel = child.relative_to(root).as_posix()
                if excluded(child_rel, kind):
                    skipped += 1
                    continue
                if child.is_symlink() or not child.is_file():
                    raise ValueError("发布输入不是普通文件：" + child_rel)
                selected.add(child_rel)
    result = {}
    for rel in sorted(selected):
        file = root / rel
        before = file.stat()
        digest = hashlib.sha256()
        with file.open("rb") as stream:
            for block in iter(lambda: stream.read(1024 * 1024), b""):
                digest.update(block)
        after = file.stat()
        if (before.st_size, before.st_mtime_ns) != (after.st_size, after.st_mtime_ns):
            raise ValueError("扫描期间源文件发生变化，请重新核对：" + rel)
        result[rel] = {"sha256": digest.hexdigest(), "bytes": after.st_size}
    if not result:
        raise ValueError("选择范围内没有可校验文件；请核对输入与排除项")
    return result, skipped


def tree_hash(files: dict) -> str:
    return hashlib.sha256(json.dumps(files, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()


def snapshot(root: Path, includes: list[str], kind: str, output: Path) -> dict:
    root = root.resolve(strict=True)
    output = output.resolve()
    if output == root or root in output.parents:
        raise ValueError("指纹文件必须放在扫描根目录之外，避免自包含")
    files, skipped = collect(root, includes, kind)
    manifest = {"schemaVersion": 1, "kind": kind, "createdAt": datetime.now(timezone.utc).isoformat(),
                "includes": sorted(set(relative_path(p) for p in includes)), "files": files, "treeSha256": tree_hash(files),
                "excludedPaths": sorted(RUNTIME_PATHS | (BUILD_PATHS if kind == "source" else set())), "skippedCount": skipped}
    output.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    # 不覆盖旧基线：合法的候选调整需要另建证据文件，不能悄悄冲掉失败证据。
    fd = os.open(output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as stream:
        json.dump(manifest, stream, ensure_ascii=False, indent=2)
        stream.write("\n")
    return manifest


def verify(root: Path, manifest_path: Path) -> dict:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("schemaVersion") != 1 or manifest.get("kind") not in {"source", "artifact"}:
        raise ValueError("不支持的发布指纹格式")
    if not isinstance(manifest.get("includes"), list) or not all(isinstance(p, str) for p in manifest["includes"]):
        raise ValueError("发布指纹缺少有效include清单")
    expected = manifest.get("files")
    if not isinstance(expected, dict) or not expected or tree_hash(expected) != manifest.get("treeSha256"):
        raise ValueError("发布指纹内容损坏或被修改")
    actual, skipped = collect(root, manifest["includes"], manifest["kind"])
    return {"ok": actual == expected, "kind": manifest["kind"], "treeSha256": tree_hash(actual), "files": len(actual), "skippedCount": skipped,
            "changed": sorted(p for p in actual.keys() & expected.keys() if actual[p] != expected[p]),
            "missing": sorted(expected.keys() - actual.keys()), "added": sorted(actual.keys() - expected.keys())}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    create = commands.add_parser("snapshot", help="保存已审阅输入的文件指纹，不覆盖已有证据")
    create.add_argument("--root", type=Path, required=True)
    create.add_argument("--include", action="append", required=True)
    create.add_argument("--kind", choices=["source", "artifact"], default="source")
    create.add_argument("--output", type=Path, required=True)
    check = commands.add_parser("verify", help="只读校验候选/实际运行文件是否匹配基线")
    check.add_argument("--root", type=Path, required=True)
    check.add_argument("--manifest", type=Path, required=True)
    args = parser.parse_args()
    try:
        if args.command == "snapshot":
            manifest = snapshot(args.root, args.include, args.kind, args.output)
            print(json.dumps({"ok": True, "kind": args.kind, "files": len(manifest["files"]), "treeSha256": manifest["treeSha256"], "skippedCount": manifest["skippedCount"]}, ensure_ascii=False))
            return 0
        result = verify(args.root, args.manifest)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0 if result["ok"] else 1
    except (OSError, ValueError, KeyError, TypeError) as error:
        print("发布校验失败：" + str(error), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
