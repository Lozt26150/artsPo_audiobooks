# SPEC — Pipeline PDF (piano-voix imprimé) → MIDI

Statut : **en attente de validation humaine**. Aucun code n'a été écrit avant ce document.

## 0. Cadrage (rappel des réponses de l'interview)

| Question | Décision |
|---|---|
| Format de sortie MIDI | Fichiers **séparés par portée/voix** (piano main droite, piano main gauche, voix chantée) |
| Intervention humaine | **Relecture manuelle obligatoire** après OMR, avant export MusicXML→MIDI |
| Environnement Python | **Python 3.11+ / conda-mamba** |
| Emplacement du code | Sous-dossier `pdf-to-midi/` de ce dépôt (`artspo_audiobooks`), isolé de la PWA existante |
| Reconnaissance manuscrite | Hors scope V1 (voir §4) |
| Réseau / redistribution | Aucun — usage strictement local et personnel (la licence AGPLv3 d'Audiveris n'est donc pas contraignante) |

[INFORMATION_MANQUANTE] Chemin exact du corpus-test sur ta machine. Il n'est **pas prévu de le committer dans ce dépôt** : ce sont des partitions probablement sous droits (piano-voix édité), donc à garder hors git (dossier local ignoré, cf. §3).

[HYPOTHÈSE] Le pipeline est destiné à être exécuté **sur ta machine locale**, pas dans cet environnement d'exécution distant/éphémère. Audiveris est une application Java avec interface graphique (nécessaire à l'étape de relecture manuelle) : elle ne peut pas tourner de façon interactive dans ce conteneur sandbox headless. Ce dépôt contiendra donc le code du pipeline (scripts, config, doc), mais l'exécution réelle — y compris l'étape de vérification finale (§5) — se fera chez toi, avec Audiveris installé localement. Merci de confirmer cette hypothèse.

---

## 1. Comparatif Audiveris vs oemer (usage piano-voix imprimé)

