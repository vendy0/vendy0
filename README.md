# Nisca Store

Nisca Store est une boutique en ligne d'épices construite uniquement avec HTML, CSS et JavaScript. Il n'y a ni serveur ni base de données : les produits sont décrits dans des fichiers JSON, le panier est conservé dans le navigateur et la commande part sous la forme d'un message WhatsApp déjà rédigé.

Site en ligne : https://vendy0.github.io/vendy0

## Pages

- `index.html` : page d'accueil, avec les cinq familles d'épices et les étapes pour commander.
- `boutique.html` : liste des produits, filtres par catégorie et panier.
- `contact.html` : coordonnées et lien vers WhatsApp.

## Fonctionnement

**Les produits.** Chaque produit est un objet dans `assets/js/produits/PRODUITS.json` : identifiant, catégorie, nom, description, prix, niveau de piquant et image. Les catégories et les niveaux de piquant sont dans deux autres fichiers JSON. Ajouter un produit revient donc à ajouter un objet dans la liste, sans toucher au code.

**Le panier.** Il est enregistré dans le `localStorage` du navigateur. On ne garde que l'identifiant et la quantité de chaque ligne, jamais le prix : celui-ci est relu dans la liste de produits à chaque affichage. Un prix modifié dans le JSON se répercute donc partout, même sur un panier déjà rempli.

**Les prix.** Ils sont stockés en centimes (entiers) pour éviter les erreurs d'arrondi de JavaScript sur les décimales, puis affichés en euros avec `toLocaleString("fr-FR")`.

**La commande.** Au clic sur le bouton de commande, le script assemble un texte avec chaque ligne du panier et le total, l'encode avec `encodeURIComponent` et ouvre un lien `https://wa.me/...?text=...`. Le vendeur reçoit la commande dans WhatsApp. Il n'y a pas de paiement en ligne.

**Les clics.** Un seul écouteur d'événement sur le document gère tous les boutons (ajout, quantité, filtres, commande). Chaque bouton indique son rôle avec un attribut `data-`.

**L'accueil.** L'image de fond est posée sur un calque fixe. Les sections pleines la cachent et les sections transparentes la laissent voir au défilement. Les éléments apparaissent grâce à un `IntersectionObserver`, et le bandeau d'épices défile en CSS pur.

## Structure du projet

```
index.html  boutique.html  contact.html
assets/
  css/   style.css  accueil.css  boutique.css  contact.css
  img/   logo.svg  fond.svg  produits/ (photos)
  js/    script.js  accueil.js
         modules/   panier.js  produits.js
         produits/  PRODUITS.json  CATEGORIES.json  NIVEAUX.json
```

## Lancer le projet en local

Les modules JavaScript et l'import des fichiers JSON ne fonctionnent pas quand on ouvre un fichier HTML directement (`file://`). Il faut un petit serveur local :

- avec VS Code, l'extension Live Server, puis « Go Live » ;
- ou, dans le dossier du projet, `python -m http.server`, puis http://localhost:8000.

Un navigateur récent est nécessaire pour l'import JSON (Chrome 123, Firefox 138 ou Safari 17.2 et plus).

## Choix de conception

La palette (cacao, lin, safran) vient des épices. La police est Archivo. Les feuilles de style sont écrites pour l'ordinateur d'abord, puis adaptées aux écrans plus petits avec des `@media (max-width)`. Les couleurs sont des variables CSS déclarées une seule fois dans `style.css`.

## Limites

- Le panier est propre à chaque navigateur : il ne suit pas l'utilisateur d'un appareil à l'autre.
- Les prix et le total sont calculés dans le navigateur, donc modifiables par un utilisateur averti. Le vendeur doit vérifier la commande reçue.
- Il n'y a pas de gestion de stock ni de paiement.

## Contexte

Projet réalisé par Andy V. Descartes (vendy0 sur GitHub) pour un devoir sur HTML, CSS et JavaScript. L'IA a été utilisée comme aide, comme le permettaient les consignes.
