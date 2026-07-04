"""Wrapper autour de la CLI Audiveris (OMR batch + éditeur de relecture).

Les options de ligne de commande ci-dessous ont été vérifiées contre la
sortie de `Audiveris -help` (v5.10.2, macOS arm64) : -batch, -save,
-transcribe, -export, -output sont bien celles attendues par cette version.
"""

from pathlib import Path
import subprocess

from . import config


def _audiveris_executable() -> str:
    """Retourne le chemin de l'exécutable Audiveris, lève une erreur explicite
    si AUDIVERIS_HOME n'est pas configuré."""
    if not config.AUDIVERIS_HOME:
        raise RuntimeError(
            "AUDIVERIS_HOME n'est pas défini. Définis cette variable "
            "d'environnement vers l'exécutable Audiveris avant de lancer le pipeline."
        )
    return config.AUDIVERIS_HOME


def run_audiveris_batch(pdf_path: Path, output_dir: Path) -> Path:
    """Lance Audiveris en mode batch (CLI headless) sur le PDF fourni.
    -transcribe force la reconnaissance complète (sans quoi le batch se
    contente de charger la feuille, laissant l'éditeur GUI sans rien à
    corriger). Retourne le chemin du projet .omr généré (book Audiveris)."""
    output_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            _audiveris_executable(),
            "-batch",
            "-transcribe",
            "-save",
            "-output",
            str(output_dir),
            "--",
            str(pdf_path),
        ],
        check=True,
    )
    omr_project_path = output_dir / f"{pdf_path.stem}.omr"
    if not omr_project_path.exists():
        raise FileNotFoundError(
            f"Projet .omr introuvable après traitement Audiveris : {omr_project_path}"
        )
    return omr_project_path


def open_audiveris_gui(omr_project_path: Path) -> None:
    """Ouvre l'éditeur graphique Audiveris sur le projet, pour relecture
    et correction manuelle par l'utilisateur. Bloquant : rend la main
    une fois Audiveris fermé. Important : l'utilisateur doit enregistrer
    (Cmd+S) le projet dans Audiveris avant de fermer la fenêtre, sinon
    les corrections ne sont pas prises en compte par export_musicxml."""
    subprocess.run([_audiveris_executable(), str(omr_project_path)], check=True)


def export_musicxml(omr_project_path: Path, output_dir: Path) -> Path:
    """Exporte le MusicXML (.mxl) depuis le projet .omr corrigé.
    Retourne le chemin du fichier .mxl produit."""
    output_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            _audiveris_executable(),
            "-batch",
            "-export",
            "-output",
            str(output_dir),
            "--",
            str(omr_project_path),
        ],
        check=True,
    )
    musicxml_path = output_dir / f"{omr_project_path.stem}.mxl"
    if not musicxml_path.exists():
        raise FileNotFoundError(
            f"Fichier MusicXML introuvable après export Audiveris : {musicxml_path}"
        )
    return musicxml_path
