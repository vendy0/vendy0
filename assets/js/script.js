import { lirePanier, sauvegarder, commander } from "./modules/panier.js";
import {
  afficherFiltres,
  afficherProduits,
  afficherPanier,
  setCategorieActive,
  setTermeRecherche,
  ouvrirModal,
  fermerModal,
} from "./modules/produits.js";

// ---- Gestion des actions d'ajout/modification du panier ----
function ajouter(id) {
  const panier = lirePanier();
  const ligne = panier.find((l) => l.id === id);
  if (ligne) ligne.quantite++;
  else panier.push({ id, quantite: 1 });
  sauvegarder(panier, afficherPanier);
}

function changer(id, delta) {
  const panier = lirePanier()
    .map((l) => (l.id === id ? { ...l, quantite: l.quantite + delta } : l))
    .filter((l) => l.quantite > 0);
  sauvegarder(panier, afficherPanier);
}

// ---- Écouteurs d'événements uniques ----
document.addEventListener("click", (e) => {
  const pastille = e.target.closest("[data-zoom]");
  if (pastille) {
    ouvrirModal(pastille.dataset.zoom);
    return;
  }

  if (
    e.target.id === "modal-image" ||
    e.target.classList.contains("modal-fermer")
  ) {
    fermerModal();
    return;
  }

  const bouton = e.target.closest("button");
  if (!bouton) return;

  if (bouton.dataset.ajouter) ajouter(bouton.dataset.ajouter);
  if (bouton.dataset.plus) changer(bouton.dataset.plus, 1);
  if (bouton.dataset.moins) changer(bouton.dataset.moins, -1);
  if (bouton.dataset.categorie) {
    setCategorieActive(bouton.dataset.categorie);
    afficherFiltres();
    afficherProduits();
  }
  if (bouton.id === "commander") commander();
  if (bouton.id === "vider") sauvegarder([], afficherPanier);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fermerModal();
});

document.addEventListener("input", (e) => {
  if (e.target.id === "recherche-epice") {
    setTermeRecherche(e.target.value);
    afficherProduits();
  }
});

// ---- Démarrage ----
afficherFiltres();
afficherProduits();
afficherPanier();
