import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component'; // Importa el componente raíz
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// Polyfill para compatibilidad entre ngx-intl-tel-input (v17) y ngx-bootstrap (v21)
if (!(BsDropdownModule as any).forRoot) {
  (BsDropdownModule as any).forRoot = function () {
    return {
      ngModule: BsDropdownModule,
      providers: []
    };
  };
}

if (!(TooltipModule as any).forRoot) {
  (TooltipModule as any).forRoot = function () {
    return {
      ngModule: TooltipModule,
      providers: []
    };
  };
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

