import { AuditLogResponse } from "@/types";

export const actionLabels: Record<string, string> = {
  CREATE: "Criação",
  UPDATE: "Actualização",
  DELETE: "Eliminação",
  LOGIN: "Login",
  OTHER: "Outra ação",
};

export const entityLabels: Record<string, string> = {
  Entry: "Entrada",
  Neologism: "Neologismo",
  Toponym: "Topónimo",
  Anthroponym: "Antropónimo",
  Foreignism: "Estrangeirismo",
  BlogPost: "Publicação",
  Event: "Evento",
  EventRegistration: "Inscrição em evento",
  User: "Utilizador",
  Auth: "Autenticação",
  MediaAsset: "Multimédia",
  Report: "Relatório",
};

export const statusLabels: Record<string, string> = {
  SUCCESS: "Sucesso",
  FAILED: "Falhou",
};

export const methodLabels: Record<string, string> = {
  POST: "Criação",
  PUT: "Actualização completa",
  PATCH: "Actualização parcial",
  DELETE: "Eliminação",
};

export const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  OPERATOR: "Operador",
};

export const approvalStatusLabels: Record<string, string> = {
  DRAFT: "Rascunho",
  PENDING_APPROVAL: "Pendente de aprovação",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  NEEDS_CORRECTION: "Precisa de correção",
  ARCHIVED: "Arquivado",
};

export const fieldLabels: Record<string, string> = {
  entry: "Entrada",
  firstDefinition: "Primeira definição",
  pronunciation: "Pronúncia",
  syllabicDivision: "Divisão silábica",
  etymology: "Etimologia",
  secondDefinition: "Segunda definição",
  thirdDefinition: "Terceira definição",
  usageExample: "Exemplo de uso",
  abbreviation: "Abreviatura",
  acronym: "Acrónimo",
  acronymMeaning: "Significado do acrónimo",
  reduction: "Redução",
  reductionMeaning: "Significado da redução",
  shortForm: "Forma curta",
  fullForm: "Forma completa",
  grammaticalCategory: "Categoria gramatical",
  grammaticalSubcategory: "Subcategoria gramatical",
  grammaticalStatus: "Estado gramatical",
  languageCode: "Código da língua",
  audioUrl: "Áudio",
  imageUrl: "Imagem",
  videoUrl: "Vídeo",
  isVocabulary: "É VONALP",
  isVocabularyEP: "É vocabulário EP",
  isForeignism: "É estrangeirismo",
  toponym: "Topónimo",
  province: "Província",
  meaning: "Significado",
  municipality: "Município",
  location: "Localização",
  gentilic: "Gentílico",
  locationImage: "Imagem do local",
  toponymHistory: "História do topónimo",
  toponymProvenance: "Proveniência do topónimo",
  commonUsage: "Uso comum",
  graphicVariation: "Variação gráfica",
  toponymClasses: "Classes do topónimo",
  toponymSubclasses: "Subclasses do topónimo",
  name: "Nome próprio",
  gender: "Género",
  surname: "Apelido",
  surnameMeaning: "Significado do apelido",
  historicalFigure: "Figura histórica",
  historicalFigurePseudonym: "Pseudónimo da figura histórica",
  historicalFigureDomain: "Domínio de atuação",
  term: "Termo estrangeiro",
  originalLanguage: "Idioma original",
  originCountry: "País de origem",
  adaptedForm: "Forma adaptada",
  originalForm: "Forma original",
  context: "Contexto",
  field: "Área de conhecimento",
  approvalStatus: "Estado editorial",
  rejectedAt: "Data de rejeição",
  rejectionReason: "Motivo de rejeição",
  correctionNotes: "Notas de correção",
  submittedAt: "Data de submissão",
  approvedAt: "Data de aprovação",
};

const technicalFields = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "createdById",
  "updatedById",
  "approvedById",
]);

export function translateAction(action?: string | null) {
  return action ? actionLabels[action] || action : "-";
}

export function translateEntity(entity?: string | null) {
  return entity ? entityLabels[entity] || entity : "-";
}

export function translateStatus(status?: string | null) {
  return status ? statusLabels[status] || status : "-";
}

export function translateRole(role?: string | null) {
  return role ? roleLabels[role] || role : "-";
}

export function translateMethod(method?: string | null) {
  return method ? methodLabels[method] || method : "-";
}

export function translateApprovalStatus(status?: string | null) {
  return status ? approvalStatusLabels[status] || status : "-";
}

