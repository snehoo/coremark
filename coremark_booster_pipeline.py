#!/usr/bin/env python3
r"""
CoreMark Booster Pipeline
==========================
Audits the local Boosters folder against the master 88-booster list,
renames raw PDFs to the clean slug convention, then appends a content
hash to each filename (same pattern as NovaKit's R2 assets:
nk-{slug}-{hash}.skill  ->  cm-{slug}-{hash}.pdf), so they're ready to
upload to R2 under booster/.

Expected folder layout:
  <ROOT>/stage7/math/*.pdf
  <ROOT>/stage7/science/*.pdf
  <ROOT>/stage7/computing/*.pdf
  <ROOT>/stage8/math/...
  <ROOT>/stage9/...

USAGE
-----
  # Dry run first (default) - shows everything, changes nothing
  python3 coremark_booster_pipeline.py --root "/Users/snehoomac/snehoo/AI/CoreMark/Boosters"

  # Once happy, actually rename + hash the files
  python3 coremark_booster_pipeline.py --root "/Users/snehoomac/snehoo/AI/CoreMark/Boosters" --apply

  # Re-run any time - it's idempotent. Already-finished files are left
  # alone unless their content changed (then a fresh hash is produced
  # and the OLD hashed filename is flagged so you remember to delete it
  # from R2 before re-uploading the new one).

OUTPUTS (written into ROOT)
----------------------------
  coremark_booster_manifest.csv   - one row per booster: code, slug,
                                     final filename, R2 key, hash, size
  coremark_audit_report.txt       - missing boosters / problem files
  upload_to_r2.sh                 - ready-to-run wrangler upload commands
                                     (only written with --apply)

NOTE ON THE HASH
-----------------
NovaKit's deliver.js looks files up in R2 by PREFIX
(`skill/nk-{slug}-`), not by the exact hash, and send-email.js strips
the hash back off with regex `-[a-f0-9]+\.skill$` to show a friendly
name. So the hash itself can be anything hex - it does not need to be
remembered anywhere. This script uses the first 8 hex chars of the
file's own SHA-256 (a content hash, not random) on purpose: re-running
the script on an unchanged file always reproduces the exact same
filename (safe to re-run, no duplicate R2 objects), and if you ever
swap in a corrected PDF, the hash automatically changes - which is
your signal to delete the old key from R2. If you specifically used
random (not content-derived) hashes for NovaKit and want this to match
exactly, that's a one-line change (see `make_hash()` below) - flag it
and I'll switch it.
"""

import argparse
import csv
import hashlib
import re
import sys
from pathlib import Path

# ============================================================
# MASTER BOOSTER LIST - 88 boosters, Stage 7-9
# Math 39 / Science 27 / Computing 22
# (code, topic name) - code already in its filename form:
#   Math/Science codes drop the subject letter (N1, B1, ...)
#   Computing codes keep the C (CP1, CD1, CN1, CS1, ...)
# ============================================================

