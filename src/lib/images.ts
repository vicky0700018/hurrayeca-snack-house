import heroAsset from "@/assets/hero.webp.asset.json";
const hero = heroAsset.url;
import catTraditionalAsset from "@/assets/cat-traditional.webp.asset.json";
const catTraditional = catTraditionalAsset.url;
import catBhujiaAsset from "@/assets/cat-bhujia.webp.asset.json";
const catBhujia = catBhujiaAsset.url;
import catMixtureAsset from "@/assets/cat-mixture.webp.asset.json";
const catMixture = catMixtureAsset.url;
import catChivdaAsset from "@/assets/cat-chivda.webp.asset.json";
const catChivda = catChivdaAsset.url;
import catPeanutsAsset from "@/assets/cat-peanuts.webp.asset.json";
const catPeanuts = catPeanutsAsset.url;
import catChipsAsset from "@/assets/cat-chips.webp.asset.json";
const catChips = catChipsAsset.url;
import catSpecialAsset from "@/assets/cat-special.webp.asset.json";
const catSpecial = catSpecialAsset.url;
import catComboAsset from "@/assets/cat-combo.webp.asset.json";
const catCombo = catComboAsset.url;
import promoHappinessAsset from "@/assets/promo-happiness.webp.asset.json";
const promoHappiness = promoHappinessAsset.url;
import promoFestiveAsset from "@/assets/promo-festive.webp.asset.json";
const promoFestive = promoFestiveAsset.url;
import aboutSpicesAsset from "@/assets/about-spices.webp.asset.json";
const aboutSpices = aboutSpicesAsset.url;
import aboutStoreAsset from "@/assets/about-store.webp.asset.json";
const aboutStore = aboutStoreAsset.url;
import aboutPackingAsset from "@/assets/about-packing.webp.asset.json";
const aboutPacking = aboutPackingAsset.url;
import pAlooBhujiaAsset from "@/assets/p-aloo-bhujia.webp.asset.json";
const pAlooBhujia = pAlooBhujiaAsset.url;
import pRatlamiSevAsset from "@/assets/p-ratlami-sev.webp.asset.json";
const pRatlamiSev = pRatlamiSevAsset.url;
import pGarlicSevAsset from "@/assets/p-garlic-sev.webp.asset.json";
const pGarlicSev = pGarlicSevAsset.url;
import pPunjabiMixtureAsset from "@/assets/p-punjabi-mixture.webp.asset.json";
const pPunjabiMixture = pPunjabiMixtureAsset.url;
import pKhattaMeethaAsset from "@/assets/p-khatta-meetha.webp.asset.json";
const pKhattaMeetha = pKhattaMeethaAsset.url;
import pCornflakesMixtureAsset from "@/assets/p-cornflakes-mixture.webp.asset.json";
const pCornflakesMixture = pCornflakesMixtureAsset.url;
import pGujaratiChivdaAsset from "@/assets/p-gujarati-chivda.webp.asset.json";
const pGujaratiChivda = pGujaratiChivdaAsset.url;
import pPohaChivdaAsset from "@/assets/p-poha-chivda.webp.asset.json";
const pPohaChivda = pPohaChivdaAsset.url;
import pMasalaPeanutsAsset from "@/assets/p-masala-peanuts.webp.asset.json";
const pMasalaPeanuts = pMasalaPeanutsAsset.url;
import pChanaDalAsset from "@/assets/p-chana-dal.webp.asset.json";
const pChanaDal = pChanaDalAsset.url;
import pMoongDalAsset from "@/assets/p-moong-dal.webp.asset.json";
const pMoongDal = pMoongDalAsset.url;
import pGathiyaAsset from "@/assets/p-gathiya.webp.asset.json";
const pGathiya = pGathiyaAsset.url;
import pBananaChipsAsset from "@/assets/p-banana-chips.webp.asset.json";
const pBananaChips = pBananaChipsAsset.url;
import pPotatoWafersAsset from "@/assets/p-potato-wafers.webp.asset.json";
const pPotatoWafers = pPotatoWafersAsset.url;
import pBhakarwadiAsset from "@/assets/p-bhakarwadi.webp.asset.json";
const pBhakarwadi = pBhakarwadiAsset.url;
import pComboAsset from "@/assets/p-combo.webp.asset.json";
const pCombo = pComboAsset.url;

/**
 * Built-in images are stored in data as stable keys ("img:<name>") so that saved
 * localStorage data keeps working across rebuilds. Uploaded images are data URLs.
 */
export const IMAGE_LIBRARY: Record<string, { src: string; label: string }> = {
  "img:hero": { src: hero, label: "Hero – namkeen bowls" },
  "img:cat-traditional": { src: catTraditional, label: "Traditional namkeen" },
  "img:cat-bhujia": { src: catBhujia, label: "Bhujia & sev" },
  "img:cat-mixture": { src: catMixture, label: "Mixture" },
  "img:cat-chivda": { src: catChivda, label: "Chivda" },
  "img:cat-peanuts": { src: catPeanuts, label: "Masala peanuts" },
  "img:cat-chips": { src: catChips, label: "Chips & wafers" },
  "img:cat-special": { src: catSpecial, label: "Special snacks" },
  "img:cat-combo": { src: catCombo, label: "Combo gift box" },
  "img:promo-happiness": { src: promoHappiness, label: "Family snack time" },
  "img:promo-festive": { src: promoFestive, label: "Festive jars" },
  "img:about-spices": { src: aboutSpices, label: "Spices" },
  "img:about-store": { src: aboutStore, label: "Snack shelf" },
  "img:about-packing": { src: aboutPacking, label: "Packing" },
  "img:p-aloo-bhujia": { src: pAlooBhujia, label: "Aloo bhujia" },
  "img:p-ratlami-sev": { src: pRatlamiSev, label: "Ratlami sev" },
  "img:p-garlic-sev": { src: pGarlicSev, label: "Garlic sev" },
  "img:p-punjabi-mixture": { src: pPunjabiMixture, label: "Punjabi mixture" },
  "img:p-khatta-meetha": { src: pKhattaMeetha, label: "Khatta meetha" },
  "img:p-cornflakes-mixture": { src: pCornflakesMixture, label: "Cornflakes mixture" },
  "img:p-gujarati-chivda": { src: pGujaratiChivda, label: "Gujarati chivda" },
  "img:p-poha-chivda": { src: pPohaChivda, label: "Poha chivda" },
  "img:p-masala-peanuts": { src: pMasalaPeanuts, label: "Masala peanuts" },
  "img:p-chana-dal": { src: pChanaDal, label: "Chana dal" },
  "img:p-moong-dal": { src: pMoongDal, label: "Moong dal" },
  "img:p-gathiya": { src: pGathiya, label: "Gathiya farsan" },
  "img:p-banana-chips": { src: pBananaChips, label: "Banana chips" },
  "img:p-potato-wafers": { src: pPotatoWafers, label: "Potato wafers" },
  "img:p-bhakarwadi": { src: pBhakarwadi, label: "Bhakarwadi" },
  "img:p-combo": { src: pCombo, label: "Snack combo" },
};

export function resolveImage(src: string | undefined | null): string {
  if (!src) return "";
  if (src.startsWith("img:")) return IMAGE_LIBRARY[src]?.src ?? "";
  return src;
}

/** Downscale an uploaded file to a compact JPEG data URL for localStorage. */
export function fileToDataUrl(file: File, maxSize = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load image"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
