"""Download model weights ahead of time so the first separation isn't slow or offline-fragile.

    python scripts/download_models.py                 # the default model
    python scripts/download_models.py htdemucs_ft     # specific model(s)
    python scripts/download_models.py --all

Weights are fetched by Demucs from dl.fbaipublicfiles.com and cached by PyTorch
(under ``$TORCH_HOME/hub/checkpoints``, by default ``~/.cache/torch/hub/checkpoints``).
Sizes are roughly 80 MB for each htdemucs-family network; htdemucs_ft is four of them.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.catalog import DEFAULT_MODEL_ID, MODELS_BY_ID  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("models", nargs="*", help=f"model ids ({', '.join(MODELS_BY_ID)})")
    parser.add_argument("--all", action="store_true", help="download every model")
    args = parser.parse_args()

    wanted = list(MODELS_BY_ID) if args.all else (args.models or [DEFAULT_MODEL_ID])
    unknown = [m for m in wanted if m not in MODELS_BY_ID]
    if unknown:
        print(f"Unknown model(s): {', '.join(unknown)}. Valid: {', '.join(MODELS_BY_ID)}", file=sys.stderr)
        return 2

    try:
        from demucs.pretrained import get_model
    except ImportError:
        print("Demucs isn't installed. Run: pip install -r requirements.txt", file=sys.stderr)
        return 1

    # Several catalog entries share one network (htdemucs_vocals reuses htdemucs).
    for name in dict.fromkeys(MODELS_BY_ID[m].demucs_name for m in wanted):
        print(f"Fetching {name} ...", flush=True)
        get_model(name)
    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
