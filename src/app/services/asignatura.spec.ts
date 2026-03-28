import { TestBed } from '@angular/core/testing';

import { Asignatura } from './asignatura';

describe('Asignatura', () => {
  let service: Asignatura;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Asignatura);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
