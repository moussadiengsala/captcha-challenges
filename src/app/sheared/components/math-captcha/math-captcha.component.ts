import { Component, model, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Difficulty, generateMathProblem, Page, PageType, Problem } from '../../utils';
import { CommonModule } from '@angular/common';
import { CaptchaService } from '../../../core/services/captcha/captcha.service';
import { AlertService } from '../../../core/services/alert/alert.service';
import { AlertComponent } from '../alert/alert.component';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-math-captcha',
  imports: [ReactiveFormsModule, CommonModule, AlertComponent],
  templateUrl: './math-captcha.component.html',
  styleUrl: './math-captcha.component.css',
  animations: [
    trigger('numberChange', [
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
    trigger('shake', [
      state('invalid', style({ transform: 'translateX(0)' })),
      transition('* => invalid', [
        animate('100ms ease-in', style({ transform: 'translateX(-10px)' })),
        animate('100ms ease-out', style({ transform: 'translateX(10px)' })),
        animate('100ms ease-in', style({ transform: 'translateX(-10px)' })),
        animate('100ms ease-out', style({ transform: 'translateX(0)' }))
      ])
    ])
  ]
})

export class MathCaptchaComponent {
    problem: WritableSignal<Problem | null> = signal(null)
    userAnswer = new FormControl('');
    difficulty: WritableSignal<Difficulty> = signal(Difficulty.Easy)

    Difficulty = Difficulty;
    page?: Page

    constructor(private captchaService: CaptchaService, private alertService: AlertService) {
      this.alertService.clear()
    }

    ngOnInit(): void { 
      this.initializeCaptcha()
    }

    initializeCaptcha() {
      this.page = this.captchaService.getPage(PageType.Math)

      if (!this.page || !this.captchaService.isMathCaptcha(this.page?.metadata)) {
        this.alertService.error('Initialization Error', 'Failed to initialize the captcha. Please try again later.');
        return;
      }

      const difficulty = this.page?.metadata.difficulty ? this.page?.metadata.difficulty : this.difficulty();
      this.difficulty.set(difficulty)
      this.page.metadata.difficulty = difficulty

      const problemCaptcha = this.page?.metadata.problems || generateMathProblem(this.difficulty())
      this.problem.set(problemCaptcha)
      this.page.metadata.problems = problemCaptcha

      this.userAnswer.reset()
      const answer = this.page.metadata.userInput.trim() || ''
      this.userAnswer.setValue(answer)

      this.page.metadata.isValid = answer === problemCaptcha.answer.toString()

      if (this.captchaService.isPageLocked(this.page.id)) {
        this.alertService.warning('Locked Out', 'You have reached the maximum attempts or already complete this challenge. Proceed to the next challenge.');
        return;
      }
    }

    toggleDifficulty(difficulty: Difficulty) {
      if (!this.page) return;

      if (this.captchaService.isPageLocked(this.page.id)) {
        this.alertService.warning('Locked Out', 'You cannot refresh the captcha after reaching the maximum attempts or completing the task.');
        return;
      }

      this.difficulty.set(difficulty)

      this.captchaService.resetPages(PageType.Math);
      this.initializeCaptcha()

      const remainingAttempts = this.captchaService.getRemainingAttempts(this.page.id);
      this.alertService.info(
        'Captcha Refreshed', 
        `A new captcha has been generated. You have ${remainingAttempts} attempts remaining.`
      );
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

      const userInput = Number(this.userAnswer.value?.trim());

      // Validate the user input
      if (isNaN(userInput)) {
        this.alertService.error('Verification Error', 'Enter a valid number, please, and try again.');
        return;
      }

      // Safely access the problem and its answer
      const problem = this.problem();
      if (!problem || problem.answer == null) {
        this.page.metadata.isValid = false;
        this.alertService.error('Verification Error', 'There is no valid problem to verify against.');
        return;
      }

      this.page.metadata.userInput = this.userAnswer.value?.trim() || '';
      this.page.metadata.isValid = problem.answer === userInput;
      
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
  
      this.userAnswer.reset();
      this.page.metadata.userInput = '';
      this.alertService.error(
        'Verification Failed', 
        `Incorrect captcha code. You have ${remainingAttempts} attempts remaining.`
      );
    }
  
    private handleSuccessfulVerification(): void {
      if (!this.page) return;
      
      this.alertService.success('Verification Successful', 'The captcha code is correct. Click "Next" to continue.');
      this.userAnswer.reset();
    }
    
}
