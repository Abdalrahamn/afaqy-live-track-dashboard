import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NotImplementedComponent } from './not-implemented.component';

describe('NotImplementedComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NotImplementedComponent],
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(NotImplementedComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the default label when no input is provided', () => {
    const fixture = TestBed.createComponent(NotImplementedComponent);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.textContent;
    expect(html).toContain('Page Not Implemented');
  });

  it('renders a custom label when provided via input', () => {
    const fixture = TestBed.createComponent(NotImplementedComponent);
    fixture.componentRef.setInput('label', 'Reports Coming Soon');
    fixture.detectChanges();
    const html: string = fixture.nativeElement.textContent;
    expect(html).toContain('Reports Coming Soon');
  });

  it('renders the coming soon message', () => {
    const fixture = TestBed.createComponent(NotImplementedComponent);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.textContent;
    expect(html).toContain('coming soon');
  });
});
