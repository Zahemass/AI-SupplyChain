// testTranslation.js
import { translateToEnglish } from "./services/translatorService.js";

const tamil = "சென்னை துறைமுகத்தில் புயல் காரணமாக கப்பல்கள் தாமதமாகி உள்ளன.";
const spanish = "Huelga en el puerto de Barcelona afecta envíos internacionales.";

const run = async () => {
  console.log(await translateToEnglish(tamil));
  console.log(await translateToEnglish(spanish));
};

run();
