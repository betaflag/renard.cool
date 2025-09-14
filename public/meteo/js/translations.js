const translations = {
  en: {
    // Page titles and headers
    pageTitle: "Renard Met Quoi? - What Should Fox Wear?",
    mainTitle: "What Should Fox Wear?",
    subtitle:
      "Let's check the weather and pick the perfect outfit for your school day!",

    // Weather card
    yourLocation: "Your Location",
    currentTemperature: "Current Temperature",
    todayRange: "Today",

    // Main sections
    whatToWear: "What to Wear Today",
    smartTips: "Smart Tips for Today",
    todayAdvice: "Today's Advice",

    // Clothing categories
    upperBody: "Upper Body",
    lowerBody: "Lower Body",
    footwear: "Footwear",
    accessories: "Accessories",
    recommended: "Recommended",

    // Buttons and actions
    refreshWeather: "Refresh Weather",
    loading: "Getting today's weather...",

    // Last refresh time
    lastRefreshed: "Updated",
    justNow: "just now",
    oneMinuteAgo: "1 minute ago",
    minutesAgo: "{n} minutes ago",
    oneHourAgo: "1 hour ago",
    hoursAgo: "{n} hours ago",

    // Error messages
    errorTitle: "Oops! Something went wrong",
    errorMessage: "Unable to load weather data. Please try again.",
    errorHint: "Try refreshing the page or check your internet connection.",

    // Weather alerts
    rainAlert: "🌧️ Rain expected - consider waterproof options!",
    snowAlert: "❄️ Snow expected - wear waterproof boots!",

    // Rain gear
    rainGear: {
      raincoat: "Raincoat",
      rainBoots: "Rain boots",
      umbrella: "Umbrella",
    },

    // Temperature-specific advice
    advice: {
      hot30plus: "Very hot day - seek shade and stay hydrated",
      warm25to30: "It's warm! Stay cool and hydrated",
      warm20to25: "Perfect weather - T-shirt will keep you comfortable",
      mild15to20: "Start with a hoodie you can remove later",
      mild10to15: "Chilly start but you'll warm up - long sleeves are perfect",
      cool0to10: "Cool weather - bring a warm layer for recess",
      snowCold: "Snow and cold - dress warmly and watch for ice",
      snowMild: "Snow expected - waterproof layers will keep you dry",
      extremeCold: "Extremely cold - limit time outside and layer up",
      cold: "Cold weather - keep your winter gear on until you're inside",
    },

    // Temperature swing alerts
    temperatureSwingAlert: {
      medium: "Temperature varies today: {min}° → {max}°",
      large: "Big temperature change: {min}° → {max}°",
    },

    // Layering tips
    layeringTips: {
      medium: "Wear layers you can remove as it warms up",
      large: "Start warm for morning, pack lighter clothes for afternoon",
    },

    // Temperature swing
    temperatureSwingTooltip: "Large temperature change expected today",

    // Clothing items - Hot weather (30°C+)
    hot: {
      upperBody: ["Light t-shirt", "Cotton shirt", "Tank top"],
      lowerBody: ["Shorts (check dress code)", "Light cotton pants"],
      footwear: ["Breathable sneakers", "Mesh running shoes", "Light socks"],
      accessories: ["Sun hat for recess", "Water bottle", "Sunscreen"],
      tips: [
        "Find shade during recess!",
        "Drink water throughout the day",
        "Ask to refill your water bottle",
      ],
    },

    // Clothing items - Warm weather (20-29°C)
    warm: {
      upperBody: ["T-shirt", "Light long sleeve", "Cotton shirt"],
      lowerBody: ["Shorts", "Light pants", "Cotton pants"],
      footwear: ["Sneakers", "Running shoes"],
      accessories: [
        "Sun hat for recess",
        "Light sweater for AC classroom",
        "Water bottle",
      ],
      tips: [
        "Perfect weather for playing at recess!",
        "Classroom might be cooler with AC",
        "Don't forget your water bottle",
      ],
    },

    // Clothing items - Mild weather (10-19°C)
    mild: {
      upperBody: [
        "Long sleeve shirt",
        "Light sweater",
        "Hoodie (store in backpack later)",
      ],
      lowerBody: ["Long pants", "Jeans", "Comfortable pants"],
      footwear: ["Sneakers", "Running shoes"],
      accessories: ["Light jacket", "Extra layer in backpack"],
      tips: [
        "Layer up - you can store extras in your backpack",
        "Morning might be cool, afternoon warmer",
        "Great weather for outdoor learning!",
      ],
    },

    // Clothing items - Cool weather (0-9°C)
    cool: {
      upperBody: ["Warm sweater", "Hoodie", "Fleece jacket"],
      lowerBody: ["Long pants", "Warm jeans", "Track pants"],
      footwear: ["Sneakers with warm socks", "Closed shoes", "Boots"],
      accessories: ["Winter hat", "Light gloves for recess", "Scarf"],
      tips: [
        "Keep layers on until you warm up",
        "Hands get cold at recess - bring gloves!",
        "Indoor shoes might be needed at school",
      ],
    },

    // Clothing items - Cold weather (-10 to -1°C)
    cold: {
      upperBody: ["Warm base layer", "Thick sweater", "Winter coat"],
      lowerBody: [
        "Warm underwear under pants",
        "Thick pants",
        "Snow pants for recess",
      ],
      footwear: ["Winter boots", "Warm socks", "Indoor shoes for class"],
      accessories: [
        "Winter hat",
        "Warm gloves",
        "Scarf",
        "Extra mittens in backpack",
      ],
      tips: [
        "Bundle up for the walk to school!",
        "Keep extra gloves in your backpack",
        "Unzip indoors so you don't overheat",
      ],
    },

    // Clothing items - Very cold weather (-20 to -11°C)
    veryCold: {
      upperBody: ["Thermal underwear", "Fleece", "Heavy winter coat"],
      lowerBody: ["Thermal bottoms", "Insulated pants", "Snow pants"],
      footwear: ["Insulated winter boots", "Wool socks", "Boot warmers"],
      accessories: [
        "Insulated hat",
        "Heavy mittens",
        "Face mask",
        "Neck warmer",
      ],
      tips: [
        "Layer up - you can always remove layers",
        "Protect your face from wind",
        "Tell a teacher if you feel too cold",
      ],
    },

    // Clothing items - Extreme cold (below -20°C)
    extremeCold: {
      upperBody: ["Multiple thermal layers", "Heavy fleece", "Arctic coat"],
      lowerBody: ["Multiple thermal layers", "Insulated snow pants"],
      footwear: ["Extreme cold boots", "Multiple sock layers", "Foot warmers"],
      accessories: ["Full face protection", "Arctic mittens", "Goggles"],
      tips: [
        "Limit time outside",
        "Tell an adult immediately if you're cold",
        "Stay close to school entrances",
      ],
    },
  },

  fr: {
    // Page titles and headers
    pageTitle: "Renard Met Quoi? - Qu'est-ce que Renard devrait porter?",
    mainTitle: "Qu'est-ce que Renard met?",
    subtitle:
      "Vérifions la météo et choisissons la tenue parfaite pour ta journée d'école!",

    // Weather card
    yourLocation: "Ta position",
    currentTemperature: "Température actuelle",
    todayRange: "Aujourd'hui",

    // Main sections
    whatToWear: "Quoi porter aujourd'hui",
    smartTips: "Conseils futés",
    todayAdvice: "Conseil du jour",

    // Clothing categories
    upperBody: "Haut du corps",
    lowerBody: "Bas du corps",
    footwear: "Chaussures",
    accessories: "Accessoires",
    recommended: "Recommandé",

    // Buttons and actions
    refreshWeather: "Actualiser la météo",
    loading: "Vérification de la météo d'aujourd'hui...",

    // Last refresh time
    lastRefreshed: "Mis à jour",
    justNow: "à l'instant",
    oneMinuteAgo: "il y a 1 minute",
    minutesAgo: "il y a {n} minutes",
    oneHourAgo: "il y a 1 heure",
    hoursAgo: "il y a {n} heures",

    // Error messages
    errorTitle: "Oups! Quelque chose ne va pas",
    errorMessage:
      "Impossible de charger les données météo. Veuillez réessayer.",
    errorHint:
      "Essayez de rafraîchir la page ou vérifiez votre connexion internet.",

    // Weather alerts
    rainAlert: "🌧️ Pluie prévue - pense aux vêtements imperméables!",
    snowAlert: "❄️ Neige prévue - porte des bottes imperméables!",

    // Rain gear
    rainGear: {
      raincoat: "Imperméable",
      rainBoots: "Bottes de pluie",
      umbrella: "Parapluie",
    },

    // Temperature-specific advice
    advice: {
      hot30plus: "Journée très chaude - cherche l'ombre et reste hydraté",
      warm25to30: "Il fait chaud! Reste au frais et hydraté",
      warm20to25: "Météo parfaite - un t-shirt te gardera confortable",
      mild15to20: "Commence avec un coton ouaté que tu peux enlever",
      mild10to15:
        "Début frais mais tu te réchaufferas - manches longues parfaites",
      cool0to10: "Temps frais - apporte une couche chaude pour la récré",
      snowCold:
        "Neige et froid - habille-toi chaudement et attention à la glace",
      snowMild: "Neige prévue - des couches imperméables te garderont au sec",
      extremeCold:
        "Extrêmement froid - limite le temps dehors et mets plusieurs couches",
      cold: "Temps froid - garde tes vêtements d'hiver jusqu'à l'intérieur",
    },

    // Temperature swing alerts
    temperatureSwingAlert: {
      medium: "La température varie aujourd'hui: {min}° → {max}°",
      large: "Grand changement de température: {min}° → {max}°",
    },

    // Layering tips
    layeringTips: {
      medium: "Porte des couches que tu peux enlever quand il fait plus chaud",
      large: "Commence chaud le matin, mets des vêtements légers dans ton sac",
    },

    // Temperature swing
    temperatureSwingTooltip:
      "Grand changement de température prévu aujourd'hui",

    // Clothing items - Hot weather (30°C+)
    hot: {
      upperBody: ["T-shirt léger", "Chemise en coton"],
      lowerBody: [
        "Shorts (vérifie le code vestimentaire)",
        "Pantalon léger en coton",
      ],
      footwear: [
        "Espadrilles respirantes",
        "Souliers de course en maille",
        "Bas légers",
      ],
      accessories: [
        "Chapeau de soleil pour la récré",
        "Bouteille d'eau",
        "Crème solaire",
      ],
      tips: [
        "Trouve de l'ombre pendant la récré!",
        "Bois de l'eau toute la journée",
        "Demande de remplir ta bouteille d'eau",
      ],
    },

    // Clothing items - Warm weather (20-29°C)
    warm: {
      upperBody: ["T-shirt", "Chandail à manches longues léger"],
      lowerBody: ["Shorts", "Pantalon léger", "Pantalon de coton"],
      footwear: ["Espadrilles", "Souliers de course"],
      accessories: [
        "Chapeau pour la récré",
        "Chandail léger pour la classe climatisée",
        "Bouteille d'eau",
      ],
      tips: [
        "Météo parfaite pour jouer à la récré!",
        "La classe pourrait être plus froide avec la climatisation",
        "N'oublie pas ta bouteille d'eau",
      ],
    },

    // Clothing items - Mild weather (10-19°C)
    mild: {
      upperBody: [
        "Chandail à manches longues",
        "Chandail léger",
        "Coton ouaté",
      ],
      lowerBody: ["Pantalon long", "Jeans", "Pantalon confortable"],
      footwear: ["Espadrilles", "Souliers de course"],
      accessories: ["Veste légère", "Couche supplémentaire dans le sac à dos"],
      tips: [
        "Habille-toi en couches - tu peux ranger les extras dans ton sac",
        "Le matin peut être frais, l'après-midi plus chaud",
        "Météo parfaite pour apprendre dehors!",
      ],
    },

    // Clothing items - Cool weather (0-9°C)
    cool: {
      upperBody: ["Chandail chaud", "Coton ouaté", "Veste en polar"],
      lowerBody: ["Pantalon long", "Jeans chauds", "Pantalon de jogging"],
      footwear: ["Espadrilles avec bas chauds", "Souliers fermés", "Bottes"],
      accessories: ["Tuque", "Gants légers pour la récré", "Foulard"],
      tips: [
        "Garde tes couches jusqu'à ce que tu te réchauffes",
        "Les mains deviennent froides à la récré - apporte des gants!",
        "Tu pourrais avoir besoin de souliers d'intérieur à l'école",
      ],
    },

    // Clothing items - Cold weather (-10 to -1°C)
    cold: {
      upperBody: ["Couche de base chaude", "Chandail épais", "Manteau d'hiver"],
      lowerBody: [
        "Sous-vêtements chauds sous le pantalon",
        "Pantalon épais",
        "Pantalon de neige pour la récré",
      ],
      footwear: [
        "Bottes d'hiver",
        "Bas chauds",
        "Souliers d'intérieur pour la classe",
      ],
      accessories: [
        "Tuque d'hiver",
        "Gants chauds",
        "Foulard",
        "Mitaines supplémentaires dans le sac",
      ],
      tips: [
        "Habille-toi chaudement pour marcher à l'école!",
        "Garde des gants supplémentaires dans ton sac",
        "Ouvre ton manteau à l'intérieur pour ne pas avoir trop chaud",
      ],
    },

    // Clothing items - Very cold weather (-20 to -11°C)
    veryCold: {
      upperBody: [
        "Sous-vêtements thermiques",
        "Polar",
        "Manteau d'hiver épais",
      ],
      lowerBody: ["Caleçons thermiques", "Pantalon isolé", "Pantalon de neige"],
      footwear: ["Bottes d'hiver isolées", "Bas de laine", "Chauffe-bottes"],
      accessories: [
        "Tuque isolée",
        "Mitaines épaisses",
        "Cache-visage",
        "Cache-cou",
      ],
      tips: [
        "Habille-toi en couches - tu peux toujours en enlever",
        "Protège ton visage du vent",
        "Dis-le à ton professeur si tu as trop froid",
      ],
    },

    // Clothing items - Extreme cold (below -20°C)
    extremeCold: {
      upperBody: [
        "Plusieurs couches thermiques",
        "Polar épais",
        "Manteau arctique",
      ],
      lowerBody: ["Plusieurs couches thermiques", "Pantalon de neige isolé"],
      footwear: [
        "Bottes grand froid",
        "Plusieurs couches de bas",
        "Chauffe-pieds",
      ],
      accessories: [
        "Protection complète du visage",
        "Mitaines arctiques",
        "Lunettes de ski",
      ],
      tips: [
        "Limite le temps passé dehors",
        "Dis-le immédiatement à un adulte si tu as froid",
        "Reste près des entrées de l'école",
      ],
    },
  },
};

// Export for use in app.js
window.translations = translations;
