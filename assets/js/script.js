// ---- Réglages ----
import PRODUITS from "./produits/PRODUITS.json" with { type: "json" };
import CATEGORIES from "./produits/CATEGORIES.json" with { type: "json" };
import NIVEAUX from "./produits/NIVEAUX.json" with { type: "json" };

const NUMERO_WHATSAPP = "594694913097"; // Numéro de NISCA STORE pour la commande via WhatsApp
const CLE = "nisca-panier"; // nom de la case dans localStorage

// ---- Gestion de la modale d'image ----
const modal = document.getElementById("modal-image");
const modalImg = document.getElementById("modal-img-contenu");

// ---- Outils ----
let categorieActive = "tout"; // la catégorie affichée en ce moment
let termeRecherche = ""; // le terme de recherche saisi par l'utilisateur

const trouver = (id) => PRODUITS.find((p) => p.id === id);
const formater = (n) =>
  (n / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

// ---- Panier : on ne stocke que {id, quantite}, le prix vient toujours de la liste ----
function lirePanier() {
  try {
    const donnees = JSON.parse(localStorage.getItem(CLE)) || [];
    return donnees.filter((ligne) => trouver(ligne.id)); // ignore les produits qui n'existent plus
  } catch {
    return [];
  }
}

function sauvegarder(panier) {
  localStorage.setItem(CLE, JSON.stringify(panier));
  afficherPanier();
}

function ajouter(id) {
  const panier = lirePanier();
  const ligne = panier.find((l) => l.id === id);
  if (ligne)
    ligne.quantite++; // déjà dans le panier : +1
  else panier.push({ id, quantite: 1 }); // sinon : nouvelle ligne
  sauvegarder(panier);
}

function changer(id, delta) {
  const panier = lirePanier()
    .map((l) => (l.id === id ? { ...l, quantite: l.quantite + delta } : l))
    .filter((l) => l.quantite > 0); // à 0, la ligne disparaît
  sauvegarder(panier);
}

function totalPanier(panier) {
  return panier.reduce(
    (somme, l) => somme + trouver(l.id).prix * l.quantite,
    0,
  );
}

// ---- Affichage ----
function afficherFiltres() {
  const zone = document.getElementById("filtres");
  if (!zone) return;
  const boutons = [["tout", "Tout"], ...Object.entries(CATEGORIES)];
  zone.innerHTML = boutons
    .map(([cle, nom]) => {
      const nombre =
        cle === "tout"
          ? PRODUITS.length
          : PRODUITS.filter((p) => p.categorie === cle).length;
      return `<button class="filtre" data-categorie="${cle}" aria-pressed="${cle === categorieActive}">${nom} (${nombre})</button>`;
    })
    .join("");
}

function afficherProduits() {
  const zone = document.getElementById("produits");
  if (!zone) return; // On n'est pas sur la page boutique

  // 1. Filtrage combiné (catégorie + texte recherché sans accents ni casse)
  const visibles = PRODUITS.filter((p) => {
    // Filtre par catégorie
    const correspondCategorie =
      categorieActive === "tout" || p.categorie === categorieActive;

    // Fonction utilitaire pour nettoyer les accents et les majuscules
    const normaliser = (texte) =>
      texte
        ? texte
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
        : "";

    // Nettoyage du texte recherché et des données du produit
    const texte = normaliser(termeRecherche);
    const nomProduit = normaliser(p.nom);
    const descProduit = normaliser(p.desc);

    const correspondTexte =
      !texte || nomProduit.includes(texte) || descProduit.includes(texte);

    return correspondCategorie && correspondTexte;
  });

  if (visibles.length === 0) {
    zone.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; padding: 2rem 0;">Aucune épice ne correspond à votre recherche.</p>`;
    return;
  }

  zone.innerHTML = visibles
    .map(
      (p) => `
    <li class="produit">
      <span class="pastille" ${p.url ? `data-zoom="${p.url}"` : ""} style="background: ${p.url ? "transparent" : p.couleur}">
        ${p.url ? `<img src="${p.url}" alt="${p.nom}">` : ""}
      </span>
      <div class="infos">
        <h3>${p.nom}</h3>
        <p>${p.desc}</p>
        <p class="piquant niveau-${p.piquant}">${NIVEAUX[p.piquant]}</p>
      </div>
      <div class="achat">
        <strong>${formater(p.prix)}</strong>
        <button data-ajouter="${p.id}">Ajouter</button>
      </div>
    </li>`,
    )
    .join("");
}

function afficherPanier() {
  const panier = lirePanier();

  const compteur = document.getElementById("compteur");
  if (compteur)
    compteur.textContent = panier.reduce((s, l) => s + l.quantite, 0);

  const liste = document.getElementById("panier-liste");
  if (!liste) return;

  liste.innerHTML =
    panier.length === 0
      ? "<p>Votre panier est vide. Ajoutez une épice dans la liste.</p>"
      : panier
          .map((l) => {
            const p = trouver(l.id);
            return `
        <div class="ligne-panier">
          <span>${p.nom}</span>
          <strong>${formater(p.prix * l.quantite)}</strong>
          <span class="quantite">
            <button class="qte" data-moins="${p.id}" aria-label="Retirer un ${p.nom}">−</button>
            ${l.quantite}
            <button class="qte" data-plus="${p.id}" aria-label="Ajouter un ${p.nom}">+</button>
          </span>
        </div>`;
          })
          .join("");

  document.getElementById("total").textContent = formater(totalPanier(panier));
  document.getElementById("commander").disabled = panier.length === 0;
}

// ---- Commande WhatsApp ----
function commander() {
  const panier = lirePanier();
  if (panier.length === 0) return;

  const lignes = panier.map((l) => {
    const p = trouver(l.id);
    return `- ${l.quantite} × ${p.nom} (${formater(p.prix * l.quantite)})`;
  });
  const message = [
    "Bonjour Nisca Store, je voudrais commander :\n",
    ...lignes,
    `\nTotal : ${formater(totalPanier(panier))}`,
  ].join("\n");

  window.open(
    `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`,
    "_blank",
  );
}

// ---- Fonctions de la Modale ----
function ouvrirModal(url) {
  if (!modal || !modalImg) return;
  modalImg.src = url;
  modal.classList.add("ouvert");
  modal.setAttribute("aria-hidden", "false");
}

function fermerModal() {
  if (!modal) return;
  modal.classList.remove("ouvert");
  modal.setAttribute("aria-hidden", "true");
  modalImg.src = "";
}

// ---- Écouteurs d'événements uniques ----

// Gestion unique des clics (pastilles, modale, boutons d'action)
document.addEventListener("click", (e) => {
  // 1. Clic sur une pastille pour zoomer l'image
  const pastille = e.target.closest("[data-zoom]");
  if (pastille) {
    ouvrirModal(pastille.dataset.zoom);
    return;
  }

  // 2. Fermeture de la modale
  if (
    e.target.id === "modal-image" ||
    e.target.classList.contains("modal-fermer")
  ) {
    fermerModal();
    return;
  }

  // 3. Gestion des boutons (Ajouter, quantite +, quantite -, catégories, commander, vider)
  const bouton = e.target.closest("button");
  if (!bouton) return;

  if (bouton.dataset.ajouter) ajouter(bouton.dataset.ajouter);
  if (bouton.dataset.plus) changer(bouton.dataset.plus, 1);
  if (bouton.dataset.moins) changer(bouton.dataset.moins, -1);
  if (bouton.dataset.categorie) {
    categorieActive = bouton.dataset.categorie;
    afficherFiltres();
    afficherProduits();
  }
  if (bouton.id === "commander") commander();
  if (bouton.id === "vider") sauvegarder([]);
});

// Fermer la modale avec la touche Échap (Escape)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fermerModal();
});

// Écouteur pour la barre de recherche en temps réel
document.addEventListener("input", (e) => {
  if (e.target.id === "recherche-epice") {
    termeRecherche = e.target.value;
    afficherProduits();
  }
});

// ---- Démarrage ----
afficherFiltres();
afficherProduits();
afficherPanier();
