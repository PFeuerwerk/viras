import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // <--- Vital para Standalone
import { Subscription } from 'rxjs';
import { PlaceholderService } from '../../services/placeholder.service';
import { Business } from '../../../../core/models/business.model';

@Component({
    selector: 'app-about',
    standalone: true, // Aseguramos que sea standalone
    imports: [CommonModule], // Agregamos CommonModule aquí
    templateUrl: './about.html'
})
export class AboutComponent implements OnInit, OnDestroy {
    businessData: Business | undefined;
    private sub: Subscription = new Subscription();

    constructor(private placeholderService: PlaceholderService) { }

    ngOnInit(): void {
        this.sub = this.placeholderService.businessData$.subscribe({
            next: (data: Business | undefined) => {
                if (data) {
                    this.businessData = data;
                }
            },
            error: (err) => console.error('Error cargando datos del negocio:', err)
        });
    }

    ngOnDestroy(): void {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }
}