export function translateField(field?: string | null) {
  return field ? fieldLabels[field] || field : "-";
}

export function getFriendlyChangedFields(log: AuditLogResponse) {
  const metadataFields = Array.isArray(log.metadata?.changedFields) ? log.metadata.changedFields : [];
  const valueFields = getChangedFieldsFromValues(log);
  const fields = metadataFields.length > 0 ? metadataFields : valueFields;

  return Array.from(new Set(fields))
    .filter((field) => !technicalFields.has(field))
    .map((field) => translateField(field));
}

export function buildAuditTitle(log: AuditLogResponse) {
  if (log.status === "FAILED") {
    return `Falha na ${translateAction(log.action).toLocaleLowerCase("pt-PT")}`;
  }

  if (isReviewLog(log)) return "Estado editorial alterado";
  if (log.action === "CREATE") return `${translateEntity(log.entity)} criado`;
  if (log.action === "UPDATE") return `${translateEntity(log.entity)} actualizado`;
  if (log.action === "DELETE") return `${translateEntity(log.entity)} removido`;
  if (log.action === "LOGIN") return "Sessão iniciada";

  return "Atividade registada";
}

export function buildAuditDescription(log: AuditLogResponse) {
  const actor = log.actor?.name || "Sistema";
  const entity = translateEntity(log.entity).toLocaleLowerCase("pt-PT");
  const recordName = getRecordName(log);
  const recordText = recordName ? ` "${recordName}"` : "";

  if (log.status === "FAILED") {
    const reason = log.failureReason ? ` Motivo: ${formatFailureReason(log.failureReason)}.` : "";
    return `${actor} tentou executar ${translateAction(log.action).toLocaleLowerCase("pt-PT")} em ${entity}${recordText}, mas a ação não foi concluída.${reason}`;
  }

  if (isReviewLog(log)) {
    const oldStatus = translateApprovalStatus(log.oldValues?.approvalStatus);
    const newStatus = translateApprovalStatus(log.newValues?.approvalStatus);
    const reason = getReviewReason(log);
    const reasonText = reason ? ` Observação: ${reason}` : "";
    return `${actor} alterou o estado de ${entity}${recordText} de ${oldStatus} para ${newStatus}.${reasonText}`;
  }

  if (log.action === "CREATE") {
    return `${actor} criou ${entity}${recordText}. O registo entrou no fluxo editorial e pode ser acompanhado pela equipa responsável.`;
  }

  if (log.action === "UPDATE") {
    const fields = getFriendlyChangedFields(log);
    const fieldText = fields.length > 0 ? ` Campos alterados: ${fields.join(", ")}.` : "";
    return `${actor} actualizou ${entity}${recordText}.${fieldText}`;
  }

  if (log.action === "DELETE") {
    return `${actor} removeu ${entity}${recordText}.`;
  }

  if (log.action === "LOGIN") {
    return `${actor} iniciou sessão no sistema.`;
  }

  return `${actor} realizou uma actividade em ${entity}${recordText}.`;
}

function isReviewLog(log: AuditLogResponse) {
  const path = typeof log.metadata?.path === "string" ? log.metadata.path : "";
  return path.includes("/review") || log.oldValues?.approvalStatus !== log.newValues?.approvalStatus;
}

function getRecordName(log: AuditLogResponse) {
  const values = log.newValues || log.oldValues || {};
  const keyByEntity: Record<string, string> = {
    Entry: "entry",
    Neologism: "entry",
    Toponym: "toponym",
    Anthroponym: "name",
    Foreignism: "term",
    BlogPost: "title",
    Event: "title",
    User: "name",
    MediaAsset: "filename",
    Report: "filename",
  };
  const key = keyByEntity[log.entity];
  const value = key ? values?.[key] : undefined;
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function getChangedFieldsFromValues(log: AuditLogResponse) {
  if (!log.oldValues || !log.newValues) return [];

  return Object.keys(log.newValues).filter((key) => {
    return JSON.stringify(log.oldValues?.[key]) !== JSON.stringify(log.newValues?.[key]);
  });
}

function getReviewReason(log: AuditLogResponse) {
  const reason = log.newValues?.rejectionReason || log.newValues?.correctionNotes;
  return typeof reason === "string" && reason.trim() ? reason.trim() : "";
}

function formatFailureReason(reason: unknown) {
  if (Array.isArray(reason)) return reason.join(", ");
  return String(reason);
}
