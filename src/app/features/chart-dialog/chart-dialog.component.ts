import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TitleCasePipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import {
  CustomChart,
  ChartRange,
  SensorType,
  Room,
  ChartDialogData,
  ChartDialogResult,
} from '@core/models';
import { DashboardService } from '@core/services';
import { generateId, hasOverlappingRanges, areRangeNamesUnique } from '@shared/utils';
import { DEFAULT_RANGE_COLOR } from '@core/constants';

export type { ChartDialogData, ChartDialogResult };

@Component({
  selector: 'app-chart-dialog',
  imports: [
    TitleCasePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart-dialog.component.html',
  styleUrl: './chart-dialog.component.scss',
})
export class ChartDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ChartDialogComponent>);
  private readonly dialogData = inject<ChartDialogData>(MAT_DIALOG_DATA);
  private readonly dashboardService = inject(DashboardService);

  readonly isEditMode = !!this.dialogData.chart;
  readonly title = this.isEditMode ? 'Edit Chart' : 'Add Custom Chart';

  readonly selectableRooms = this.dashboardService.selectableRooms();

  /** Validation error messages for ranges */
  readonly rangeErrors = signal<string | null>(null);

  readonly rangesArray: FormArray = this.fb.array(
    this.dialogData.chart?.ranges.map((r) => this.createRangeGroup(r)) ?? [this.createRangeGroup()],
  );

  readonly form: FormGroup = this.fb.group({
    name: [this.dialogData.chart?.name ?? '', [Validators.required]],
    roomIds: [this.dialogData.chart?.roomIds ?? [], [Validators.required, Validators.minLength(1)]],
    sensorType: [this.dialogData.chart?.sensorType ?? '', [Validators.required]],
  });

  /** Reactive signal derived from the roomIds form control — drives available sensor types */
  readonly selectedRoomIds = toSignal(
    this.form.get('roomIds')!.valueChanges as Observable<string[]>,
    { initialValue: this.dialogData.chart?.roomIds ?? [] },
  );

  /** Full Room objects for the currently selected room IDs */
  readonly selectedRooms = computed<Room[]>(() =>
    this.selectedRoomIds()
      .map((id) => this.selectableRooms.find((r) => r.id === id))
      .filter((r): r is Room => r !== undefined),
  );

  readonly availableSensorTypes = computed<SensorType[]>(() => {
    const selectedRooms = this.selectedRoomIds();
    if (selectedRooms.length === 0) {
      return this.dashboardService.availableSensorTypes();
    }
    return this.dashboardService.commonSensorTypes(selectedRooms);
  });

  /** Reset sensor type whenever it is no longer valid for the current room selection */
  private readonly _sensorTypeReset = effect(() => {
    const available = this.availableSensorTypes();
    const current = this.form.get('sensorType')!.value as string;
    if (current && !available.includes(current as SensorType)) {
      this.form.get('sensorType')!.setValue('', { emitEvent: false });
    }
  });

  /* ── Range management ───────────────────────────────── */

  addRange(): void {
    this.rangesArray.push(this.createRangeGroup());
  }

  removeRange(index: number): void {
    if (this.rangesArray.length > 1) {
      this.rangesArray.removeAt(index);
    }
  }

  removeRoom(roomId: string, event: MouseEvent): void {
    event.stopPropagation();
    const current = (this.form.get('roomIds')!.value as string[]) ?? [];
    this.form.get('roomIds')!.setValue(current.filter((id) => id !== roomId));
    this.form.get('roomIds')!.markAsTouched();
  }

  private createRangeGroup(range?: ChartRange): FormGroup {
    return this.fb.group({
      name: [range?.name ?? '', [Validators.required]],
      from: [range?.from ?? 0, [Validators.required]],
      to: [range?.to ?? 0, [Validators.required]],
      color: [range?.color ?? DEFAULT_RANGE_COLOR, [Validators.required]],
    });
  }

  /* ── Submit ─────────────────────────────────────────── */

  onSubmit(): void {
    if (this.form.invalid || this.rangesArray.invalid) {
      this.form.markAllAsTouched();
      this.rangesArray.markAllAsTouched();
      return;
    }

    const ranges: ChartRange[] = this.rangesArray.value;

    // Validate range overlap
    if (hasOverlappingRanges(ranges)) {
      this.rangeErrors.set('Ranges must not overlap. Please adjust the values.');
      return;
    }

    // Validate range name uniqueness
    if (!areRangeNamesUnique(ranges)) {
      this.rangeErrors.set('Range names must be unique within a chart.');
      return;
    }

    // Validate chart name uniqueness
    const name = this.form.get('name')!.value.trim();
    const existingCharts = this.dashboardService.charts();
    const isDuplicate = existingCharts.some(
      (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== this.dialogData.chart?.id,
    );
    if (isDuplicate) {
      this.form.get('name')!.setErrors({ duplicate: true });
      return;
    }

    this.rangeErrors.set(null);

    const chart: CustomChart = {
      id: this.dialogData.chart?.id ?? generateId(),
      name,
      sensorType: this.form.get('sensorType')!.value,
      roomIds: this.form.get('roomIds')!.value,
      ranges,
      order: this.dialogData.chart?.order ?? this.dashboardService.charts().length,
    };

    this.dialogRef.close({ chart } as ChartDialogResult);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  /* ── Helpers for template ───────────────────────────── */

  getRoomName(roomId: string): string {
    return this.dashboardService.roomMap().get(roomId)?.name ?? roomId;
  }
}
