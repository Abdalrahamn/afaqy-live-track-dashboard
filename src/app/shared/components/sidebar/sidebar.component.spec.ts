import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])],
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the AFAQY brand name', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.textContent;
    expect(html).toContain('AFAQY');
  });

  it('renders the Dashboard navigation link', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.textContent;
    expect(html).toContain('Dashboard');
  });

  it('renders the Rooms navigation link', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.textContent;
    expect(html).toContain('Rooms');
  });

  it('renders all main navigation sections', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.textContent;
    expect(html).toContain('Alerts');
    expect(html).toContain('Reports');
    expect(html).toContain('Sensors');
    expect(html).toContain('Settings');
  });
});
