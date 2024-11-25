import { afterRender, Component, ElementRef, model, Signal, signal, WritableSignal } from '@angular/core';
import { generateTextCaptcha, drawTextCaptcha, Page, PageType, ResultCaptchaText } from '../../utils';
import { NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CaptchaService } from '../../../core/services/captcha/captcha.service';
import { AlertService } from '../../../core/services/alert/alert.service';
import { AlertComponent } from '../alert/alert.component';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-text-captcha',
  imports: [ReactiveFormsModule, AlertComponent],
  templateUrl: './text-captcha.component.html',
  styleUrl: './text-captcha.component.css',
  animations: [
    trigger('canvas', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ]),
    trigger('title', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ]),
    trigger('header', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('400ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ]),
  ]
})
export class TextCaptchaComponent {
  captcha = signal('');
  userInput = new FormControl('');
  canvas: WritableSignal<HTMLCanvasElement | null> = signal(null);
  // isValid = signal(false);
  page?: Page;

  constructor(
    private elementRef: ElementRef,
    private captchaService: CaptchaService,
    private alertService: AlertService
  ) {
    this.alertService.clear()
  }

  ngOnInit(): void {
    this.initializeCaptcha();
  }

  private initializeCaptcha(): void {
    this.page = this.captchaService.getPage(PageType.Text);

    if (!this.page || !this.captchaService.isTextCaptcha(this.page?.metadata)) {
      this.alertService.error('Verification Error', 'Captcha page is not initialized. Please refresh the page.');
      return;
    }

    const previousCaptchaCode = this.page.metadata.captchaCode.trim() || '';
    const newCaptchaCode = previousCaptchaCode.length > 0 ? previousCaptchaCode : generateTextCaptcha();
    this.captcha.set(newCaptchaCode);
    this.page.metadata.captchaCode = newCaptchaCode;

    const canvasElement = this.elementRef.nativeElement.querySelector('canvas');
    this.canvas.set(canvasElement);
    drawTextCaptcha(this.canvas, this.captcha());

    this.userInput.reset()
    this.userInput.setValue(this.page.metadata.userInput.trim() || '');

    this.page.metadata.isValid = this.userInput.value === this.page.metadata.captchaCode

    if (this.captchaService.isPageLocked(this.page.id)) {
      this.alertService.warning('Locked Out', 'You have reached the maximum attempts or already complete this challenge. Proceed to the next challenge.');
      return;
    }
  }

  verify(): void {
    if (!this.page) {
      this.alertService.error('Verification Error', 'Captcha page is not initialized. Please refresh the page.');
      return;
    }

    if (this.captchaService.isPageLocked(this.page.id)) {
      this.alertService.warning('Locked Out', 'You have reached the maximum attempts or already complete this challenge. Proceed to the next challenge.');
      return;
    }

    const userInputValue = this.userInput.value?.trim() || '';
    this.page.metadata.userInput = userInputValue;
    this.page.metadata.isValid = this.captcha() === userInputValue;
    
    // Increment attempts and get new count
    const currentAttempts = this.captchaService.incrementAttempts(this.page.id);
    
    if (!this.page.metadata.isValid) {
      this.handleFailedVerification(currentAttempts);
      return;
    }

    this.handleSuccessfulVerification();
  }

  private handleFailedVerification(currentAttempts: number): void {
    if (!this.page) return;

    const remainingAttempts = this.captchaService.getRemainingAttempts(this.page.id);

    if (remainingAttempts <= 0) {
      this.alertService.warning(
        'Maximum Attempts Reached',
        'You have exceeded the maximum number of attempts. You can proceed to the next challenge or refresh this one.'
      );
      return;
    }

    this.userInput.reset();
    this.page.metadata.userInput = '';
    this.alertService.error(
      'Verification Failed', 
      `Incorrect captcha code. You have ${remainingAttempts} attempts remaining.`
    );
  }

  private handleSuccessfulVerification(): void {
    if (!this.page) return;
    
    this.alertService.success('Verification Successful', 'The captcha code is correct. Click "Next" to continue.');
    this.userInput.reset();
  }

  refreshCaptcha(): void {
    if (!this.page) return;

    if (this.captchaService.isPageLocked(this.page.id)) {
      this.alertService.warning('Locked Out', 'You cannot refresh the captcha after reaching the maximum attempts or completing the task.');
      return;
    }

    this.captchaService.resetPages(PageType.Text);
    this.initializeCaptcha()
    
    const remainingAttempts = this.captchaService.getRemainingAttempts(this.page.id);
    this.alertService.info(
      'Captcha Refreshed', 
      `A new captcha has been generated. You have ${remainingAttempts} attempts remaining.`
    );
  }
}
