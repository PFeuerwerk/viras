import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { Placeholder } from './placeholder';

describe('Placeholder', () => {
  let component: Placeholder;
  let fixture: ComponentFixture<Placeholder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Placeholder],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Placeholder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