| Critère | **Audiveris** | **oemer** |
|---|---|---|
| Licence | AGPLv3 (non contraignante ici, cf. cadrage) | AGPLv3 [HYPOTHÈSE — à vérifier sur le dépôt exact au moment de l'installation, les licences des projets OMR open-source évoluent] |
| Formats de sortie natifs | MusicXML (`.mxl`/`.xml`) **et** projet éditable `.omr` (modèle book/sheet, ré-ouvrable) | MusicXML uniquement, pas de format projet ré-éditable |
| Éditeur intégré | **Oui** — interface graphique dédiée à la correction (notes, portées, liaisons, paroles, mesures) avant export | **Non** — aucune UI de correction ; toute correction doit se faire après coup dans un éditeur MusicXML externe (ex. MuseScore), sans lien avec les données de reconnaissance d'origine |
| Reconnaissance des paroles (lignes de texte chanté) | Gérée via OCR intégré (Tesseract), associée aux notes | [INFORMATION_MANQUANTE] Support des paroles historiquement faible/absent — oemer se concentre sur hauteurs/rythme/têtes de note, pas sur la couche texte. Point bloquant pour un usage piano-voix où la ligne mélodique porte des paroles. |
| Dépendances | JVM 17+, Tesseract (OCR), modèles de deep learning embarqués ; pas d'installation via pip/conda — distribution via releases GitHub (installeur natif) | Python, ONNXRuntime, OpenCV — installable via pip dans l'environnement conda |
| Robustesse documentée sur portées multiples (piano bimanuel + voix) | Cas d'usage central du projet depuis 10+ ans : grand staff, systèmes multi-portées, crochets, nuances, texte | Principalement benchmarké sur partitions simples à une portée ; support grande portée présent mais moins éprouvé en production sur partitions denses de type piano-voix édité |
| Exclusion explicite du manuscrit | Oui, documentée | Oui (aucun des deux outils ne prétend gérer le manuscrit) |
| Mode batch / headless | Oui (CLI) pour l'OMR initial, GUI requise pour la relecture | Oui (CLI uniquement, pas de GUI de toute façon) |

**Choix retenu : Audiveris.** [CHOIX_TECHNIQUE] Décisif sur deux points pour ce projet : (1) l'éditeur intégré correspond exactement au niveau d'intervention humaine choisi ci-dessus (relecture avant export), (2) la reconnaissance des paroles est indispensable pour du piano-voix et n'est pas un point fort d'oemer. oemer resterait pertinent pour un usage purement automatique sur partitions instrumentales sans texte — hors de notre cas.

---

## 2. Architecture du pipeline

```
PDF (corpus-test, hors dépôt)
   │
   ▼
[1] Audiveris — OMR batch (CLI headless)
   │   produit un projet .omr (book Audiveris)
   ▼
[2] Audiveris — GUI, relecture manuelle obligatoire
   │   corrections : notes, portées, liaison paroles/notes, mesures
   │   export manuel ou scripté du projet corrigé
   ▼
[3] Export MusicXML (.mxl) depuis le projet .omr corrigé
   │
   ▼
[4] music21 — parsing MusicXML → Score
   │   identification des parties (piano MD, piano MG, voix)
   ▼
[5] music21 — un fichier MIDI par partie (piano MD / piano MG / voix)
   │
   ▼
[6] Vérification humaine : écoute + comparaison visuelle avec le PDF original
```

**Pourquoi music21 pour l'étape MusicXML→MIDI** [CHOIX_TECHNIQUE] : music21 comprend la sémantique de partition (parties, portées, voix, liaisons, altérations, armures, tempo) directement depuis le MusicXML, ce qui est nécessaire pour séparer proprement piano MD/MG/voix en parties MIDI distinctes. `pretty_midi` travaille au niveau MIDI et n'a pas de parseur MusicXML — il serait pertinent en post-traitement (quantification, vélocités) mais pas pour cette conversion structurelle. music21 gère aussi nativement l'écriture `.write('midi')` par flux (`Part`) ou par score complet.

**Étape [1]/[2]/[3] : appel à Audiveris.** Audiveris ingère le PDF directement (rendu interne via sa propre chaîne PDF→image, pas besoin d'un module de conversion PDF→image séparé dans notre code). [CHOIX_TECHNIQUE] Un pré-traitement PDF→image dédié n'est donc prévu que si la résolution par défaut s'avère insuffisante (auquel cas un module utilisant `pdf2image`/PyMuPDF à DPI configurable serait ajouté — non prévu en V1).

**Identification des parties (piano MD/MG/voix) dans le MusicXML** [INFORMATION_MANQUANTE] : dépend de la façon dont Audiveris nomme/ordonne les `<part>` du MusicXML exporté (typiquement par ordre des portées du système : voix en haut, piano MD/MG en dessous en grande portée). Une heuristique sera nécessaire (ordre des parties + présence d'un `<lyric>` pour identifier la voix + regroupement `<part-group>` pour le piano). À affiner lors du test sur le corpus réel (phase 3, module 3).

---

## 3. Fichiers et modules à créer

```
pdf-to-midi/
├── SPEC.md                      (ce document)
├── environment.yml              (env conda : python=3.11, music21, ...)
├── .gitignore                   (exclut le corpus-test et les sorties locales)
├── pdf_to_midi/
│   ├── __init__.py
│   ├── config.py
│   ├── omr_audiveris.py
│   ├── musicxml_to_midi.py
│   ├── pipeline.py
│   └── cli.py
└── corpus_test/                 (gitignored — partitions PDF de test, non commitées)
```

### `pdf_to_midi/config.py`
Constantes et chemins par défaut (répertoire de sortie, chemin vers l'exécutable Audiveris, DPI par défaut).
[INFORMATION_MANQUANTE] Chemin d'installation d'Audiveris sur ta machine (à renseigner, ex. variable d'environnement `AUDIVERIS_HOME` ou chemin dans un fichier `config.local.yml` non versionné).

### `pdf_to_midi/omr_audiveris.py`
```python
def run_audiveris_batch(pdf_path: Path, output_dir: Path) -> Path:
    """Lance Audiveris en mode batch (CLI headless) sur le PDF fourni.
    Retourne le chemin du projet .omr généré (book Audiveris)."""

def open_audiveris_gui(omr_project_path: Path) -> None:
    """Ouvre l'éditeur graphique Audiveris sur le projet, pour relecture
    et correction manuelle par l'utilisateur. Bloquant : rend la main
    une fois Audiveris fermé."""

def export_musicxml(omr_project_path: Path, output_dir: Path) -> Path:
    """Exporte le MusicXML (.mxl) depuis le projet .omr corrigé.
    Retourne le chemin du fichier .mxl produit."""
```

### `pdf_to_midi/musicxml_to_midi.py`
```python
def load_score(musicxml_path: Path) -> music21.stream.Score:
    """Parse le fichier MusicXML en objet Score music21."""

def split_parts(score: music21.stream.Score) -> dict[str, music21.stream.Part]:
    """Sépare le Score en parties nommées : 'piano_md', 'piano_mg', 'voix'.
    Heuristique basée sur l'ordre des <part>, les <part-group>, et la
    présence de <lyric> pour repérer la voix. Lève une exception si
    l'identification échoue et nécessite une confirmation manuelle."""

def export_midi_per_part(parts: dict[str, music21.stream.Part], output_dir: Path) -> dict[str, Path]:
    """Écrit un fichier MIDI par partie. Retourne un dict nom -> chemin fichier."""
```

### `pdf_to_midi/pipeline.py`
```python
def convert_pdf_to_midi(pdf_path: Path, output_dir: Path) -> dict[str, Path]:
    """Orchestration bout-en-bout : OMR batch, pause pour relecture
    manuelle (ouverture GUI Audiveris), export MusicXML, conversion
    MIDI par partie. Retourne les chemins des fichiers MIDI produits."""
```

### `pdf_to_midi/cli.py`
Point d'entrée `argparse` : `python -m pdf_to_midi.cli convert <pdf> [--output DIR]`.

### `environment.yml`
Environnement conda : `python=3.11`, `music21`, dépendances de test. Audiveris **n'est pas gérable via conda** : installation séparée documentée dans un `README.md` du sous-dossier (prérequis externe, lien vers les releases GitHub officielles).

### `.gitignore`
Exclut `corpus_test/` et tout répertoire de sortie (`output/`, `*.mid`, `*.omr`, `*.mxl`) pour ne jamais committer de partitions sous droits ni leurs dérivés.

---

## 4. [HORS_SCOPE_V1] Note sur la reconnaissance manuscrite

Aucune bibliothèque open-source de production ne gère fiablement la partition manuscrite à ce jour. Audiveris exclut explicitement ce cas de son périmètre (conçu pour la notation imprimée). Les travaux académiques existants (jeux de données comme MUSCIMA++, publications sur la reconnaissance de portées manuscrites) restent expérimentaux, sans outil stable et généraliste. Ce sujet est documenté ici comme piste de R&D à moyen terme, sans tentative d'implémentation ni de solution de contournement dans ce pipeline.

---

## 5. Vérification finale

Une fois les modules 1 à 4 implémentés (phase 3, un par un, avec validation à chaque étape) :

1. Exécuter le pipeline complet sur **au moins deux partitions piano-voix** du corpus-test (imprimées, notation occidentale courante).
2. Pour chacune : relecture manuelle dans l'éditeur Audiveris (correction des erreurs d'OMR visibles).
3. Comparer visuellement la partition originale (PDF) et le rendu de vérification (ex. réimport du MusicXML corrigé dans MuseScore, ou simple relecture des notes exportées).
4. Écouter les fichiers MIDI produits (piano MD, piano MG, voix) et vérifier leur cohérence avec la partition (hauteurs, rythme, alignement voix/paroles).
5. Consigner les écarts constatés (faux positifs/négatifs de l'OMR, erreurs de séparation de parties) pour ajuster l'heuristique `split_parts` si nécessaire.

[INFORMATION_MANQUANTE] Chemin des deux (ou plus) partitions de test à utiliser pour cette vérification.

---

## Points à valider avant implémentation

- [ ] Confirmer l'hypothèse d'exécution locale (§0) — le pipeline tourne chez toi, pas dans ce conteneur distant.
- [ ] Confirmer le choix Audiveris (§1).
- [ ] Fournir le chemin (local) du corpus-test, ou au moins 1-2 exemples à copier temporairement pour test dans `corpus_test/` (non commité).
- [ ] Confirmer/renseigner le chemin d'installation d'Audiveris (§3, `config.py`).
- [ ] Valider les signatures de fonctions proposées (§3) — aucun module ne sera codé au-delà de ce qui est validé ici.
