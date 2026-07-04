"""Conversion MusicXML -> MIDI via music21, avec séparation des parties.

Hypothèse de structure (cf. SPEC.md, §2) : le MusicXML produit par Audiveris
pour une partition piano-voix contient une partie voix (portant les paroles)
et une grande portée de piano à deux portées (main droite en clé de sol,
main gauche en clé de fa). music21 sépare automatiquement une grande portée
en deux `Part` distincts à l'analyse du MusicXML ; c'est sur cette base que
`split_parts` identifie voix / piano_md / piano_mg.
"""

from pathlib import Path

from music21 import converter, stream


def load_score(musicxml_path: Path) -> stream.Score:
    """Parse le fichier MusicXML en objet Score music21."""
    return converter.parse(str(musicxml_path))


def split_parts(score: stream.Score) -> dict:
    """Sépare le Score en parties nommées : 'piano_md', 'piano_mg', 'voix'.

    Heuristique : la partie voix est celle portant des paroles (<lyric>) ;
    parmi les deux parties restantes (piano), celle en clé de sol est la
    main droite (piano_md), celle en clé de fa la main gauche (piano_mg).
    Lève une ValueError si la structure attendue (1 voix + 2 parties piano)
    n'est pas retrouvée, ce qui signale une relecture Audiveris à revoir.
    """
    voice_part = None
    piano_parts = []

    for part in score.parts:
        has_lyrics = any(n.lyrics for n in part.flatten().notes)
        if has_lyrics and voice_part is None:
            voice_part = part
        else:
            piano_parts.append(part)

    if voice_part is None:
        raise ValueError(
            "Impossible d'identifier la partie voix (aucune parole détectée) : "
            "vérifier la relecture Audiveris (paroles bien associées aux notes)."
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

    piano_parts.sort(key=clef_rank)
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
