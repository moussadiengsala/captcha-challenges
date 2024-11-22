import { Component, input } from '@angular/core';
import { Alert, AlertVariant } from '../../utils';
import { NgClass, NgIf } from '@angular/common';
import { AlertService } from '../../../core/services/alert/alert.service';



@Component({
  selector: 'app-alert',
  imports: [NgClass, NgIf],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {
  alert: Alert | null = null;

  constructor(private alertService: AlertService) {
    this.alertService.alert$.subscribe((alert) => {
      this.alert = alert;
    });
  }

  // Method to clear the alert
  clearAlert(): void {
    this.alertService.clear();
  }

  get variants() {
    return AlertVariant;
  }
}
