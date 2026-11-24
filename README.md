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

Tous les boutons « Download » affichent d'abord la fenêtre d'avertissement beta. Après « I agree — download ISO », le fichier est téléchargé dans le dossier Downloads — **aucune redirection vers le dépôt**.

Le lien, le nom de fichier et le hash se règlent depuis `admin.html` (code par défaut : `obryx-admin`, à changer dans l'interface). Ils sont sauvegardés dans le `localStorage` **de ton navigateur uniquement** : les autres visiteurs n'ont aucun lien configuré. Si aucun lien n'est sauvegardé, le bouton affiche un avertissement au lieu de télécharger.

La console admin contient huit onglets :
- **Download** : presets GoFile / URL directe / fichier local, validation SHA-256, copie du lien et du hash.
- **Appearance** : couleur d'accent (teal / indigo / amber / violet / **couleur personnalisée**) et activation des particules, boutons magnétiques, ticker et bouton « retour en haut ».
- **Style** : presets Neon / Clean / Midnight / Retro, réglages de glow, grain, scanlines, vignette, coins HUD, shine du hero, rayon des cartes, vitesse des animations et taille du titre ; textes éditables (eyebrow, titre, paragraphe, fine print, ticker) et CSS personnalisé filtré (imports/scripts bloqués).
- **Visitors** : nombre de visites **aujourd'hui**, hier, sur 7 jours et au total, avec graphique sur 7 jours. Le compteur est local à chaque navigateur (`obryxVisits`, 30 jours max). Pour un compteur **mondial**, renseigne une URL de service type `countapi.xyz` : chaque chargement du site enverra un hit.
- **Gallery** : voir les captures, les **renommer** (édition sur place), les supprimer, les réordonner ou en ajouter (fichier image redimensionné ou URL). La galerie publique suit cette configuration ; le bouton *Restore defaults* ramène les 7 captures d'origine. Les images uploadées restent dans le `localStorage` du navigateur — utilise **Transfer** pour les partager.
- **Security** : changement du code, verrouillage immédiat, reset complet (historique de visites et galerie inclus).
- **Transfer** : export/import d'un fichier `obryx-settings.json` pour passer la configuration à un ami sans hébergement (le code d'accès n'est jamais exporté ; l'URL du compteur distant est incluse).
- **Diagnostics** : rapport navigateur/écran/réglages et vérification que les fichiers du site sont accessibles.

L'aura qui suivait le curseur a été supprimée.

Le hash affiché (`46d071d4d011ff0…`) et le nom de fichier sont également définis en haut de `script.js` si besoin de les changer pour une future version.

## 2. Ajouter les captures d'écran

Voir [`assets/screenshots/README.md`](assets/screenshots/README.md). En résumé : les 7 captures `obryx-shot-01.png` → `obryx-shot-07.png` sont déjà intégrées ; un clic ouvre le lightbox, avec flèches ← → pour naviguer.

## 3. Modifier le contenu

- `index.html` — textes et structure (tout est en anglais). Les crédits sont dans le footer et dans une fenêtre **Credits** : site par **M_N_M_S** pour **MDZ**, Obryx OS créé par **MDZ**.
- `styles.css` — couleurs, animations, mise en page responsive.
- `enhance.css` — couche « showcase » (interface OS animée, bento, HUD, modal, effets 3D).
- `script.js` — URL de téléchargement, fenêtre beta, copie du hash, menu, lightbox, animations et dock interactif du hero (5 icônes cliquables, chacune avec son panneau ; survol qui soulève les icônes une par une).

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

## 5. Console admin Windows (.exe)

`ObryxAdmin.exe` (à la racine du dépôt) ouvre **la vraie console admin** du site dans une fenêtre Windows dédiée :

- code d'accès **`obryx-admin` intégré** → déverrouillage automatique ;
- tous les onglets du site : Download, Appearance, Style, Visitors, Gallery, Security, Transfer, Diagnostics ;
- barre d'outils intégrée : *Open site*, *Copy config* ;
- stockage WebView persistant dans `%LOCALAPPDATA%\ObryxAdminTool`.

Téléchargement direct : https://mathis363.github.io/obryx-os/ObryxAdmin.exe

⚠️ Le `localStorage` de cette fenêtre est **séparé** de celui de ton navigateur habituel. Pour appliquer les réglages sur le site ouvert dans Chrome/Edge : **Export settings** dans l'exe, puis **Import settings** dans l'admin du site. Le code d'accès n'est jamais exporté.

Pour utiliser un autre code sans recompiler, place un fichier `obryx-code.txt` contenant ce code à côté de l'exe.

Pour reconstruire l'exe (Python + PyInstaller installés) :

```bash
cd tools
pyinstaller --noconfirm --onefile --noconsole --name ObryxAdmin --distpath dist --workpath build --specpath . obryx_admin_tool.py
copy dist\ObryxAdmin.exe ..\ObryxAdmin.exe
```
