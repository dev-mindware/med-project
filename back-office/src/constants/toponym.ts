export const toponym_classes = [
  {
    label: "Hidrografia",
    value: "hydrography",
    subclasses: [
      { label: "Rio", value: "river" },
      { label: "Lago", value: "lake" },
      { label: "Oceano/Mar", value: "ocean" },
      { label: "Baía", value: "bay" },
      { label: "Cachoeira", value: "waterfall" },
    ],
  },
  {
    label: "Orografia",
    value: "orography",
    subclasses: [
      { label: "Montanha", value: "mountain" },
      { label: "Serra", value: "sierra" },
      { label: "Colina", value: "hill" },
      { label: "Planalto", value: "plateau" },
      { label: "Vale", value: "valley" },
    ],
  },
  {
    label: "Localidades",
    value: "settlements",
    subclasses: [
      { label: "Cidade", value: "city" },
      { label: "Vila", value: "town" },
      { label: "Aldeia", value: "village" },
      { label: "Distrito", value: "district" },
      { label: "Bairro", value: "neighborhood" },
    ],
  },
  {
    label: "Administração",
    value: "administration",
    subclasses: [
      { label: "País", value: "country" },
      { label: "Província/Estado", value: "province" },
      { label: "Município", value: "municipality" },
      { label: "Comuna", value: "commune" },
      { label: "Região", value: "region" },
    ],
  },
  {
    label: "Infraestruturas",
    value: "infrastructure",
    subclasses: [
      { label: "Estrada", value: "road" },
      { label: "Ponte", value: "bridge" },
      { label: "Porto", value: "port" },
      { label: "Aeroporto", value: "airport" },
      { label: "Barragem", value: "dam" },
    ],
  },
  {
    label: "Outros",
    value: "others",
    subclasses: [
      { label: "Parque Nacional", value: "national_park" },
      { label: "Reserva", value: "reserve" },
      { label: "Ilha", value: "island" },
      { label: "Deserto", value: "desert" },
      { label: "Floresta", value: "forest" },
    ],
  },
];

