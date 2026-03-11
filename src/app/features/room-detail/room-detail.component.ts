import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RoomStatus, RoomDetailDialogData } from '@core/models';

export type { RoomDetailDialogData };

@Component({
  selector: 'app-room-detail',
  imports: [TitleCasePipe, MatDialogModule, MatButtonModule, MatIconModule, MatChipsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.scss',
})
export class RoomDetailComponent {
  protected readonly RoomStatus = RoomStatus;
  readonly dialogRef = inject(MatDialogRef<RoomDetailComponent>);
  readonly data = inject<RoomDetailDialogData>(MAT_DIALOG_DATA);
}
