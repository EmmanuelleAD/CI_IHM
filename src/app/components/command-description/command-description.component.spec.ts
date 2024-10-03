import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandDescriptionComponent } from './command-description.component';

describe('CommandDescriptionComponent', () => {
  let component: CommandDescriptionComponent;
  let fixture: ComponentFixture<CommandDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandDescriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