export const ao_provinces = [
  {
    label: "Bengo",
    value: "bengo",
    municipalities: [
      { label: "Ambriz", value: "ambriz" },
      { label: "Bula-Atumba", value: "bula_atumba" },
      { label: "Dande", value: "dande" },
      { label: "Dembos", value: "dembos" },
      { label: "Nambuangongo", value: "nambuangongo" },
      { label: "Pango-Aluquém", value: "pango_aluquem" },
    ],
  },
  {
    label: "Benguela",
    value: "benguela",
    municipalities: [
      { label: "Balombo", value: "balombo" },
      { label: "Baía-Farta", value: "baia_farta" },
      { label: "Benguela", value: "benguela" },
      { label: "Bocoio", value: "bocoio" },
      { label: "Caimbambo", value: "caimbambo" },
      { label: "Catumbela", value: "catumbela" },
      { label: "Chongorói", value: "chongoroi" },
      { label: "Cubal", value: "cubal" },
      { label: "Ganda", value: "ganda" },
      { label: "Lobito", value: "lobito" },
    ],
  },
  {
    label: "Bié",
    value: "bie",
    municipalities: [
      { label: "Andulo", value: "andulo" },
      { label: "Camacupa", value: "camacupa" },
      { label: "Catabola", value: "catabola" },
      { label: "Chinguar", value: "chinguar" },
      { label: "Chitembo", value: "chitembo" },
      { label: "Cuemba", value: "cuemba" },
      { label: "Cunhinga", value: "cunhinga" },
      { label: "Cuito", value: "cuito" },
      { label: "Nharea", value: "nharea" },
    ],
  },
  {
    label: "Cabinda",
    value: "cabinda",
    municipalities: [
      { label: "Belize", value: "belize" },
      { label: "Buco-Zau", value: "buco_zau" },
      { label: "Cabinda", value: "cabinda" },
      { label: "Cacongo", value: "cacongo" },
    ],
  },
  {
    label: "Cuando",
    value: "cuando",
    municipalities: [
      { label: "Mavinga", value: "mavinga" },
      { label: "Cuito-Cuanavale", value: "cuito_cuanavale" },
      { label: "Dirico", value: "dirico" },
      { label: "Rivungo", value: "rivungo" },
      { label: "Xipundo", value: "xipundo" },
      { label: "Dima", value: "dima" },
      { label: "Luiana", value: "luiana" },
      { label: "Mucusso", value: "mucusso" },
      { label: "Luengue", value: "luengue" },
    ],
  },
  {
    label: "Cubango",
    value: "cubango",
    municipalities: [
      { label: "Menongue", value: "menongue" },
      { label: "Cuchi", value: "cuchi" },
      { label: "Calai", value: "calai" },
      { label: "Nancova", value: "nancova" },
      { label: "Cuangar", value: "cuangar" },
      { label: "Savate", value: "savate" },
      { label: "Caiundo", value: "caiundo" },
      { label: "Longa", value: "longa" },
      { label: "Cutato", value: "cutato" },
      { label: "Chinguanja", value: "chinguanja" },
      { label: "Mavengue", value: "mavengue" },
    ],
  },
  {
    label: "Cuando-Cubango (Histórico)",
    value: "cuando_cubango",
    municipalities: [
      { label: "Menongue", value: "menongue" },
      { label: "Mavinga", value: "mavinga" },
      { label: "Cuito-Cuanavale", value: "cuito_cuanavale" },
      { label: "Cuchi", value: "cuchi" },
      { label: "Cuangar", value: "cuangar" },
      { label: "Calai", value: "calai" },
      { label: "Dirico", value: "dirico" },
      { label: "Nancova", value: "nancova" },
      { label: "Rivungo", value: "rivungo" },
    ],
  },
  {
    label: "Cuanza-Norte",
    value: "cuanza_norte",
    municipalities: [
      { label: "Ambaca", value: "ambaca" },
      { label: "Banga", value: "banga" },
      { label: "Bolongongo", value: "bolongongo" },
      { label: "Cambambe", value: "cambambe" },
      { label: "Cazengo", value: "cazengo" },
      { label: "Golungo-Alto", value: "golungo_alto" },
      { label: "Gonguembo", value: "gonguembo" },
      { label: "Lucala", value: "lucala" },
      { label: "Quiculungo", value: "quiculungo" },
      { label: "Samba-Cajú", value: "samba_caju" },
    ],
  },
  {
    label: "Cuanza-Sul",
    value: "cuanza_sul",
    municipalities: [
      { label: "Amboim", value: "amboim" },
      { label: "Cassongue", value: "cassongue" },
      { label: "Cela", value: "cela" },
      { label: "Conda", value: "conda" },
      { label: "Ebo", value: "ebo" },
      { label: "Libolo", value: "libolo" },
      { label: "Mussende", value: "mussende" },
      { label: "Porto-Amboim", value: "porto_amboim" },
      { label: "Quibala", value: "quibala" },
      { label: "Quilenda", value: "quilenda" },
      { label: "Seles", value: "seles" },
      { label: "Sumbe", value: "sumbe" },
    ],
  },
  {
    label: "Cunene",
    value: "cunene",
    municipalities: [
      { label: "Cahama", value: "cahama" },
      { label: "Cuanhama", value: "cuanhama" },
      { label: "Curoca", value: "curoca" },
      { label: "Cuvelai", value: "cuvelai" },
      { label: "Namacunde", value: "namacunde" },
      { label: "Ombadja", value: "ombadja" },
    ],
  },
  {
    label: "Huambo",
    value: "huambo",
    municipalities: [
      { label: "Bailundo", value: "bailundo" },
      { label: "Catchiungo", value: "catchiungo" },
      { label: "Caála", value: "caala" },
      { label: "Ekunha", value: "ekunha" },
      { label: "Huambo", value: "huambo" },
      { label: "Londuimbali", value: "londuimbali" },
      { label: "Longonjo", value: "longonjo" },
      { label: "Mungo", value: "mungo" },
      { label: "Chicala-Choloanga", value: "chicala_choloanga" },
      { label: "Tchicala-Tcholoanga", value: "tchicala_tcholoanga" },
      { label: "Ucuma", value: "ucuma" },
    ],
  },
  {
    label: "Huíla",
    value: "huila",
    municipalities: [
      { label: "Caconda", value: "caconda" },
      { label: "Cacula", value: "cacula" },
      { label: "Caluquembe", value: "caluquembe" },
      { label: "Chiange", value: "chiange" },
      { label: "Chicomba", value: "chicomba" },
      { label: "Chipindo", value: "chipindo" },
      { label: "Cuvango", value: "cuvango" },
      { label: "Humpata", value: "humpata" },
      { label: "Jamba", value: "jamba" },
      { label: "Lubango", value: "lubango" },
      { label: "Matala", value: "matala" },
      { label: "Quilengues", value: "quilengues" },
      { label: "Quipungo", value: "quipungo" },
    ],
  },
  {
    label: "Ícolo-e-Bengo",
    value: "icolo_e_bengo",
    municipalities: [
      { label: "Catete", value: "catete" },
      { label: "Bom Jesus", value: "bom_jesus" },
      { label: "Cabiri", value: "cabiri" },
      { label: "Cabo Ledo", value: "cabo_ledo" },
      { label: "Calumbo", value: "calumbo" },
      { label: "Quiçama", value: "quicama" },
      { label: "Sequele", value: "sequele" },
      { label: "Bela Vista", value: "bela_vista" },
      { label: "Cassoneca", value: "cassoneca" },
    ],
  },
  {
    label: "Luanda",
    value: "luanda",
    municipalities: [
      { label: "Belas", value: "belas" },
      { label: "Cacuaco", value: "cacuaco" },
      { label: "Cazenga", value: "cazenga" },
      { label: "Ícolo-e-Bengo", value: "icolo_bengo" },
      { label: "Luanda", value: "luanda" },
      { label: "Kilamba-Kiaxi", value: "quilamba_quiaxi" },
      { label: "Talatona", value: "talatona" },
      { label: "Viana", value: "viana" },
    ],
  },
  {
    label: "Lunda-Norte",
    value: "lunda_norte",
    municipalities: [
      { label: "Cambulo", value: "cambulo" },
      { label: "Capenda-Camulemba", value: "capenda_camulemba" },
      { label: "Caungula", value: "caungula" },
      { label: "Chitato", value: "chitato" },
      { label: "Cuango", value: "cuango" },
      { label: "Cuilo", value: "cuilo" },
      { label: "Lubalo", value: "lubalo" },
      { label: "Lucapa", value: "lucapa" },
      { label: "Xá-Muteba", value: "xa_muteba" },
    ],
  },
  {
    label: "Lunda-Sul",
    value: "lunda_sul",
    municipalities: [
      { label: "Cacolo", value: "cacolo" },
      { label: "Dala", value: "dala" },
      { label: "Muconda", value: "muconda" },
      { label: "Saurimo", value: "saurimo" },
    ],
  },
  {
    label: "Malanje",
    value: "malanje",
    municipalities: [
      { label: "Cacuso", value: "cacuso" },
      { label: "Calandula", value: "calandula" },
      { label: "Cambundi-Catembo", value: "cambundi_catembo" },
      { label: "Cangandala", value: "cangandala" },
      { label: "Caombo", value: "caombo" },
      { label: "Cuaba-Nzogo", value: "cuaba_nzogo" },
      { label: "Cunda-Dia-Baze", value: "cunda_dia_baze" },
      { label: "Luquembo", value: "luquembo" },
      { label: "Malanje", value: "malanje" },
      { label: "Marimba", value: "marimba" },
      { label: "Massango", value: "massango" },
      { label: "Mucari", value: "mucari" },
      { label: "Quela", value: "quela" },
      { label: "Quirima", value: "quirima" },
    ],
  },
  {
    label: "Moxico",
    value: "moxico",
    municipalities: [
      { label: "Alto-Zambeze", value: "alto_zambeze" },
      { label: "Bundas", value: "bundas" },
      { label: "Camanongue", value: "camanongue" },
      { label: "Léua", value: "leua" },
      { label: "Luau", value: "luau" },
      { label: "Luacano", value: "luacano" },
      { label: "Luchazes", value: "luchazes" },
      { label: "Cameia", value: "cameia" },
      { label: "Moxico (Luena)", value: "luena" },
    ],
  },
  {
    label: "Moxico-Leste",
    value: "moxico_leste",
    municipalities: [
      { label: "Cazombo", value: "cazombo" },
      { label: "Luau", value: "luau" },
      { label: "Luacano", value: "luacano" },
      { label: "Cameia", value: "cameia" },
      { label: "Nana Candundo", value: "nana_candundo" },
      { label: "Macondo", value: "macondo" },
      { label: "Caianda", value: "caianda" },
      { label: "Lóvua do Zambeze", value: "lovua_do_zambeze" },
      { label: "Lago Dilolo", value: "lago_dilolo" },
      { label: "Alto-Zambeze", value: "alto_zambeze" },
    ],
  },
  {
    label: "Namibe",
    value: "namibe",
    municipalities: [
      { label: "Bibala", value: "bibala" },
      { label: "Camacuio", value: "camacuio" },
      { label: "Moçâmedes", value: "mocamedes" },
      { label: "Tômbua", value: "tombua" },
      { label: "Virei", value: "virei" },
    ],
  },
  {
    label: "Uíge",
    value: "uige",
    municipalities: [
      { label: "Alto-Cauale", value: "alto_cauale" },
      { label: "Ambuíla", value: "ambuíla" },
      { label: "Bembe", value: "bembe" },
      { label: "Buengas", value: "buengas" },
      { label: "Bungo", value: "bungo" },
      { label: "Damba", value: "damba" },
      { label: "Maquela-do-Zombo", value: "maquela_do_zombo" },
      { label: "Milunga", value: "milunga" },
      { label: "Mucaba", value: "mucaba" },
      { label: "Negage", value: "negage" },
      { label: "Puri", value: "puri" },
      { label: "Quimbele", value: "quimbele" },
      { label: "Quitexe", value: "quitexe" },
      { label: "Sanza-Pombo", value: "sanza_pombo" },
      { label: "Songo", value: "songo" },
      { label: "Uíge", value: "uige" },
      { label: "Zombo", value: "zombo" },
    ],
  },
  {
    label: "Zaire",
    value: "zaire",
    municipalities: [
      { label: "Cuimba", value: "cuimba" },
      { label: "M'Banza Kongo", value: "mbanza_kongo" },
      { label: "Noqui", value: "noqui" },
      { label: "N'Zeto", value: "nzeto" },
      { label: "Soyo", value: "soyo" },
      { label: "Tomboco", value: "tomboco" },
    ],
  },
];

