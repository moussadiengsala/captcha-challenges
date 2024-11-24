import { afterRender, Component, model, signal, WritableSignal } from '@angular/core';
import { ImageCaptcha, Page, PageType } from '../../utils';
import { FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { generateImageCaptcha } from '../../utils/generateImageCaptcha';
import { NgFor, NgIf } from '@angular/common';
import { CustomRadioComponent } from '../custom-radio/custom-radio.component';
import { CaptchaService } from '../../../core/services/captcha/captcha.service';
import { AlertService } from '../../../core/services/alert/alert.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-image-captcha',
  imports: [ReactiveFormsModule, CustomRadioComponent, AlertComponent],
  templateUrl: './image-captcha.component.html',
  styleUrl: './image-captcha.component.css'
})

export class ImageCaptchaComponent {
    challenge: WritableSignal<ImageCaptcha | null> = signal(null)
    userSelect = new FormArray<FormControl<string | null>>([])

    page?: Page

    constructor(private captchaService: CaptchaService, private alertService: AlertService) {
      this.alertService.clear()
      afterRender(() => {
        console.log(this.userSelect.value)
      }) 
    }

    initializeCaptcha(): void {
      this.page = this.captchaService.getPage(PageType.Image)
      if (!this.captchaService.isImageCaptcha(this.page?.metadata)) {
        this.alertService.error('Initialization Error', 'Failed to initialize the captcha. Please try again later.');
        return;
      };

      this.userSelect.clear();

      const challengeCaptcha = this.page?.metadata.imageCptcha || generateImageCaptcha()
      this.challenge.set(challengeCaptcha);
      this.page.metadata.imageCptcha = challengeCaptcha;
      
      // Add form controls for each option
      this.challenge()?.all.forEach((_, i) => {
        const value = this.page?.metadata.userInput?.at(i) || null
        return this.userSelect.push(
          new FormControl<string | null>(value, Validators.required)
        );
      });
      
    }

    ngOnInit(): void {
      this.initializeCaptcha();

      this.userSelect.valueChanges.subscribe(data => {
        if (!this.captchaService.isImageCaptcha(this.page?.metadata)) {
          this.alertService.error('Error', 'Captcha validation failed. Please refresh the page.');
          return;
        };

        if (this.page.isComplete) return;

        this.page.metadata.userInput = data || null;
        this.page.metadata.isValid = this.isValid()
      })
    }

    refresh() {
      if (this.page?.isComplete) {
        this.alertService.warning('Locked Out', 'You cannot refresh the captcha after completing or exceeding the maximum attempts.');
        return;
      }
  
      this.captchaService.resetPages(PageType.Image);
      this.initializeCaptcha()
    }

    isValid(): boolean {  
      // Get correct solution and user's selection
      const correctSolution = this.challenge()!.solutions;
      const userSolution = this.userSelect.value;
  
      // Check if all selections match the correct solution
      const isCorrect = correctSolution.every(
        (icon, index) => userSolution.includes(icon.id)
      );
  
      return isCorrect
    }

    verify(): void {
      if (!this.page) {
        this.alertService.error('Verification Error', 'Captcha page is not initialized. Please refresh the page.');
        return;
      }
  
      const maxAttempts = this.captchaService.getMaxAttempts();
      this.page.attempts += 1;
  
      if (!this.isValid()) {
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

        this.alertService.error('Verification Failed', 'Incorrect captcha code. Please try again.');
      }
    }
  
    private handleSuccessfulVerification(): void {
      if (this.page) {
        this.alertService.success('Verification Successful', 'The captcha code is correct. Click "Next" to continue.');
        this.page.isComplete = true;
        this.page.metadata.isValid = true;
      }
    }
}
