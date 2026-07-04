"""Point d'entrée en ligne de commande du pipeline PDF piano-voix -> MIDI.

Usage : python -m pdf_to_midi.cli convert <pdf> [--output DIR]
"""

import argparse
from pathlib import Path

from . import config
from .pipeline import convert_pdf_to_midi


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Convertit un PDF de partition piano-voix imprimée en fichiers MIDI "
            "séparés (piano_md, piano_mg, voix), avec relecture manuelle Audiveris."
        )
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    convert_parser = subparsers.add_parser("convert", help="Convertit un PDF en MIDI")
    convert_parser.add_argument("pdf", type=Path, help="Chemin du fichier PDF à convertir")
    convert_parser.add_argument(
        "--output",
        type=Path,
        default=config.DEFAULT_OUTPUT_DIR,
        help=f"Répertoire de sortie (défaut : {config.DEFAULT_OUTPUT_DIR})",
    )

    args = parser.parse_args()

    if args.command == "convert":
        midi_paths = convert_pdf_to_midi(args.pdf, args.output)
        for name, path in midi_paths.items():
            print(f"{name}: {path}")


if __name__ == "__main__":
    main()
