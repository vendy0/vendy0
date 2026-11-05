import PRODUITS from "../../produits/PRODUITS.json" with { type: "json" };
import CATEGORIES from "../../produits/CATEGORIES.json" with { type: "json" };
import NIVEAUX from "../../produits/NIVEAUX.json" with { type: "json" };
import { lirePanier, trouver, formater, totalPanier } from "./panier.js";

let categorieActive = "tout";
let termeRecherche = "";

const modal = document.getElementById("modal-image");
const modalImg = document.getElementById("modal-img-contenu");

export function afficherFiltres() {
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

export function afficherProduits() {
  const zone = document.getElementById("produits");
  if (!zone) return;

  const visibles = PRODUITS.filter((p) => {
    const correspondCategorie =
      categorieActive === "tout" || p.categorie === categorieActive;

    const normaliser = (texte) =>
      texte
        ? texte
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
        : "";

    const texte = normaliser(termeRecherche);
    const correspondTexte =
      !texte ||
      normaliser(p.nom).includes(texte) ||
      normaliser(p.desc).includes(texte);

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

export function afficherPanier() {
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

  const totalEl = document.getElementById("total");
  const commanderBtn = document.getElementById("commander");
  if (totalEl) totalEl.textContent = formater(totalPanier(panier));
  if (commanderBtn) commanderBtn.disabled = panier.length === 0;
}

export function setCategorieActive(cat) {
  categorieActive = cat;
}

export function setTermeRecherche(terme) {
  termeRecherche = terme;
}

export function ouvrirModal(url) {
  if (!modal || !modalImg) return;
  modalImg.src = url;
  modal.classList.add("ouvert");
  modal.setAttribute("aria-hidden", "false");
}

export function fermerModal() {
  if (!modal) return;
  modal.classList.remove("ouvert");
  modal.setAttribute("aria-hidden", "true");
  modalImg.src = "";
}
