import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Room, RoomStatus } from '@core/models';
import { DashboardService } from '@core/services';

@Component({
  selector: 'app-rooms',
  imports: [TitleCasePipe, MatIconModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
})
export class RoomsComponent {
  protected readonly RoomStatus = RoomStatus;
  readonly dashboardService = inject(DashboardService);

  readonly searchQuery = signal('');

  readonly filteredRooms = computed<Room[]>(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const rooms = this.dashboardService.rooms();
    if (!query) return rooms;
    return rooms.filter(
      (r) => r.name.toLowerCase().includes(query) || r.floor.toString().includes(query),
    );
  });

  private readonly _init = (() => {
    this.dashboardService.init();
  })();

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }
}
