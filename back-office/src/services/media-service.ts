import api from "./api";

export interface UploadMediaPayload {
  file: File;
  entity?: string;
  entityId?: string;
}

export interface MediaAsset {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  storageProvider: string;
  uploadedById?: string;
  entity?: string;
  entityId?: string;
  createdAt: string;
  updatedAt: string;
}

export const mediaService = {
  uploadMedia: async ({ file, entity, entityId }: UploadMediaPayload): Promise<MediaAsset> => {
    const formData = new FormData();
    formData.append("file", file);

    if (entity) formData.append("entity", entity);
    if (entityId) formData.append("entityId", entityId);

    const response = await api.post("/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};