/**
 * Encontra a província correspondente a partir de um valor, etiqueta ou variante com/sem hífen.
 */
export function findProvince(provNameOrVal?: string | null) {
  if (!provNameOrVal) return undefined;
  const raw = String(provNameOrVal).trim().toLowerCase();
  const norm = raw.replace(/[-_\s]+/g, "");
  return ao_provinces.find(
    (p) =>
      p.value.toLowerCase() === raw ||
      p.label.toLowerCase() === raw ||
      p.value.replace(/[-_\s]+/g, "") === norm ||
      p.label.replace(/[-_\s]+/g, "").toLowerCase() === norm
  );
}

/**
 * Encontra o município correspondente a partir de um valor, etiqueta ou variante com/sem hífen.
 */
export function findMunicipality(provNameOrVal?: string | null, munNameOrVal?: string | null) {
  if (!munNameOrVal) return undefined;
  const prov = findProvince(provNameOrVal);
  const rawMun = String(munNameOrVal).trim().toLowerCase();
  const normMun = rawMun.replace(/[-_\s]+/g, "");

  if (prov) {
    const found = prov.municipalities.find(
      (m) =>
        m.value.toLowerCase() === rawMun ||
        m.label.toLowerCase() === rawMun ||
        m.value.replace(/[-_\s]+/g, "") === normMun ||
        m.label.replace(/[-_\s]+/g, "").toLowerCase() === normMun
    );
    if (found) return found;
  }

  for (const p of ao_provinces) {
    const found = p.municipalities.find(
      (m) =>
        m.value.toLowerCase() === rawMun ||
        m.label.toLowerCase() === rawMun ||
        m.value.replace(/[-_\s]+/g, "") === normMun ||
        m.label.replace(/[-_\s]+/g, "").toLowerCase() === normMun
    );
    if (found) return found;
  }
  return undefined;
}

export const administrative_category = [
  { label: "Distrito", value: "district" },
  { label: "Município", value: "municipality" },
  { label: "Comuna", value: "commune" },
  { label: "Bairro", value: "neighborhood" },
  { label: "Aldeia", value: "village" },
  { label: "Cidade", value: "city" },
];

export const common_usage = [
  { label: "Oficial", value: "official" },
  { label: "Popular", value: "popular" },
  { label: "Histórico", value: "historic" },
  { label: "Cultural", value: "cultural" },
]

export const management = [
  {label: "Governamental", value: "gov"},
  {label: "Privada", value: "private"},
  {label: "Comunitária", value: "community"},
]

