"""Configuration centralisée du pipeline PDF piano-voix -> MIDI.

Le pipeline s'exécute en local (voir SPEC.md, §0) : Audiveris doit être
installé séparément par l'utilisateur, son exécutable est repéré via la
variable d'environnement AUDIVERIS_HOME plutôt que codé en dur ici.
"""

from pathlib import Path
import os

# Chemin vers l'exécutable Audiveris (CLI batch + GUI).
# Ex. : export AUDIVERIS_HOME=/Applications/Audiveris.app/Contents/app/bin/Audiveris
AUDIVERIS_HOME = os.environ.get("AUDIVERIS_HOME")

# Répertoire de sortie par défaut pour les projets .omr, MusicXML et MIDI générés.
DEFAULT_OUTPUT_DIR = Path("output")

# Noms des parties attendues après séparation (cf. musicxml_to_midi.split_parts).
PART_NAMES = ("piano_md", "piano_mg", "voix")
