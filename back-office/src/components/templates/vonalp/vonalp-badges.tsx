"use client";

import { Badge } from "@/components/ui/badge";
import { VonalpCompletionStatus } from "@/types";

type Props = {
  isVocabulary?: boolean;
  isVocabularyEP?: boolean;
  vonalpCompletionStatus?: VonalpCompletionStatus;
  vonalpEpCompletionStatus?: VonalpCompletionStatus;
};

const statusLabels: Record<VonalpCompletionStatus, string> = {
  COMPLETE: "Completo",
  INCOMPLETE: "Incompleto",
  ARCHIVED: "Arquivado",
};

function statusLabel(status?: VonalpCompletionStatus) {
  return status ? ` · ${statusLabels[status]}` : "";
}

export function VonalpBadges({
  isVocabulary,
  isVocabularyEP,
  vonalpCompletionStatus,
  vonalpEpCompletionStatus,
}: Props) {
  if (!isVocabulary && !isVocabularyEP) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {isVocabulary && <Badge variant="secondary">VONALP{statusLabel(vonalpCompletionStatus)}</Badge>}
      {isVocabularyEP && <Badge variant="secondary">VONALP-EP{statusLabel(vonalpEpCompletionStatus)}</Badge>}
    </div>
  );
}
