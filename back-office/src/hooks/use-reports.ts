import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsService } from "@/services/reports-service";
import { ReportFormat, ReportType } from "@/types";

export function useDownloadReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, format }: { type: ReportType; format: ReportFormat }) =>
      reportsService.downloadReport(type, format),
    onSuccess: ({ blob, filename }) => {
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      queryClient.invalidateQueries({ queryKey: ["reports-history"] });
    },
  });
}
