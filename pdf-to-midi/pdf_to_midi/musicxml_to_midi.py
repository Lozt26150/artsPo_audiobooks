"""Conversion MusicXML -> MIDI via music21, avec séparation des parties.

Hypothèse de structure (cf. SPEC.md, §2) : le MusicXML produit par Audiveris
pour une partition piano-voix contient une partie voix et une grande portée
de piano à deux portées (main droite en clé de sol, main gauche en clé de
fa). music21 sépare automatiquement une grande portée en deux `Part`
distincts à l'analyse du MusicXML, regroupés par un `StaffGroup` (issu du
`<part-group>` MusicXML, l'accolade de piano) ; c'est ce regroupement
structurel, plus fiable que la détection des paroles (dépendante de l'OCR
et absente sur les passages purement instrumentaux), que `split_parts`
utilise en priorité pour identifier voix / piano_md / piano_mg.
"""

from pathlib import Path

from music21 import converter, layout, stream


def load_score(musicxml_path: Path) -> stream.Score:
    """Parse le fichier MusicXML en objet Score music21."""
    return converter.parse(str(musicxml_path))


def _piano_parts_from_staff_group(score: stream.Score, parts: list) -> list | None:
    """Retourne les deux parties groupées par une accolade de piano
    (StaffGroup), ou None si aucun groupe de deux portées n'est trouvé."""
    for staff_group in score.getElementsByClass(layout.StaffGroup):
        spanned = [p for p in staff_group.getSpannedElements() if p in parts]
        if len(spanned) == 2:
            return spanned
    return None


def _piano_parts_from_lyrics(parts: list) -> tuple:
    """Repli : identifie la voix par la présence de paroles (<lyric>).
    Ne fonctionne pas sur un passage purement instrumental ou si l'OCR
    n'a pas associé les paroles aux notes."""
    voice_part = None
    piano_parts = []
    for part in parts:
        has_lyrics = any(n.lyrics for n in part.flatten().notes)
        if has_lyrics and voice_part is None:
            voice_part = part
        else:
            piano_parts.append(part)
    return voice_part, piano_parts


def split_parts(score: stream.Score) -> dict:
    """Sépare le Score en parties nommées : 'piano_md', 'piano_mg', 'voix'.

    Lève une ValueError si la structure attendue (1 voix + 2 parties piano)
    n'est pas retrouvée, ce qui signale une relecture Audiveris à revoir.
    """
    parts = list(score.parts)

    piano_parts = _piano_parts_from_staff_group(score, parts)
    if piano_parts is not None:
        voice_candidates = [p for p in parts if p not in piano_parts]
        voice_part = voice_candidates[0] if len(voice_candidates) == 1 else None
    else:
        voice_part, piano_parts = _piano_parts_from_lyrics(parts)

    if voice_part is None:
        raise ValueError(
            "Impossible d'identifier la partie voix (ni accolade de piano à "
            "2 portées, ni paroles détectées) : vérifier la relecture Audiveris "
            "(structure des portées, paroles bien associées aux notes)."
        )
    if len(piano_parts) != 2:
        raise ValueError(
            f"{len(piano_parts)} partie(s) de piano détectée(s) au lieu de 2 "
            "(main droite/main gauche) : vérifier la séparation des portées dans Audiveris."
        )

    def clef_rank(part: stream.Part) -> int:
        clefs = part.flatten().getElementsByClass("Clef")
        sign = clefs[0].sign if clefs else None
        return {"G": 0, "F": 1}.get(sign, 2)

    piano_parts = sorted(piano_parts, key=clef_rank)
    piano_md, piano_mg = piano_parts[0], piano_parts[1]

    return {"piano_md": piano_md, "piano_mg": piano_mg, "voix": voice_part}


def export_midi_per_part(parts: dict, output_dir: Path) -> dict:
    """Écrit un fichier MIDI par partie. Retourne un dict nom -> chemin fichier."""
    output_dir.mkdir(parents=True, exist_ok=True)
    output_paths = {}
    for name, part in parts.items():
        output_path = output_dir / f"{name}.mid"
        part.write("midi", fp=str(output_path))
        output_paths[name] = output_path
    return output_paths
