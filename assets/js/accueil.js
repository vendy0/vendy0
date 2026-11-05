import PRODUITS from "./produits/PRODUITS.json" with { type: "json" };
import CATEGORIES from "./produits/CATEGORIES.json" with { type: "json" };

// 1. Les familles sont construites à partir des données (rien à recopier à la main)
const liste = document.getElementById("familles");
liste.innerHTML = Object.entries(CATEGORIES)
  .map(([cle, nom], i) => {
    const nombre = PRODUITS.filter((p) => p.categorie === cle).length;
    return `<li class="revele"><a href="boutique.html#${cle}">
      <span class="num">0${i + 1}</span>
      <span class="nom">${nom}</span>
      <span class="nb">${nombre} produits</span>
    </a></li>`;
  })
  .join("");

// 2. Les éléments .revele apparaissent quand ils entrent dans l'écran
const observateur = new IntersectionObserver(
  (entrees) => {
    entrees.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observateur.unobserve(e.target); // une seule fois
      }
    });
  },
  { threshold: 0.15 },
);
document.querySelectorAll(".revele").forEach((el) => observateur.observe(el));
