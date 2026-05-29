import { useMutation } from "@tanstack/react-query";
import { manualVocabularyService } from "@/services";

export function useExtractManualVocabulary() {
  return useMutation({
    mutationFn: (file: File) => manualVocabularyService.extract(file),
    onSuccess: ({ blob, filename }) => {
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}
