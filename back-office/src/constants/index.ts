export const itemsStatusOptions = [
  { value: "ACTIVE", label: "Activo" },
  { value: "INACTIVE", label: "Inactivo" },
];

export const itemsByOption = [
  { value: "name", label: "Nome" },
  { value: "createdAt", label: "Mais Recente" },
  { value: "updatedAt", label: "Mais Antigo" },
];

export const itemsOrderOption = [
  { value: "asc", label: "A-Z" },
  { value: "desc", label: "Z-A" },
];

export * from "./menu-items";

const isProd = process.env.NODE_ENV === "production";
const cookiePrefix = isProd ? "__Host-" : "";

export const ACCESS_TOKEN_KEY = `${cookiePrefix}medproject.accessToken`;
export const REFRESH_TOKEN_KEY = `${cookiePrefix}medproject.refreshToken`;
export const ROLE_KEY = `${cookiePrefix}medproject.role`;

export * from "./antroponym";
export * from "./entries";
export * from "./toponym";
