import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { CitasService } from './citas.service';

describe('CitasService', () => {
  let service: CitasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });

    service = TestBed.inject(CitasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
