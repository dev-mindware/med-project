/** Minúsculas e sem acentos, para casar nomes de províncias vindos da API. */
export function foldName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
}

export type ProvinceTile = { key: string; label: string; row: number; col: number; aliases?: string[] }

/** Posição aproximada de cada província num esquema de 7 colunas (norte em cima). */
export const provinceTiles: ProvinceTile[] = [
  { key: "cabinda", label: "Cabinda", row: 0, col: 0 },
  { key: "zaire", label: "Zaire", row: 1, col: 0 },
  { key: "uige", label: "Uíge", row: 1, col: 1 },
  { key: "lunda norte", label: "Lunda Norte", row: 1, col: 4 },
  { key: "luanda", label: "Luanda", row: 2, col: 0 },
  { key: "bengo", label: "Bengo", row: 2, col: 1 },
  { key: "cuanza norte", label: "Cuanza Norte", row: 2, col: 2 },
  { key: "malanje", label: "Malanje", row: 2, col: 3 },
  { key: "lunda sul", label: "Lunda Sul", row: 2, col: 4 },
  { key: "icolo e bengo", label: "Icolo e Bengo", row: 3, col: 0 },
  { key: "cuanza sul", label: "Cuanza Sul", row: 3, col: 1 },
  { key: "bie", label: "Bié", row: 3, col: 3 },
  { key: "moxico", label: "Moxico", row: 3, col: 5 },
  { key: "benguela", label: "Benguela", row: 4, col: 1 },
  { key: "huambo", label: "Huambo", row: 4, col: 2 },
  { key: "moxico leste", label: "Moxico Leste", row: 4, col: 5 },
  { key: "namibe", label: "Namibe", row: 5, col: 1 },
  { key: "huila", label: "Huíla", row: 5, col: 2 },
  { key: "cubango", label: "Cubango", row: 5, col: 3, aliases: ["cuando cubango"] },
  { key: "cuando", label: "Cuando", row: 5, col: 4 },
  { key: "cunene", label: "Cunene", row: 6, col: 2 },
]
