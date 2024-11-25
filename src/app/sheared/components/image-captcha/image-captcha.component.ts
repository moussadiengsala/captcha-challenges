import { afterRender, Component, model, signal, WritableSignal } from '@angular/core';
import { ImageCaptcha, Page, PageType } from '../../utils';
import { FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { generateImageCaptcha } from '../../utils/generateImageCaptcha';
import { NgFor, NgIf } from '@angular/common';
import { CustomRadioComponent } from '../custom-radio/custom-radio.component';
import { CaptchaService } from '../../../core/services/captcha/captcha.service';
import { AlertService } from '../../../core/services/alert/alert.service';
import { AlertComponent } from '../alert/alert.component';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-image-captcha',
  imports: [ReactiveFormsModule, CustomRadioComponent, AlertComponent],
  templateUrl: './image-captcha.component.html',
  styleUrl: './image-captcha.component.css',
  animations: [
    trigger('message', [
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

export class ImageCaptchaComponent {

  challenge: WritableSignal<ImageCaptcha | null> = signal(null);
  userSelect = new FormArray<FormControl<string | null>>([]);
  page?: Page;

  constructor(
    private captchaService: CaptchaService, 
    private alertService: AlertService
  ) {
    this.alertService.clear();
  }

  ngOnInit(): void {
    this.initializeCaptcha();
  }

  private initializeCaptcha(): void {
    this.page = this.captchaService.getPage(PageType.Image);
    
    if (!this.page || !this.captchaService.isImageCaptcha(this.page?.metadata)) {
      this.alertService.error('Initialization Error', 'Failed to initialize the captcha. Please try again later.');
      return;
    }

    // Clear existing form controls
    this.userSelect.clear();

    // Use existing challenge or generate new one
    const challengeCaptcha = this.page?.metadata.imageCptcha || generateImageCaptcha();
    this.challenge.set(challengeCaptcha);
    this.page.metadata.imageCptcha = challengeCaptcha;

    // Restore previous selections or initialize new controls
    this.challenge()?.all.forEach((_, i) => {
      const previousValue = this.page?.metadata.userInput?.at(i) || null;
      this.userSelect.push(
        new FormControl<string | null>(previousValue, Validators.required)
      );
    });
  }

  refresh(): void {
    if (!this.page || !this.captchaService.isImageCaptcha(this.page?.metadata)) {
      this.alertService.error('Initialization Error', 'Failed to initialize the captcha. Please try again later.');
      return;
    }

    if (this.captchaService.isPageLocked(this.page.id)) {
      this.alertService.warning('Locked Out', 'You cannot refresh the captcha after reaching the maximum attempts.');
      return;
    }

    this.captchaService.resetPages(PageType.Image);
    this.initializeCaptcha()
    
    // Reset form controls
    this.userSelect.clear();
    this.page.metadata?.imageCptcha?.all.forEach(() => {
      this.userSelect.push(new FormControl<string | null>(null, Validators.required));
    });

    const remainingAttempts = this.captchaService.getRemainingAttempts(this.page.id);
    this.alertService.info(
      'Captcha Refreshed', 
      `A new image challenge has been generated. You have ${remainingAttempts} attempts remaining.`
    );
  }

  isValid(): boolean {
    if (!this.challenge() || !this.userSelect.value) return false;

    const correctSolution = this.challenge()!.solutions;
    const userSolution = this.userSelect.value;

    return correctSolution.every(
      (icon, index) => userSolution.includes(icon.id)
    );
  }

  verify(): void {
    if (!this.page || !this.captchaService.isImageCaptcha(this.page?.metadata)) {
      this.alertService.error('Verification Error', 'Captcha page is not initialized. Please try again later.');
      return;
    }

    if (this.captchaService.isPageLocked(this.page.id)) {
      this.alertService.warning('Locked Out', 'You have reached the maximum attempts. Proceed to the next challenge.');
      return;
    }

    // Check if form is completely filled
    if (this.userSelect.value.filter(v => v != null).length <= 0) {
      this.alertService.warning('Incomplete Selection', 'Please select all required images before verifying.');
      return;
    }

    // Increment attempts and check if valid
    this.page.metadata.isValid = this.isValid();
    this.page.metadata.userInput = this.userSelect.value
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

    // Reset selections on failure
    this.userSelect.controls.forEach(control => control.reset());
    if (this.captchaService.isImageCaptcha(this.page?.metadata)) {
      this.page.metadata.userInput = null;
    }

    this.alertService.error(
      'Verification Failed', 
      `Incorrect selection. You have ${remainingAttempts} attempts remaining.`
    );
  }

  private handleSuccessfulVerification(): void {
    if (!this.page) return;

    this.alertService.success(
      'Verification Successful', 
      'Your selections are correct. Click "Next" to continue.'
    );
  }
}