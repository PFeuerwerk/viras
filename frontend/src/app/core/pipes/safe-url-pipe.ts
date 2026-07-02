import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true // Muy importante para tu arquitectura standalone
})
export class SafeUrlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  /**
   * Toma una URL de string y la convierte en una URL segura 
   * para ser usada en iframes (como Google Maps).
   */
  transform(url: string | null | undefined): SafeResourceUrl {
    if (!url) {
      return '';
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
