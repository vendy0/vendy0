import PRODUITS from "../../produits/PRODUITS.json" with { type: "json" };

const CLE = "nisca-panier";
const NUMERO_WHATSAPP = "594694913097";

export const trouver = (id) => PRODUITS.find((p) => p.id === id);
export const formater = (n) =>
  (n / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

export function lirePanier() {
  try {
    const donnees = JSON.parse(localStorage.getItem(CLE)) || [];
    return donnees.filter((ligne) => trouver(ligne.id));
  } catch {
    return [];
  }
}

export function sauvegarder(panier, callback) {
  localStorage.setItem(CLE, JSON.stringify(panier));
  if (callback) callback();
}

export function totalPanier(panier) {
  return panier.reduce(
    (somme, l) => somme + trouver(l.id).prix * l.quantite,
    0,
  );
}

export function commander() {
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
