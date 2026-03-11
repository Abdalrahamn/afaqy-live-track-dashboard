import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-implemented',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './not-implemented.component.html',
  styleUrl: './not-implemented.component.scss',
})
export class NotImplementedComponent {
  readonly label = input('Page Not Implemented');
}
