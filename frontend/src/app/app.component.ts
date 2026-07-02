import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PlaceholderService } from './features/placeholder/services/placeholder.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html'
})
export class AppComponent implements OnInit {
  title = 'viras';

  constructor(
    private router: Router,
    private placeholderService: PlaceholderService
  ) { }

  ngOnInit(): void {
    this.subscribeToRouteChanges();
  }

  /**
   * Monitor de Rutas de Clase Mundial:
   * Detecta cuándo el usuario sale de un negocio para resetear 
   * la identidad visual (colores/fuentes) en el DOM.
   */
  private subscribeToRouteChanges(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;

      // Si el usuario no está en una ruta de negocio (:slug), 
      // limpiamos el estado visual para que el Dashboard o el Login se vean neutros.
      if (!this.isBusinessRoute(url)) {
        this.placeholderService.clearState();
      }
    });
  }

  /**
   * Verifica si la URL actual pertenece a la landing pública de un negocio
   */
  private isBusinessRoute(url: string): boolean {
    // Excluimos rutas administrativas y de autenticación
    const protectedPaths = ['/admin', '/techsoft', '/auth'];
    return !protectedPaths.some(path => url.startsWith(path));
  }
}
