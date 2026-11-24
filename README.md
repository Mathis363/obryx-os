# Obryx OS — site officiel (GitHub Pages)

Site statique en anglais pour **Obryx OS 0.4 Alpha4** : présentation, avertissement beta, guide d'installation depuis une clé USB, configuration requise, vérification SHA-256 et galerie de captures d'écran.

**URL prévue :** https://mathis363.github.io/obryx-os/

Aucun build, aucune dépendance à installer : c'est du HTML/CSS/JS pur.

---

## 1. Faire fonctionner le bouton « Download »

GitHub ne peut **pas** héberger l'ISO :

- un fichier dans un dépôt est limité à 100 Mo ;
- un asset de Release est limité à **2 GiB** (source : [docs GitHub](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)) ;
- or l'ISO fait **3,7 Go**.

Il faut donc uploader l'ISO chez un hébergeur qui accepte les gros fichiers avec un **lien direct** (ex. Google Drive en lien direct, MEGA, SourceForge, un serveur perso, Cloudflare R2…), puis coller ce lien dans **une seule ligne** :

```js
// script.js, tout en haut
const DOWNLOAD_URL = "https://exemple.com/Obryx-OS-0.4-Alpha4-x86_64.iso";
```

Tous les boutons « Download » du site pointent vers cette URL. Tant que tu ne l'as pas remplacée, ils renvoient vers la page Releases du dépôt — pense à y publier une release si tu veux une solution temporaire.

Le hash affiché (`46d071d4d011ff0…`) et le nom de fichier sont également définis en haut de `script.js` si besoin de les changer pour une future version.

## 2. Ajouter les captures d'écran

Voir [`assets/screenshots/README.md`](assets/screenshots/README.md). En résumé : dépose `obryx-shot-01.png`, `obryx-shot-02.png` et `obryx-shot-03.png` dans ce dossier, puis recharge la page. Les images apparaissent automatiquement.

## 3. Modifier le contenu

- `index.html` — textes et structure (tout est en anglais).
- `styles.css` — couleurs, animations, mise en page responsive.
- `script.js` — URL de téléchargement, copie du hash, menu, lightbox, animations.

Couleurs principales à changer dans `:root` en haut de `styles.css` : `--teal`, `--indigo`, `--violet`, `--lime`.

## 4. Publier sur GitHub Pages

Le dépôt `Mathis363/obryx-os` est déjà créé et contient ces fichiers sur `main`. Ensuite :

1. Va sur https://github.com/Mathis363/obryx-os/settings/pages
2. **Build and deployment → Source** : choisis **Deploy from a branch**
3. **Branch** : `main` / **/(root)**, puis **Save**
4. Attends 1 à 2 minutes, l'URL sera https://mathis363.github.io/obryx-os/

À chaque `git push` sur `main`, le site se met à jour tout seul.

### En local

Ouvre simplement `index.html` dans un navigateur. Ou lance un petit serveur :

```bash
cd obryx-site
python -m http.server 8000
# http://localhost:8000
```
