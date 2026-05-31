/**
 * Application JavaScript pour la présentation d'Espérance
 * Gère le chargement dynamique du JSON, la génération du QR Code et la Lightbox.
 * Compatible avec : index.html, affiche_coins.html et details.html.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Déterminer sur quelle page nous nous trouvons
  const isFlyerStandard = document.querySelector(".flyer-container") !== null;
  const isFlyerCorners = document.querySelector(".flyer-corners") !== null;
  const isDetailsPage = document.getElementById("gallery-box") !== null;

  // Données de secours (fallback) en cas de blocage CORS sur protocole file://
  const fallbackData = {
    "name": "Espérance",
    "subtitle": "Un cœur à soigner, une vie douce à lui offrir",
    "heading": "🐾 ESPÉRANCE CHERCHE SON HAVRE DE PAIX 🐾",
    "age": "environ 4 ans",
    "birthDate": "Juin 2022",
    "currentLocation": "Orléans",
    "contactPhone": "06 81 98 88 37",
    "photos": {
      "primary": "photo/1.png",
      "others": [
        "photo/a.png",
        "photo/2.png",
        "photo/3.jpg",
        "photo/b.png"
      ]
    }
  };

  // 1. Initialisation de la page
  initPage();

  async function initPage() {
    let data = fallbackData;

    // Tenter de charger le JSON localement
    try {
      const response = await fetch("data/esperance.json");
      if (response.ok) {
        data = await response.json();
      }
    } catch (e) {
      console.warn("Échec du fetch JSON (CORS sur protocole file:// probable). Utilisation des données embarquées.");
    }

    // Appliquer les données selon la page active
    if (isFlyerStandard) {
      setupStandardFlyer(data);
    } else if (isFlyerCorners) {
      setupCornersFlyer(data);
    } else if (isDetailsPage) {
      setupDetailsPage(data);
    }
  }

  // 2. Logique pour le flyer standard (index.html)
  function setupStandardFlyer(data) {
    if (document.getElementById("flyer-heading")) document.getElementById("flyer-heading").textContent = data.heading;
    if (document.getElementById("flyer-subtitle")) document.getElementById("flyer-subtitle").textContent = data.subtitle;

    // photo/1.png en image principale
    if (document.getElementById("primary-img")) document.getElementById("primary-img").src = data.photos.primary;

    // photo/a.png en image secondaire
    const imgA = data.photos.others.find(p => p.includes("a.png")) || data.photos.others[0];
    if (document.getElementById("secondary-img")) document.getElementById("secondary-img").src = imgA;

    if (document.getElementById("contact-number")) document.getElementById("contact-number").textContent = data.contactPhone;

    generateQRCode();
  }

  // 3. Logique pour le flyer avec disposition "Coins et Centre" (affiche_coins.html)
  function setupCornersFlyer(data) {
    if (document.getElementById("flyer-heading")) document.getElementById("flyer-heading").textContent = data.heading;
    if (document.getElementById("flyer-subtitle")) document.getElementById("flyer-subtitle").textContent = data.subtitle;
    if (document.getElementById("contact-number")) document.getElementById("contact-number").textContent = data.contactPhone;

    // Photo 1 au centre (photo/1.png)
    if (document.getElementById("center-img")) document.getElementById("center-img").src = data.photos.primary;

    // Photo 3 en haut à gauche (photo/3.jpg)
    const img3 = data.photos.others.find(p => p.includes("3.jpg")) || data.photos.others[2];
    if (document.getElementById("top-left-img")) document.getElementById("top-left-img").src = img3;

    // Photo a en bas à gauche (photo/a.png)
    const imgA = data.photos.others.find(p => p.includes("a.png")) || data.photos.others[0];
    if (document.getElementById("bottom-left-img")) document.getElementById("bottom-left-img").src = imgA;

    // Photo 2 en bas à droite (photo/2.png)
    const img2 = data.photos.others.find(p => p.includes("2.png")) || data.photos.others[1];
    if (document.getElementById("bottom-right-img")) document.getElementById("bottom-right-img").src = img2;

    generateQRCode();
  }

  // Génération dynamique du QR code
  function generateQRCode() {
    const qrBox = document.getElementById("qrcode-box");
    if (!qrBox) return;

    // Construire l'URL absolue de la page de détails
    let currentUrl = window.location.href;
    let detailsUrl = "";

    if (currentUrl.includes("index.html")) {
      detailsUrl = currentUrl.replace("index.html", "details.html");
    } else if (currentUrl.includes("affiche_coins.html")) {
      detailsUrl = currentUrl.replace("affiche_coins.html", "details.html");
    } else if (currentUrl.endsWith("/")) {
      detailsUrl = currentUrl + "details.html";
    } else {
      // Cas générique
      const lastSlash = currentUrl.lastIndexOf("/");
      detailsUrl = currentUrl.substring(0, lastSlash + 1) + "details.html";
    }

    // Tenter de générer avec qrcode.js (CDN)
    try {
      if (typeof QRCode !== "undefined") {
        qrBox.innerHTML = ""; // Vider le container
        new QRCode(qrBox, {
          text: detailsUrl,
          width: 180,
          height: 180,
          colorDark: "#2d2b2a",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });
        console.log("QR Code généré localement via QRCode.js pour :", detailsUrl);
      } else {
        throw new Error("QRCode.js non chargé");
      }
    } catch (err) {
      // Fallback 1 : Utilisation de l'API en ligne (très fiable avec connexion)
      console.log("QRCode.js non disponible. Utilisation du fallback API en ligne.");
      qrBox.innerHTML = "";
      const qrImg = document.createElement("img");
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=2d2b2a&data=${encodeURIComponent(detailsUrl)}`;
      qrImg.alt = "QR Code Espérance";
      qrImg.style.width = "180px";
      qrImg.style.height = "180px";
      qrBox.appendChild(qrImg);
    }
  }

  // 4. Logique de la page de détails (Fiche de vie)
  function setupDetailsPage(data) {
    // Remplir les informations textuelles basiques
    document.getElementById("info-age").textContent = data.age;
    document.getElementById("info-birth").textContent = data.birthDate;
    document.getElementById("info-location").textContent = data.currentLocation;
    document.getElementById("avatar-img").src = data.photos.primary;

    // Remplir la galerie photos avec TOUTES les images (principale + secondaires)
    const galleryBox = document.getElementById("gallery-box");
    if (galleryBox) {
      galleryBox.innerHTML = ""; // Vider le container d'origine

      // Réunir toutes les photos uniques (sauf b.png qui sert uniquement de watermark)
      const allPhotos = [data.photos.primary, ...data.photos.others.filter(p => !p.includes("b.png"))];

      allPhotos.forEach((photoPath, index) => {
        const item = document.createElement("div");
        item.className = "gallery-item";
        item.setAttribute("data-src", photoPath);

        const img = document.createElement("img");
        img.src = photoPath;
        img.alt = `Espérance - Photo ${index + 1}`;
        img.loading = "lazy";

        item.appendChild(img);
        galleryBox.appendChild(item);

        // Événement pour ouvrir la Lightbox
        item.addEventListener("click", () => {
          openLightbox(photoPath);
        });
      });
    }

    // Configurer la Lightbox
    setupLightbox();
  }

  // Gestionnaire de Lightbox
  function setupLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxClose = document.getElementById("lightbox-close");

    if (!lightbox || !lightboxImg || !lightboxClose) return;

    function openLightbox(src) {
      lightboxImg.src = src;
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden"; // Bloquer le défilement
    }

    // Rendre accessible globalement
    window.openLightbox = openLightbox;

    function closeLightbox() {
      lightbox.classList.remove("active");
      document.body.style.overflow = ""; // Rétablir le défilement
      lightboxImg.src = "";
    }

    lightboxClose.addEventListener("click", closeLightbox);

    // Fermer en cliquant en dehors de l'image
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Fermer avec la touche Échap
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("active")) {
        closeLightbox();
      }
    });
  }
});
