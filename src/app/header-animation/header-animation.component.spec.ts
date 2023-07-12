import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderAnimationComponent } from './header-animation.component';

describe('HeaderAnimationComponent', () => {
  let component: HeaderAnimationComponent;
  let fixture: ComponentFixture<HeaderAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderAnimationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
