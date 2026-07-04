# pdf-to-midi

Pipeline personnel de conversion PDF (piano-voix imprimé) vers MIDI. Voir `SPEC.md` pour l'architecture complète.

## Prérequis externes

- **Audiveris** (OMR + éditeur de relecture) : n'est pas installable via pip/conda. À installer séparément depuis les releases officielles (JVM 17+ requis). Une fois installé, définir la variable d'environnement `AUDIVERIS_HOME` pointant vers l'exécutable CLI.

## Installation de l'environnement Python

```bash
conda env create -f environment.yml
conda activate pdf-to-midi
```

## Corpus de test

Le dossier `corpus_test/` est volontairement exclu du dépôt (`.gitignore`) : il contient des partitions potentiellement sous droits, à usage strictement local.