MASTER = {
    "math": {
        7: [
            ("N1", "Integers"),
            ("N2", "Place Value and Rounding"),
            ("N3", "Decimals"),
            ("N4", "Fractions"),
            ("A1", "Expressions, Formulae and Equations"),
            ("G1", "Angles and Constructions"),
            ("G2", "Shapes and Symmetry"),
            ("S1", "Collecting Data"),
        ],
        8: [
            ("N1", "Integers"),
            ("N2", "Place Value and Rounding"),
            ("N3", "Decimals"),
            ("N4", "Fractions"),
            ("N5", "Percentages"),
            ("N6", "Ratio and Proportion"),
            ("A1", "Expressions, Formulae and Equations"),
            ("A2", "Sequences and Functions"),
            ("A3", "Graphs"),
            ("G1", "Angles and Constructions"),
            ("G2", "Shapes and Symmetry"),
            ("G3", "Position and Transformation"),
            ("G4", "Distance, Area and Volume"),
            ("S1", "Collecting Data"),
            ("S2", "Probability"),
            ("S3", "Interpreting and Discussing Results"),
        ],
        9: [
            ("N1", "Number and Calculation"),
            ("N2", "Decimals, Percentages and Rounding"),
            ("N3", "Fractions"),
            ("N4", "Ratio and Proportion"),
            ("A1", "Expressions and Formulae"),
            ("A2", "Equations and Inequalities"),
            ("A3", "Sequences and Functions"),
            ("A4", "Graphs"),
            ("G1", "Angles"),
            ("G2", "Shapes and Measurements"),
            ("G3", "Position and Transformation"),
            ("G4", "Volume, Surface Area and Symmetry"),
            ("S1", "Statistical Investigations"),
            ("S2", "Probability"),
            ("S3", "Interpreting and Discussing Results"),
        ],
    },
    "science": {
        7: [
            ("B1", "Cells"),
            ("B2", "Grouping and Identifying Organisms"),
            ("B3", "Microorganisms in the Environment"),
            ("C1", "Materials and Their Structure"),
            ("C2", "Properties of Materials"),
            ("C3", "Changes to Materials"),
            ("P1", "Forces and Energy"),
            ("P2", "Earth Physics"),
            ("P3", "Electricity"),
        ],
        8: [
            ("B1", "Respiration"),
            ("B2", "Ecosystems"),
            ("B3", "Diet and Growth"),
            ("C1", "Properties of Materials"),
            ("C2", "Materials and Their Structure"),
            ("C3", "Chemical Reactions"),
            ("P1", "Forces and Energy"),
            ("P2", "Light"),
            ("P3", "Magnetism"),
        ],
        9: [
            ("B1", "Photosynthesis and the Carbon Cycle"),
            ("B2", "Maintaining Life"),
            ("B3", "Genes and Inheritance"),
            ("C1", "Properties of Materials"),
            ("C2", "Reactivity"),
            ("C3", "Rates of Reaction"),
            ("P1", "Forces and Energy"),
            ("P2", "Electricity"),
            ("P3", "Sound and Space"),
        ],
    },
    "computing": {
        7: [
            ("CP1", "Flowcharts and Selection"),
            ("CP2", "Text-Based Programming and Python"),
            ("CP3", "Software Development and Physical Computing"),
            ("CD1", "Spreadsheets and Modelling"),
            ("CD2", "Databases and Data Collection"),
            ("CN1", "Networks, Websites and Data Transmission"),
            ("CS1", "Computer Systems, Logic and AI"),
        ],
        8: [
            ("CP1", "Pseudocode and Selection"),
            ("CP2", "Programming and Data"),
            ("CP3", "Software Development and Physical Computing"),
            ("CD1", "Modelling and Databases"),
            ("CN1", "Networks and Data Transmission Security"),
            ("CS1", "Computer Architecture, Software and Data"),
            ("CS2", "Logic Gates, Truth Tables and AI"),
        ],
        9: [
            ("CP1", "Pseudocode, Iteration and Algorithms"),
            ("CP2", "Loops, Data Structures and Algorithm Comparison"),
            ("CP3", "Searching, Testing and Physical Computing"),
            ("CD1", "Spreadsheets, Systems and Databases"),
            ("CN1", "Topologies, Transmission and Network Security"),
            ("CS1", "Computer Design and Architecture"),
            ("CS2", "Software, Data Representation and Logic"),
            ("CS3", "AI and Computerisation"),
        ],
    },
}

SUBJECT_FOLDER_ALIASES = {
    "math": "math", "maths": "math", "mathematics": "math",
    "science": "science", "sci": "science",
    "computing": "computing", "comp": "computing", "computer": "computing",
}

STOPWORDS = {"and"}
HASH_LEN = 8  # hex chars appended, e.g. cm-math-n1-integers-s7-4f9a2b7c.pdf

CLEAN_RE_TEMPLATE = r"^{subject}-{code}-(?P<slug>[a-z0-9\-]+)-s{stage}$"
HASHED_RE = re.compile(r"^cm-(?P<base>.+)-(?P<hash>[0-9a-f]{6,16})$")


# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------

def slugify(name: str) -> str:
    """'Distance, Area and Volume' -> 'distance-area-volume'"""
    name = name.replace("&", " and ")
    name = re.sub(r"[’'`]", "", name)
    name = re.sub(r"[^A-Za-z0-9\- ]+", " ", name)
    tokens = [t for t in name.split() if t.lower() not in STOPWORDS]
    slug = "-".join(t.lower() for t in tokens)
    return re.sub(r"-+", "-", slug).strip("-")


