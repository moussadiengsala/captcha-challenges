import { afterRender, Component, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TextCaptchaComponent } from '../../../sheared/components/text-captcha/text-captcha.component';
import { MathCaptchaComponent } from '../../../sheared/components/math-captcha/math-captcha.component';
import { ImageCaptchaComponent } from '../../../sheared/components/image-captcha/image-captcha.component';
import { CaptchaService } from '../../services/captcha/captcha.service';
import { Page, PageType } from '../../../sheared/utils';
import { CommonModule, NgIf } from '@angular/common';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatIcon } from '@angular/material/icon';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-captcha',
  imports: [ReactiveFormsModule, TextCaptchaComponent, MathCaptchaComponent, ImageCaptchaComponent, NgIf, CommonModule],
  templateUrl: './captcha.component.html',
  styleUrl: './captcha.component.css',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ])
    ])
  ]
})

export class CaptchaComponent {

  constructor(public captchaService: CaptchaService) {
    afterRender(() => {
      console.log(this.captchaService);
    })
  }

  challenges = new FormGroup({})

  trackByFn(index: number, page: Page) { return page.id }

  getProgressPercentage(): number {
    const totalSteps = this.captchaService.getPages().length;
    const currentStep = this.captchaService.getStep();
    return (currentStep / totalSteps) * 100;
  }

  isLastStep(): boolean {
    return this.captchaService.getStep() === this.captchaService.getPages().length;
  }

  isFirstStep(): boolean {
    return this.captchaService.getStep() === 1;
  }
}
