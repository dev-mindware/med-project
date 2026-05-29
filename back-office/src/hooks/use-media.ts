import { useMutation } from "@tanstack/react-query";
import { mediaService, UploadMediaPayload } from "@/services/media-service";

export function useUploadMedia() {
  return useMutation({
    mutationFn: (payload: UploadMediaPayload) => mediaService.uploadMedia(payload),
  });
}