def expected_slug(subject: str, code: str, name: str, stage: int) -> str:
    return f"{subject}-{code.lower()}-{slugify(name)}-s{stage}"


def make_hash(file_bytes: bytes) -> str:
    """Content hash (first HASH_LEN hex chars of sha256). See module
    docstring if you want random-instead-of-content hashing."""
    return hashlib.sha256(file_bytes).hexdigest()[:HASH_LEN]


def build_code_index():
    """subject -> stage -> {CODE: topic_name}"""
    idx = {}
    for subject, stages in MASTER.items():
        idx[subject] = {}
        for stage, items in stages.items():
            idx[subject][stage] = {code: name for code, name in items}
    return idx


CODE_INDEX = build_code_index()


def find_code_in_filename(filename_stem: str, subject: str, stage: int):
    """Search filename tokens for a code valid in this subject/stage.
    Returns (code, match_count) - match_count > 1 means ambiguous."""
    valid_codes = CODE_INDEX.get(subject, {}).get(stage, {})
    tokens = [t for t in re.split(r"[^A-Za-z0-9]+", filename_stem) if t]
    found = []
    for tok in tokens:
        up = tok.upper()
        if up in valid_codes and up not in found:
            found.append(up)
    if len(found) == 1:
        return found[0], 1
    return (found[0] if found else None), len(found)


# ------------------------------------------------------------
# Classification of a single file
# ------------------------------------------------------------

class FileStatus:
    def __init__(self, path, subject, stage):
        self.path = Path(path)
        self.subject = subject
        self.stage = stage
        self.code = None
        self.state = "unmatched"   # original | clean | hashed | unmatched | ambiguous | unknown_code
        self.ambiguous_codes = []
        self.expected = None       # expected clean slug (no ext)
        self.note = ""

    def __repr__(self):
        return f"<{self.path.name} subj={self.subject} stage={self.stage} state={self.state} code={self.code}>"


def classify(path: Path, subject: str, stage: int) -> FileStatus:
    fs = FileStatus(path, subject, stage)
    stem = path.stem

    # 1) Already in final hashed form?  cm-{slug}-{hash}.pdf
    m = HASHED_RE.match(stem)
    if m:
        base = m.group("base")  # e.g. math-n1-integers-s7
        code, n = find_code_in_filename(base, subject, stage)
        fs.code = code
        if n > 1:
            fs.state = "ambiguous"
            fs.ambiguous_codes = [c for c in re.split(r"[^A-Za-z0-9]+", base)]
        elif code:
            name = CODE_INDEX[subject][stage][code]
            fs.expected = expected_slug(subject, code, name, stage)
            if base == fs.expected:
                fs.state = "hashed"
            else:
                fs.state = "unknown_code"
                fs.note = f"hashed filename base '{base}' doesn't match expected '{fs.expected}'"
        else:
            fs.state = "unmatched"
        return fs

    # 2) Already a clean slug? subject-code-slug-sN
    code, n = find_code_in_filename(stem, subject, stage)
    if n > 1:
        fs.state = "ambiguous"
        fs.code = code
        fs.ambiguous_codes = []
        return fs
    if code:
        name = CODE_INDEX[subject][stage][code]
        fs.expected = expected_slug(subject, code, name, stage)
        fs.code = code
        if stem == fs.expected:
            fs.state = "clean"
        else:
            fs.state = "original"  # legacy/raw filename, has a recognisable code
        return fs

    fs.state = "unmatched"
    return fs


# ------------------------------------------------------------
# Folder scanning
# ------------------------------------------------------------

STAGE_DIR_RE = re.compile(r"stage[_\s]?(\d)", re.IGNORECASE)


def scan_root(root: Path):
    """Yields FileStatus for every pdf under root/stageN/subject/*.pdf"""
    results = []
    if not root.exists():
        print(f"!! Root folder does not exist: {root}")
        return results

    for stage_dir in sorted(root.iterdir()):
        if not stage_dir.is_dir():
            continue
        m = STAGE_DIR_RE.match(stage_dir.name)
        if not m:
            continue
        stage = int(m.group(1))
        if stage not in (7, 8, 9):
            continue

        for subj_dir in sorted(stage_dir.iterdir()):
            if not subj_dir.is_dir():
                continue
            subject = SUBJECT_FOLDER_ALIASES.get(subj_dir.name.strip().lower())
            if subject is None:
                print(f"   (skipping unrecognised folder: {subj_dir})")
                continue

            for f in sorted(subj_dir.iterdir()):
                if f.is_file() and f.suffix.lower() == ".pdf":
                    results.append(classify(f, subject, stage))
    return results


