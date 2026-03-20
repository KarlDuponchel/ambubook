// Données SEO pour les pages villes et régions

export interface City {
  name: string;
  slug: string;
  postalCode: string;
  region: string;
  department: string;
  population?: number;
}

export interface Region {
  name: string;
  slug: string;
  departments: string[];
  mainCities: string[];
}

// Grandes villes françaises avec données SEO
export const cities: City[] = [
  // Île-de-France
  { name: "Paris", slug: "paris", postalCode: "75000", region: "Île-de-France", department: "Paris", population: 2161000 },
  { name: "Boulogne-Billancourt", slug: "boulogne-billancourt", postalCode: "92100", region: "Île-de-France", department: "Hauts-de-Seine" },
  { name: "Saint-Denis", slug: "saint-denis", postalCode: "93200", region: "Île-de-France", department: "Seine-Saint-Denis" },
  { name: "Argenteuil", slug: "argenteuil", postalCode: "95100", region: "Île-de-France", department: "Val-d'Oise" },
  { name: "Montreuil", slug: "montreuil", postalCode: "93100", region: "Île-de-France", department: "Seine-Saint-Denis" },
  { name: "Nanterre", slug: "nanterre", postalCode: "92000", region: "Île-de-France", department: "Hauts-de-Seine" },
  { name: "Créteil", slug: "creteil", postalCode: "94000", region: "Île-de-France", department: "Val-de-Marne" },
  { name: "Versailles", slug: "versailles", postalCode: "78000", region: "Île-de-France", department: "Yvelines" },

  // Provence-Alpes-Côte d'Azur
  { name: "Marseille", slug: "marseille", postalCode: "13000", region: "Provence-Alpes-Côte d'Azur", department: "Bouches-du-Rhône", population: 870731 },
  { name: "Nice", slug: "nice", postalCode: "06000", region: "Provence-Alpes-Côte d'Azur", department: "Alpes-Maritimes", population: 342669 },
  { name: "Toulon", slug: "toulon", postalCode: "83000", region: "Provence-Alpes-Côte d'Azur", department: "Var", population: 171953 },
  { name: "Aix-en-Provence", slug: "aix-en-provence", postalCode: "13100", region: "Provence-Alpes-Côte d'Azur", department: "Bouches-du-Rhône" },
  { name: "Avignon", slug: "avignon", postalCode: "84000", region: "Provence-Alpes-Côte d'Azur", department: "Vaucluse" },
  { name: "Cannes", slug: "cannes", postalCode: "06400", region: "Provence-Alpes-Côte d'Azur", department: "Alpes-Maritimes" },
  { name: "Antibes", slug: "antibes", postalCode: "06600", region: "Provence-Alpes-Côte d'Azur", department: "Alpes-Maritimes" },

  // Auvergne-Rhône-Alpes
  { name: "Lyon", slug: "lyon", postalCode: "69000", region: "Auvergne-Rhône-Alpes", department: "Rhône", population: 522969 },
  { name: "Saint-Étienne", slug: "saint-etienne", postalCode: "42000", region: "Auvergne-Rhône-Alpes", department: "Loire", population: 172565 },
  { name: "Grenoble", slug: "grenoble", postalCode: "38000", region: "Auvergne-Rhône-Alpes", department: "Isère", population: 158454 },
  { name: "Clermont-Ferrand", slug: "clermont-ferrand", postalCode: "63000", region: "Auvergne-Rhône-Alpes", department: "Puy-de-Dôme", population: 143886 },
  { name: "Villeurbanne", slug: "villeurbanne", postalCode: "69100", region: "Auvergne-Rhône-Alpes", department: "Rhône" },
  { name: "Annecy", slug: "annecy", postalCode: "74000", region: "Auvergne-Rhône-Alpes", department: "Haute-Savoie" },
  { name: "Valence", slug: "valence", postalCode: "26000", region: "Auvergne-Rhône-Alpes", department: "Drôme" },
  { name: "Chambéry", slug: "chambery", postalCode: "73000", region: "Auvergne-Rhône-Alpes", department: "Savoie" },

  // Occitanie
  { name: "Toulouse", slug: "toulouse", postalCode: "31000", region: "Occitanie", department: "Haute-Garonne", population: 493465 },
  { name: "Montpellier", slug: "montpellier", postalCode: "34000", region: "Occitanie", department: "Hérault", population: 290053 },
  { name: "Nîmes", slug: "nimes", postalCode: "30000", region: "Occitanie", department: "Gard", population: 151001 },
  { name: "Perpignan", slug: "perpignan", postalCode: "66000", region: "Occitanie", department: "Pyrénées-Orientales" },
  { name: "Béziers", slug: "beziers", postalCode: "34500", region: "Occitanie", department: "Hérault" },
  { name: "Narbonne", slug: "narbonne", postalCode: "11100", region: "Occitanie", department: "Aude" },

  // Nouvelle-Aquitaine
  { name: "Bordeaux", slug: "bordeaux", postalCode: "33000", region: "Nouvelle-Aquitaine", department: "Gironde", population: 260958 },
  { name: "Limoges", slug: "limoges", postalCode: "87000", region: "Nouvelle-Aquitaine", department: "Haute-Vienne" },
  { name: "Poitiers", slug: "poitiers", postalCode: "86000", region: "Nouvelle-Aquitaine", department: "Vienne" },
  { name: "La Rochelle", slug: "la-rochelle", postalCode: "17000", region: "Nouvelle-Aquitaine", department: "Charente-Maritime" },
  { name: "Pau", slug: "pau", postalCode: "64000", region: "Nouvelle-Aquitaine", department: "Pyrénées-Atlantiques" },
  { name: "Bayonne", slug: "bayonne", postalCode: "64100", region: "Nouvelle-Aquitaine", department: "Pyrénées-Atlantiques" },
  { name: "Angoulême", slug: "angouleme", postalCode: "16000", region: "Nouvelle-Aquitaine", department: "Charente" },

  // Hauts-de-France
  { name: "Lille", slug: "lille", postalCode: "59000", region: "Hauts-de-France", department: "Nord", population: 236234 },
  { name: "Amiens", slug: "amiens", postalCode: "80000", region: "Hauts-de-France", department: "Somme" },
  { name: "Roubaix", slug: "roubaix", postalCode: "59100", region: "Hauts-de-France", department: "Nord" },
  { name: "Tourcoing", slug: "tourcoing", postalCode: "59200", region: "Hauts-de-France", department: "Nord" },
  { name: "Dunkerque", slug: "dunkerque", postalCode: "59140", region: "Hauts-de-France", department: "Nord" },
  { name: "Calais", slug: "calais", postalCode: "62100", region: "Hauts-de-France", department: "Pas-de-Calais" },
  { name: "Reims", slug: "reims", postalCode: "51100", region: "Grand Est", department: "Marne", population: 182592 },

  // Grand Est
  { name: "Strasbourg", slug: "strasbourg", postalCode: "67000", region: "Grand Est", department: "Bas-Rhin", population: 287228 },
  { name: "Metz", slug: "metz", postalCode: "57000", region: "Grand Est", department: "Moselle" },
  { name: "Mulhouse", slug: "mulhouse", postalCode: "68100", region: "Grand Est", department: "Haut-Rhin" },
  { name: "Nancy", slug: "nancy", postalCode: "54000", region: "Grand Est", department: "Meurthe-et-Moselle" },
  { name: "Colmar", slug: "colmar", postalCode: "68000", region: "Grand Est", department: "Haut-Rhin" },
  { name: "Troyes", slug: "troyes", postalCode: "10000", region: "Grand Est", department: "Aube" },

  // Bretagne
  { name: "Rennes", slug: "rennes", postalCode: "35000", region: "Bretagne", department: "Ille-et-Vilaine", population: 222485 },
  { name: "Brest", slug: "brest", postalCode: "29200", region: "Bretagne", department: "Finistère" },
  { name: "Quimper", slug: "quimper", postalCode: "29000", region: "Bretagne", department: "Finistère" },
  { name: "Lorient", slug: "lorient", postalCode: "56100", region: "Bretagne", department: "Morbihan" },
  { name: "Vannes", slug: "vannes", postalCode: "56000", region: "Bretagne", department: "Morbihan" },
  { name: "Saint-Brieuc", slug: "saint-brieuc", postalCode: "22000", region: "Bretagne", department: "Côtes-d'Armor" },
  { name: "Saint-Malo", slug: "saint-malo", postalCode: "35400", region: "Bretagne", department: "Ille-et-Vilaine" },

  // Pays de la Loire
  { name: "Nantes", slug: "nantes", postalCode: "44000", region: "Pays de la Loire", department: "Loire-Atlantique", population: 318808 },
  { name: "Angers", slug: "angers", postalCode: "49000", region: "Pays de la Loire", department: "Maine-et-Loire", population: 155786 },
  { name: "Le Mans", slug: "le-mans", postalCode: "72000", region: "Pays de la Loire", department: "Sarthe" },
  { name: "Saint-Nazaire", slug: "saint-nazaire", postalCode: "44600", region: "Pays de la Loire", department: "Loire-Atlantique" },
  { name: "La Roche-sur-Yon", slug: "la-roche-sur-yon", postalCode: "85000", region: "Pays de la Loire", department: "Vendée" },

  // Normandie
  { name: "Le Havre", slug: "le-havre", postalCode: "76600", region: "Normandie", department: "Seine-Maritime", population: 170147 },
  { name: "Rouen", slug: "rouen", postalCode: "76000", region: "Normandie", department: "Seine-Maritime" },
  { name: "Caen", slug: "caen", postalCode: "14000", region: "Normandie", department: "Calvados" },
  { name: "Cherbourg", slug: "cherbourg", postalCode: "50100", region: "Normandie", department: "Manche" },
  { name: "Évreux", slug: "evreux", postalCode: "27000", region: "Normandie", department: "Eure" },
  { name: "Dieppe", slug: "dieppe", postalCode: "76200", region: "Normandie", department: "Seine-Maritime" },

  // Bourgogne-Franche-Comté
  { name: "Dijon", slug: "dijon", postalCode: "21000", region: "Bourgogne-Franche-Comté", department: "Côte-d'Or", population: 158002 },
  { name: "Besançon", slug: "besancon", postalCode: "25000", region: "Bourgogne-Franche-Comté", department: "Doubs" },
  { name: "Belfort", slug: "belfort", postalCode: "90000", region: "Bourgogne-Franche-Comté", department: "Territoire de Belfort" },
  { name: "Auxerre", slug: "auxerre", postalCode: "89000", region: "Bourgogne-Franche-Comté", department: "Yonne" },
  { name: "Chalon-sur-Saône", slug: "chalon-sur-saone", postalCode: "71100", region: "Bourgogne-Franche-Comté", department: "Saône-et-Loire" },

  // Centre-Val de Loire
  { name: "Tours", slug: "tours", postalCode: "37000", region: "Centre-Val de Loire", department: "Indre-et-Loire" },
  { name: "Orléans", slug: "orleans", postalCode: "45000", region: "Centre-Val de Loire", department: "Loiret" },
  { name: "Bourges", slug: "bourges", postalCode: "18000", region: "Centre-Val de Loire", department: "Cher" },
  { name: "Blois", slug: "blois", postalCode: "41000", region: "Centre-Val de Loire", department: "Loir-et-Cher" },
  { name: "Chartres", slug: "chartres", postalCode: "28000", region: "Centre-Val de Loire", department: "Eure-et-Loir" },

  // Corse
  { name: "Ajaccio", slug: "ajaccio", postalCode: "20000", region: "Corse", department: "Corse-du-Sud" },
  { name: "Bastia", slug: "bastia", postalCode: "20200", region: "Corse", department: "Haute-Corse" },
];

