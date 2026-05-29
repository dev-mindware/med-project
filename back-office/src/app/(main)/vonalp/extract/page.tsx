import { PageWrapper } from "@/components/common";
import { ManualVocabularyPageContent } from "@/components/templates/manual-vocabulary";

export default function ExtractVocabularyPage() {
  return (
    <PageWrapper subRoute="Extrair de PDF">
      <ManualVocabularyPageContent />
    </PageWrapper>
  );
}
