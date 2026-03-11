import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ChartCardComponent } from './chart-card.component';
import { ChartDisplayData, SensorType } from '@core/models';

const mockDisplayData: ChartDisplayData = {
  chart: {
    id: 'chart-1',
    name: 'Temp Chart',
    sensorType: SensorType.Temperature,
    roomIds: ['room-1', 'room-2'],
    ranges: [
      { name: 'Low', from: 0, to: 20, color: '#60A5FA' },
      { name: 'High', from: 20, to: 40, color: '#F87171' },
    ],
    order: 0,
  },
  segments: [
    { rangeName: 'Low', color: '#60A5FA', count: 2, roomIds: ['room-1', 'room-2'] },
    { rangeName: 'High', color: '#F87171', count: 0, roomIds: [] },
  ],
  totalQualified: 2,
};

const emptyDisplayData: ChartDisplayData = {
  ...mockDisplayData,
  segments: [
    { rangeName: 'Low', color: '#60A5FA', count: 0, roomIds: [] },
    { rangeName: 'High', color: '#F87171', count: 0, roomIds: [] },
  ],
  totalQualified: 0,
};

describe('ChartCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChartCardComponent],
    });
    // Stub canvas.getContext to prevent Chart.js errors in jsdom
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 0 }),
      save: vi.fn(),
      restore: vi.fn(),
      canvas: { width: 200, height: 200 },
      drawImage: vi.fn(),
      createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
    });
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(ChartCardComponent);
    fixture.componentRef.setInput('data', mockDisplayData);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('hasData returns true when at least one segment has count > 0', () => {
    const fixture = TestBed.createComponent(ChartCardComponent);
    fixture.componentRef.setInput('data', mockDisplayData);
    expect(fixture.componentInstance.hasData()).toBe(true);
  });

  it('hasData returns false when all segments have count 0', () => {
    const fixture = TestBed.createComponent(ChartCardComponent);
    fixture.componentRef.setInput('data', emptyDisplayData);
    expect(fixture.componentInstance.hasData()).toBe(false);
  });

  it('renders the chart name', () => {
    const fixture = TestBed.createComponent(ChartCardComponent);
    fixture.componentRef.setInput('data', mockDisplayData);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.textContent;
    expect(html).toContain('Temp Chart');
  });

  it('emits edit event with chart id on onEdit()', () => {
    const fixture = TestBed.createComponent(ChartCardComponent);
    fixture.componentRef.setInput('data', mockDisplayData);
    const emitted: string[] = [];
    fixture.componentInstance.edit.subscribe((id: string) => emitted.push(id));
    fixture.componentInstance.onEdit();
    expect(emitted).toEqual(['chart-1']);
  });

  it('emits delete event with chart id on onDelete()', () => {
    const fixture = TestBed.createComponent(ChartCardComponent);
    fixture.componentRef.setInput('data', mockDisplayData);
    const emitted: string[] = [];
    fixture.componentInstance.delete.subscribe((id: string) => emitted.push(id));
    fixture.componentInstance.onDelete();
    expect(emitted).toEqual(['chart-1']);
  });

  it('emits openList event with chart id on onOpenList()', () => {
    const fixture = TestBed.createComponent(ChartCardComponent);
    fixture.componentRef.setInput('data', mockDisplayData);
    const emitted: string[] = [];
    fixture.componentInstance.openList.subscribe((id: string) => emitted.push(id));
    fixture.componentInstance.onOpenList();
    expect(emitted).toEqual(['chart-1']);
  });

  it('shows empty state when no data', () => {
    const fixture = TestBed.createComponent(ChartCardComponent);
    fixture.componentRef.setInput('data', emptyDisplayData);
    fixture.detectChanges();
    const html: string = fixture.nativeElement.textContent;
    expect(html).toContain('No rooms currently match any range');
  });
});
