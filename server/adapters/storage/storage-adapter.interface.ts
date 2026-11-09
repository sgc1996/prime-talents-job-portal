export interface StoredFileResult {
  id: string;
  url: string;
  key: string;
  mimeType: string;
  sizeBytes: number;
}

export interface StorageAdapter {
  uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folder?: string,
  ): Promise<StoredFileResult>;
  deleteFile(key: string): Promise<boolean>;
  getDownloadUrl(key: string): Promise<string>;
}
