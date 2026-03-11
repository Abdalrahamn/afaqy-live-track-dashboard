import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeleteConfirmDialogComponent } from './delete-confirm-dialog.component';

describe('DeleteConfirmDialogComponent', () => {
  const mockDialogRef = { close: () => {} };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DeleteConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { chartName: 'My Chart' } },
      ],
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(DeleteConfirmDialogComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exposes the injected chart name', () => {
    const fixture = TestBed.createComponent(DeleteConfirmDialogComponent);
    expect(fixture.componentInstance.data.chartName).toBe('My Chart');
  });

  it('renders the chart name in the template', () => {
    const fixture = TestBed.createComponent(DeleteConfirmDialogComponent);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.textContent;
    expect(html).toContain('My Chart');
  });
});
