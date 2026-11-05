// ---- Réglages ----
import PRODUITS from "./produits/PRODUITS.json" with { type: "json" };
import CATEGORIES from "./produits/CATEGORIES.json" with { type: "json" };
import NIVEAUX from "./produits/NIVEAUX.json" with { type: "json" };

const NUMERO_WHATSAPP = "594694379134"; // ton numéro, sans + ni espaces
const CLE = "nisca-panier"; // nom de la case dans localStorage

// ---- Outils ----
let categorieActive = "tout"; // la catégorie affichée en ce moment
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
  if (!zone) return; // on n'est pas sur la page boutique
  const visibles =
    categorieActive === "tout"
      ? PRODUITS
      : PRODUITS.filter((p) => p.categorie === categorieActive);

  zone.innerHTML = visibles
    .map(
      (p) => `
    <li class="produit">
      <span class="pastille" style="background:${p.couleur}"></span>
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

// ---- Un seul écouteur de clics pour toute la page (délégation d'événements) ----
document.addEventListener("click", (e) => {
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

// ---- Démarrage ----
afficherFiltres();
afficherProduits();
afficherPanier();