// Régions françaises avec données SEO
export const regions: Region[] = [
  {
    name: "Île-de-France",
    slug: "ile-de-france",
    departments: ["Paris", "Seine-et-Marne", "Yvelines", "Essonne", "Hauts-de-Seine", "Seine-Saint-Denis", "Val-de-Marne", "Val-d'Oise"],
    mainCities: ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Argenteuil", "Versailles"],
  },
  {
    name: "Provence-Alpes-Côte d'Azur",
    slug: "provence-alpes-cote-d-azur",
    departments: ["Alpes-de-Haute-Provence", "Hautes-Alpes", "Alpes-Maritimes", "Bouches-du-Rhône", "Var", "Vaucluse"],
    mainCities: ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Avignon"],
  },
  {
    name: "Auvergne-Rhône-Alpes",
    slug: "auvergne-rhone-alpes",
    departments: ["Ain", "Allier", "Ardèche", "Cantal", "Drôme", "Isère", "Loire", "Haute-Loire", "Puy-de-Dôme", "Rhône", "Savoie", "Haute-Savoie"],
    mainCities: ["Lyon", "Saint-Étienne", "Grenoble", "Clermont-Ferrand", "Annecy"],
  },
  {
    name: "Occitanie",
    slug: "occitanie",
    departments: ["Ariège", "Aude", "Aveyron", "Gard", "Haute-Garonne", "Gers", "Hérault", "Lot", "Lozère", "Hautes-Pyrénées", "Pyrénées-Orientales", "Tarn", "Tarn-et-Garonne"],
    mainCities: ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers"],
  },
  {
    name: "Nouvelle-Aquitaine",
    slug: "nouvelle-aquitaine",
    departments: ["Charente", "Charente-Maritime", "Corrèze", "Creuse", "Dordogne", "Gironde", "Landes", "Lot-et-Garonne", "Pyrénées-Atlantiques", "Deux-Sèvres", "Vienne", "Haute-Vienne"],
    mainCities: ["Bordeaux", "Limoges", "Poitiers", "La Rochelle", "Pau"],
  },
  {
    name: "Hauts-de-France",
    slug: "hauts-de-france",
    departments: ["Aisne", "Nord", "Oise", "Pas-de-Calais", "Somme"],
    mainCities: ["Lille", "Amiens", "Roubaix", "Dunkerque", "Calais"],
  },
  {
    name: "Grand Est",
    slug: "grand-est",
    departments: ["Ardennes", "Aube", "Marne", "Haute-Marne", "Meurthe-et-Moselle", "Meuse", "Moselle", "Bas-Rhin", "Haut-Rhin", "Vosges"],
    mainCities: ["Strasbourg", "Reims", "Metz", "Mulhouse", "Nancy"],
  },
  {
    name: "Bretagne",
    slug: "bretagne",
    departments: ["Côtes-d'Armor", "Finistère", "Ille-et-Vilaine", "Morbihan"],
    mainCities: ["Rennes", "Brest", "Quimper", "Lorient", "Vannes"],
  },
  {
    name: "Pays de la Loire",
    slug: "pays-de-la-loire",
    departments: ["Loire-Atlantique", "Maine-et-Loire", "Mayenne", "Sarthe", "Vendée"],
    mainCities: ["Nantes", "Angers", "Le Mans", "Saint-Nazaire", "La Roche-sur-Yon"],
  },
  {
    name: "Normandie",
    slug: "normandie",
    departments: ["Calvados", "Eure", "Manche", "Orne", "Seine-Maritime"],
    mainCities: ["Le Havre", "Rouen", "Caen", "Cherbourg", "Évreux"],
  },
  {
    name: "Bourgogne-Franche-Comté",
    slug: "bourgogne-franche-comte",
    departments: ["Côte-d'Or", "Doubs", "Jura", "Nièvre", "Haute-Saône", "Saône-et-Loire", "Yonne", "Territoire de Belfort"],
    mainCities: ["Dijon", "Besançon", "Belfort", "Auxerre", "Chalon-sur-Saône"],
  },
  {
    name: "Centre-Val de Loire",
    slug: "centre-val-de-loire",
    departments: ["Cher", "Eure-et-Loir", "Indre", "Indre-et-Loire", "Loir-et-Cher", "Loiret"],
    mainCities: ["Tours", "Orléans", "Bourges", "Blois", "Chartres"],
  },
  {
    name: "Corse",
    slug: "corse",
    departments: ["Corse-du-Sud", "Haute-Corse"],
    mainCities: ["Ajaccio", "Bastia"],
  },
];

// Fonctions utilitaires
export function getCityBySlug(slug: string): City | undefined {
  return cities.find((city) => city.slug === slug);
}

export function getRegionBySlug(slug: string): Region | undefined {
  return regions.find((region) => region.slug === slug);
}

export function getCitiesByRegion(regionName: string): City[] {
  return cities.filter((city) => city.region === regionName);
}

export function getAllCitySlugs(): string[] {
  return cities.map((city) => city.slug);
}

export function getAllRegionSlugs(): string[] {
  return regions.map((region) => region.slug);
}

// Top villes pour les liens rapides
export function getTopCities(limit = 20): City[] {
  return cities
    .filter((city) => city.population)
    .sort((a, b) => (b.population || 0) - (a.population || 0))
    .slice(0, limit);
}
