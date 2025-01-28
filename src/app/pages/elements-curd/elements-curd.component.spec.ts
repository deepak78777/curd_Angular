import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementsCurdComponent } from './elements-curd.component';

describe('ElementsCurdComponent', () => {
  let component: ElementsCurdComponent;
  let fixture: ComponentFixture<ElementsCurdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElementsCurdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElementsCurdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
