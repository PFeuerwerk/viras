import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICON_GALLERY } from '../../business-constants';

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-picker.html'
})
export class IconPickerComponent implements OnInit {
  @Input() selectedIcon: string = '';
  @Input() tipoNegocio: string = '';
  @Output() iconSelected = new EventEmitter<string>();

  public iconGallery = ICON_GALLERY;
  public categories: string[] = [];
  public activeCategory: string = '';
  public today = Date.now(); // För att undvika cachade bilder

  ngOnInit(): void {
    this.categories = Object.keys(this.iconGallery);

    // Intelligent logik för att förvälja rätt kategori baserat på verksamhetstyp
    if (this.tipoNegocio && this.iconGallery[this.tipoNegocio]) {
      this.activeCategory = this.tipoNegocio;
    } else if (this.categories.length > 0) {
      this.activeCategory = this.categories[0];
    }
  }

  setActiveCategory(category: string): void {
    this.activeCategory = category;
  }

  selectIcon(iconName: string): void {
    this.selectedIcon = iconName;
    this.iconSelected.emit(iconName);
  }

  handleError(event: any) {
    event.target.style.display = 'none';
    const parent = event.target.parentElement;
    if (parent) parent.style.backgroundColor = '#4f46e5';
  }
}