# ------------------------------------------------------------
# Audit
# ------------------------------------------------------------

def run_audit(statuses, root: Path):
    lines = []
    problems = 0

    by_key = {}
    for fs in statuses:
        by_key.setdefault((fs.subject, fs.stage), []).append(fs)

    for subject in MASTER:
        for stage in (7, 8, 9):
            expected_codes = set(CODE_INDEX[subject][stage].keys())
            found = by_key.get((subject, stage), [])

            seen_codes = {}
            unmatched_files = []
            ambiguous_files = []
            for fs in found:
                if fs.state == "unmatched":
                    unmatched_files.append(fs)
                elif fs.state == "ambiguous":
                    ambiguous_files.append(fs)
                elif fs.code:
                    seen_codes.setdefault(fs.code, []).append(fs)

            missing = expected_codes - set(seen_codes.keys())
            duplicates = {c: v for c, v in seen_codes.items() if len(v) > 1}

            header = f"[{subject}/stage{stage}]  expected {len(expected_codes)}  found {len(seen_codes)}"
            lines.append(header)

            if missing:
                problems += len(missing)
                lines.append(f"   MISSING ({len(missing)}): " + ", ".join(sorted(missing)))
            if duplicates:
                problems += len(duplicates)
                for c, v in duplicates.items():
                    lines.append(f"   DUPLICATE code {c}: " + ", ".join(p.path.name for p in v))
            if ambiguous_files:
                problems += len(ambiguous_files)
                for fs in ambiguous_files:
                    lines.append(f"   AMBIGUOUS: {fs.path.name} (multiple codes found in filename)")
            if unmatched_files:
                problems += len(unmatched_files)
                for fs in unmatched_files:
                    lines.append(f"   UNRECOGNISED FILE: {fs.path}")

    report = "\n".join(lines)
    print(report)
    print()
    if problems == 0:
        print("AUDIT CLEAN - all 88 boosters accounted for, no stray files.")
    else:
        print(f"AUDIT found {problems} issue(s) - see above. Files with issues are skipped "
              f"during rename/hash; everything else proceeds normally.")

    report_path = root / "coremark_audit_report.txt"
    report_path.write_text(report + "\n\n" +
                            (f"{problems} issue(s) found.\n" if problems else "Clean.\n"))
    print(f"\n(audit report written to {report_path})")
    return problems


# ------------------------------------------------------------
# Rename phase: original -> clean slug
# ------------------------------------------------------------

def run_rename(statuses, apply: bool):
    print("\n--- RENAME (raw filename -> clean slug) ---")
    did_any = False
    for fs in statuses:
        if fs.state != "original":
            continue
        did_any = True
        new_path = fs.path.with_name(fs.expected + fs.path.suffix.lower())
        if new_path.exists() and new_path != fs.path:
            print(f"  SKIP (target exists): {fs.path.name} -> {new_path.name}")
            continue
        print(f"  {fs.path.name}\n    -> {new_path.name}")
        if apply:
            fs.path.rename(new_path)
            fs.path = new_path
            fs.state = "clean"
    if not did_any:
        print("  nothing to rename here.")


# ------------------------------------------------------------
# Hash phase: clean slug -> cm-{slug}-{hash}.pdf
# ------------------------------------------------------------

def run_hash(statuses, apply: bool, stale_for_r2: list):
    print("\n--- HASH (append content hash, cm- prefix) ---")
    did_any = False
    for fs in statuses:
        if fs.state not in ("clean", "hashed"):
            continue
        did_any = True
        content = fs.path.read_bytes()
        h = make_hash(content)
        final_name = f"cm-{fs.expected}-{h}{fs.path.suffix.lower()}"

        if fs.state == "hashed":
            if fs.path.name == final_name:
                print(f"  OK (unchanged): {fs.path.name}")
            else:
                print(f"  CONTENT CHANGED: {fs.path.name}\n    -> {final_name}")
                print(f"    !! delete stale R2 key: booster/{fs.path.name}")
                stale_for_r2.append(f"booster/{fs.path.name}")
                if apply:
                    new_path = fs.path.with_name(final_name)
                    fs.path.rename(new_path)
                    fs.path = new_path
            continue

        # state == clean
        new_path = fs.path.with_name(final_name)
        print(f"  {fs.path.name}\n    -> {final_name}")
        if apply:
            fs.path.rename(new_path)
            fs.path = new_path
            fs.state = "hashed"
    if not did_any:
        print("  nothing to hash here.")


