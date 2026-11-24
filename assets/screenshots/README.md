# Screenshots

Trois images provisoires sont déjà présentes dans ce dossier pour montrer à quoi ressemblera la galerie. **Remplace-les simplement par tes vraies captures** en gardant exactement les mêmes noms :

| Fichier | Emplacement sur le site |
| --- | --- |
| `01-desktop.png` | « The live desktop » |
| `02-apps.png` | « Apps at a glance » |
| `03-settings.png` | « Under the hood » |

Le site détecte les images automatiquement au chargement : l'illustration provisoire est remplacée par l'image du dossier, avec un clic pour l'agrandir. **Aucune modification du HTML n'est nécessaire.**

Si tu veux ajouter une 4e capture, duplique un bloc `<figure class="shot">` dans `index.html` et pointe son attribut `data-shot` vers le nouveau fichier.

Conseils : format 16:10 ou 16:9, au moins 1280 px de large, et des noms de fichiers sans accents ni espaces.
