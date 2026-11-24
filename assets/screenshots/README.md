# Screenshots

Les 7 captures envoyées sont intégrées à la galerie, dans l'ordre reçu :

| Fichier | Carte |
| --- | --- |
| `01-desktop.png` | Screenshot 01 |
| `02-apps.png` | Screenshot 02 |
| `03-settings.png` | Screenshot 03 |
| `04-desktop-2.png` | Screenshot 04 |
| `05-apps-2.png` | Screenshot 05 |
| `06-settings-2.png` | Screenshot 06 |
| `07-desktop-3.png` | Screenshot 07 |

Elles sont toutes en 1280 × 800 (format 16:10), ce qui correspond exactement au format des cartes. Un clic sur une image l'ouvre en grand.

Pour remplacer une capture, écrase simplement le fichier correspondant : aucun changement de code n'est nécessaire. Pour en ajouter une 8e, duplique un bloc `<figure class="shot">` dans `index.html` et pointe son attribut `data-shot` (et son `src`) vers le nouveau fichier.

Conseils : garde le même format 16:10 ou 16:9, au moins 1280 px de large, et des noms de fichiers sans accents ni espaces.
