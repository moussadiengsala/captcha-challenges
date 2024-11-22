import { Component, model, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Difficulty, generateMathProblem, Page, PageType, Problem } from '../../utils';
import { CommonModule } from '@angular/common';
import { CaptchaService } from '../../../core/services/captcha/captcha.service';
import { AlertService } from '../../../core/services/alert/alert.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-math-captcha',
  imports: [ReactiveFormsModule, CommonModule, AlertComponent],
  templateUrl: './math-captcha.component.html',
  styleUrl: './math-captcha.component.css'
})

export class MathCaptchaComponent {
    problem: WritableSignal<Problem | null> = signal(null)
    userAnswer = new FormControl('');
    difficulty: WritableSignal<Difficulty> = signal(Difficulty.Easy)

    Difficulty = Difficulty;
    page?: Page

    constructor(private captchaService: CaptchaService, private alertService: AlertService) {}

    ngOnInit(): void { 
      this.page = this.captchaService.getPage(PageType.Math)
      if (!this.captchaService.isMathCaptcha(this.page?.metadata)) {
        this.alertService.error('Initialization Error', 'Failed to initialize the captcha. Please try again later.');
        return;
      }

      this.difficulty.set(this.page?.metadata.difficulty || Difficulty.Easy)

      const problemCaptcha = this.page?.metadata.problems || generateMathProblem(this.difficulty())
      this.problem.set(problemCaptcha)
      this.page.metadata.problems = problemCaptcha

      this.userAnswer.setValue(this.page.metadata.userInput)

      this.userAnswer.valueChanges.subscribe((value) => {
        if (!this.captchaService.isMathCaptcha(this.page?.metadata)) {
          this.alertService.error('Error', 'Captcha validation failed. Please refresh the page.');
          return;
        }

        if (this.page.isComplete) return;

        this.page.metadata.userInput = value || '';
        this.page.metadata.isValid = value === this.problem()?.answer.toString();           
      })
    }

    changeDifficulty(difficulty: Difficulty) {
      if (this.page?.isComplete) {
        this.alertService.warning('Locked Out', 'You cannot change difficulty after completing or exceeding the maximum attempts.');
        return;
      }

      this.captchaService.resetPages(PageType.Math);
      this.page = this.captchaService.getPage(PageType.Text);
      if (!this.captchaService.isMathCaptcha(this.page?.metadata)) {
        this.alertService.error('Error', "Can't change the difficulty. Please refresh the page.");
        return;
      };

      this.difficulty.set(difficulty)
      this.page.metadata.difficulty = difficulty

      this.problem.set(generateMathProblem(this.difficulty()))
      this.page.metadata.problems = this.problem()

      this.userAnswer.reset()
      this.page.metadata.userInput = ''

      this.page.metadata.isValid = false
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
  
      const maxAttempts = this.captchaService.getMaxAttempts();
      this.page.attempts += 1;
  
      if (!this.page.metadata.isValid) {
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
  
        this.userAnswer.reset()
        this.page.metadata.userInput = ''
        this.alertService.error('Verification Failed', 'Incorrect captcha code. Please try again.');
      }
    }
  
    private handleSuccessfulVerification(): void {
      if (this.page) {
        this.alertService.success('Verification Successful', 'The captcha code is correct. Click "Next" to continue.');
        this.page.isComplete = true;
        this.page.metadata.isValid = true;
        this.userAnswer.reset();
      }
    }

    
}
