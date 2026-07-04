"""Orchestration bout-en-bout du pipeline PDF piano-voix -> MIDI."""

from pathlib import Path

from . import omr_audiveris
from . import musicxml_to_midi


def convert_pdf_to_midi(pdf_path: Path, output_dir: Path) -> dict:
    """Orchestration bout-en-bout : OMR batch, pause pour relecture
    manuelle (ouverture GUI Audiveris), export MusicXML, conversion
    MIDI par partie. Retourne les chemins des fichiers MIDI produits."""
    omr_project_path = omr_audiveris.run_audiveris_batch(pdf_path, output_dir)
    omr_audiveris.open_audiveris_gui(omr_project_path)
    musicxml_path = omr_audiveris.export_musicxml(omr_project_path, output_dir)
    score = musicxml_to_midi.load_score(musicxml_path)
    parts = musicxml_to_midi.split_parts(score)
    return musicxml_to_midi.export_midi_per_part(parts, output_dir)
