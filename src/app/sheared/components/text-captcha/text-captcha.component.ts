import { afterRender, Component, ElementRef, model, Signal, signal, WritableSignal } from '@angular/core';
import { generateTextCaptcha, drawTextCaptcha, Page, PageType, ResultCaptchaText } from '../../utils';
import { NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CaptchaService } from '../../../core/services/captcha/captcha.service';
import { AlertService } from '../../../core/services/alert/alert.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-text-captcha',
  imports: [ReactiveFormsModule, AlertComponent],
  templateUrl: './text-captcha.component.html',
  styleUrl: './text-captcha.component.css'
})
export class TextCaptchaComponent {
  captcha = signal('');
  userInput = new FormControl('');
  canvas: WritableSignal<HTMLCanvasElement | null> = signal(null);
  isValid = signal(false);
  page?: Page;

  constructor(
    private elementRef: ElementRef,
    private captchaService: CaptchaService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.initializeCaptcha();
  }

  private initializeCaptcha(): void {
    this.page = this.captchaService.getPage(PageType.Text);

    if (!this.captchaService.isTextCaptcha(this.page?.metadata)) {
      this.alertService.error('Initialization Error', 'Failed to initialize the captcha. Please try again later.');
      return;
    }

    const previousCaptchaCode = this.page.metadata.captchaCode || '';
    const newCaptchaCode = previousCaptchaCode.length > 0 ? previousCaptchaCode : generateTextCaptcha();

    this.captcha.set(newCaptchaCode);
    this.page.metadata.captchaCode = newCaptchaCode;

    const canvasElement = this.elementRef.nativeElement.querySelector('canvas');
    this.canvas.set(canvasElement);
    drawTextCaptcha(this.canvas, this.captcha());

    this.isValid.set(this.page.metadata.isValid || false);
    this.userInput.setValue(this.page.metadata.userInput || '');

    this.subscribeToInputChanges();
  }

  private subscribeToInputChanges(): void {
    this.userInput.valueChanges.subscribe((value) => {
      if (!this.captchaService.isTextCaptcha(this.page?.metadata)) {
        this.alertService.error('Error', 'Captcha validation failed. Please refresh the page.');
        return;
      }

      if (this.page.isComplete) return;
      this.page.metadata.userInput = value?.trim() || '';
    });
  }

  refreshCaptcha(): void {
    if (this.page?.isComplete) {
      this.alertService.warning('Locked Out', 'You cannot refresh the captcha after completing or exceeding the maximum attempts.');
      return;
    }

    this.captchaService.resetPages(PageType.Text);
    this.page = this.captchaService.getPage(PageType.Text);
    if (!this.captchaService.isTextCaptcha(this.page?.metadata)) {
      this.alertService.error('Refresh Error', 'Unable to refresh the captcha. Please try again.');
      return;
    }

    const newCaptchaCode = generateTextCaptcha();
    this.captcha.set(newCaptchaCode);
    this.page.metadata.captchaCode = newCaptchaCode;

    this.userInput.reset();
    drawTextCaptcha(this.canvas, this.captcha());
    this.alertService.info('Captcha Refreshed', 'A new captcha has been successfully generated.');
  }

  verify(): void {
    if (this.page?.isComplete) {
      this.alertService.warning('Locked Out', 'You have already complet or reached the maximum attempts. Proceed to the next challenge.');
      return;
    }

    if (!this.page) {
      this.alertService.error('Verification Error', 'Captcha page is not initialized. Please refresh the page.');
      return;
    }

    const userInputValue = this.userInput.value?.trim() || '';
    const isValid = this.captcha() === userInputValue;
    const maxAttempts = this.captchaService.getMaxAttempts();
    this.page.attempts += 1;
    
    if (!isValid) {
      this.handleFailedVerification(maxAttempts);
      return;
    }

    this.handleSuccessfulVerification();
  }

  private handleFailedVerification(maxAttempts: number): void {
    if (this.page) {

      if (this.page.attempts >= maxAttempts) {
        this.page.isComplete = true;
        this.page.metadata.isValid = false;
        this.alertService.warning(
          'Maximum Attempts Reached',
          'You have exceeded the maximum number of attempts. You can proceed to the next challenge or refresh this one.'
        );
        return;
      }

      this.userInput.reset()
      this.page.metadata.userInput = ''
      this.alertService.error('Verification Failed', 'Incorrect captcha code. Please try again.');
    }
  }

  private handleSuccessfulVerification(): void {
    if (this.page) {
      this.alertService.success('Verification Successful', 'The captcha code is correct. Click "Next" to continue.');
      this.page.isComplete = true;
      this.page.metadata.isValid = true;
      this.userInput.reset();
    }
  }
}
