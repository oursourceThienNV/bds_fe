import { MediaService } from '../services/services-app/media.service';
import { environment } from '../../../environments/environment';

export class UploadAdapter {
  private loader: any;
  private mediaService: MediaService;

  constructor(loader: any, mediaService: MediaService) {
    this.loader = loader;
    this.mediaService = mediaService;
  }

  upload(): Promise<any> {
    return this.loader.file.then((file: File) => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);

        this.mediaService.uploadMedia(formData).subscribe(
          (response) => {
            if (response.responseCode === '00' && response.body && response.body.media) {
              const imageUrl = response.body.media.url;
              // Construct full URL using environment domain
              const fullUrl = imageUrl.startsWith('http')
                ? imageUrl
                : `${environment.apiUrl}${imageUrl}`;

              resolve({
                default: fullUrl
              });
            } else {
              reject(response.responseMessage || 'Upload failed');
            }
          },
          (error) => {
            reject(error);
          }
        );
      });
    });
  }

  abort() {
    // Abort upload if needed
  }
}

export function UploadAdapterPlugin(editor: any, mediaService: MediaService) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    return new UploadAdapter(loader, mediaService);
  };
}