# ------------------------------------------------------------
# Manifest + upload script
# ------------------------------------------------------------

def write_manifest(statuses, root: Path):
    manifest_path = root / "coremark_booster_manifest.csv"
    rows = []
    for fs in statuses:
        if fs.state != "hashed" or not fs.code:
            continue
        name = CODE_INDEX[fs.subject][fs.stage][fs.code]
        size = fs.path.stat().st_size
        sha_full = hashlib.sha256(fs.path.read_bytes()).hexdigest()
        rows.append({
            "subject": fs.subject,
            "stage": fs.stage,
            "code": fs.code,
            "topic_name": name,
            "slug": fs.expected,
            "final_filename": fs.path.name,
            "r2_key": f"booster/{fs.path.name}",
            "size_bytes": size,
            "sha256": sha_full,
            "local_path": str(fs.path),
        })

    rows.sort(key=lambda r: (r["subject"], r["stage"], r["code"]))

    with manifest_path.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "subject", "stage", "code", "topic_name", "slug",
            "final_filename", "r2_key", "size_bytes", "sha256", "local_path",
        ])
        writer.writeheader()
        writer.writerows(rows)

    print(f"\n(manifest written: {manifest_path} - {len(rows)} rows)")
    return rows


def write_upload_script(rows, root: Path, bucket: str = "coremark"):
    if not rows:
        return
    sh_path = root / "upload_to_r2.sh"
    lines = ["#!/bin/bash", "set -e", f"# Uploads {len(rows)} boosters to R2 bucket '{bucket}'",
             "# Requires: wrangler logged in / authenticated", ""]
    for r in rows:
        lines.append(
            f'wrangler r2 object put {bucket}/{r["r2_key"]} '
            f'--file="{r["local_path"]}" --content-type=application/pdf'
        )
    sh_path.write_text("\n".join(lines) + "\n")
    sh_path.chmod(0o755)
    print(f"(upload script written: {sh_path} - review before running)")


# ------------------------------------------------------------
# Main
# ------------------------------------------------------------

def main():
    global HASH_LEN

    ap = argparse.ArgumentParser(description="CoreMark booster audit/rename/hash pipeline")
    ap.add_argument("--root", required=True, help="Path to the Boosters folder")
    ap.add_argument("--apply", action="store_true",
                     help="Actually rename files. Without this flag, it's a dry run.")
    ap.add_argument("--hash-len", type=int, default=HASH_LEN,
                     help=f"Hex chars to keep from the content hash (default {HASH_LEN})")
    ap.add_argument("--bucket", default="coremark", help="R2 bucket name for upload_to_r2.sh")
    args = ap.parse_args()

    HASH_LEN = args.hash_len

    root = Path(args.root).expanduser()
    print(f"Scanning: {root}")
    print(f"Mode: {'APPLY (files will be changed)' if args.apply else 'DRY RUN (no files changed)'}\n")

    statuses = scan_root(root)
    if not statuses:
        print("No PDFs found. Check --root and the stage7/8/9 -> math/science/computing layout.")
        sys.exit(1)

    print(f"Found {len(statuses)} PDF(s) across stage7/8/9.\n")

    problems = run_audit(statuses, root)

    run_rename(statuses, apply=args.apply)

    stale_for_r2 = []
    run_hash(statuses, apply=args.apply, stale_for_r2=stale_for_r2)

    if args.apply:
        rows = write_manifest(statuses, root)
        write_upload_script(rows, root, bucket=args.bucket)
    else:
        print("\n(dry run - no manifest or upload script written; re-run with --apply to commit)")

    if stale_for_r2:
        print("\n!! Remember to delete these stale objects from R2 before re-uploading:")
        for k in stale_for_r2:
            print(f"   {k}")

    if not args.apply:
        print("\nThis was a dry run. Review the plan above, then re-run with --apply.")


if __name__ == "__main__":
    main()
