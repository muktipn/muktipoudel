/* ===== १. साइटको सेटिङ — यहाँ आफ्नो विवरण राख्नुहोस् ===== */
const SITE = {
  brand: "मनको प्रतिविम्ब",          // माथि बायाँ देखिने ब्लगको नाम
  name: "मुक्ति नेपाली",            // हिरोमा देखिने ठूलो नाम
  hello: "स्वागतम्,",          // नामको माथिको सानो बबल
  role: 'कवि, <span class="red">निबन्धकार</span> र<br>कथा<span class="blue">लेखक</span>',
  button: "लेख पढ्नुहोस्",
  photo: "mukti.jpg",             // आफ्नो फोटो (पारदर्शी PNG राम्रो) — यही नामले राख्नुहोस्
  email: "muktipn@gmail.com",
  about: [
    "नमस्कार! मुक्ति नेपालीको अक्षरपथमा यहाँहरूलाई स्वागत छ। ",
    ""
  ],
  social: [ // चाहिँदैन भने यो सूची खाली [] राख्नुहोस्
    { label: "Facebook", url: "https://facebook.com/muktipn" },
    { label: "youtube", url: "https://www.youtube.com/@muktinepali6863" }
  ]
};

/* लेखहरू अब posts.json मा सेभ हुन्छन् — admin.html बाट थप्नुहोस्। */
