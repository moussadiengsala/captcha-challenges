import { Injectable } from '@angular/core';
import { Difficulty, Page, Pages, PageType, ResultCaptchaImage, ResultCaptchaMath, ResultCaptchaText } from '../../../sheared/utils';
import { AlertService } from '../alert/alert.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CaptchaService {
  private readonly MAX_ATTEMPTS = 3
  private static readonly STORAGE_KEY = 'captchaPages';
  private pages: Pages = this.loadFromStorage()
  constructor(private alertService: AlertService, private router: Router) { }

  getPages(): Page[] {
    return [...this.pages.pages]; 
  }

  getStep(): number {
    return this.pages.step
  }

  getMaxAttempts() { return this.MAX_ATTEMPTS; }

  getPage(pageType: PageType): Page | undefined {
    return this.pages.pages.find((p) => p.type === pageType);
  }

  resetPages(pageType: PageType): void {
    const currentPages = this.loadFromStorage();
    const defaultPages = this.getDefaultPages();
  
    // Filter and reset specific page type
    const updatedPages = currentPages.pages.map((page) => {
      if (page.type === pageType) {
        const defaultPage = defaultPages.pages.find((p) => p.type === pageType);
        return defaultPage ? { ...defaultPage } : page;
      }
      return page;
    });
  
    this.pages.pages = updatedPages;
    this.saveToStorage();
  }
  
  newSession() {
    this.pages = this.getDefaultPages();
    this.saveToStorage();
  }

  public saveToStorage(): void {
    localStorage.setItem(CaptchaService.STORAGE_KEY, JSON.stringify(this.pages));
  }

  private loadFromStorage(): Pages {
    const data = localStorage.getItem(CaptchaService.STORAGE_KEY);
    return data ? JSON.parse(data) : this.getDefaultPages();
  }

  private getDefaultPages(): Pages {
    return {
      pages: [
        {
          id: 'page-1',
          type: PageType.Text,
          index: 0,
          title: 'Text Captcha',
          isComplete: false,
          attempts: 0,
          metadata: {
            captchaCode: '',
            userInput: '',
            isValid: false,
          },
        },
        {
          id: 'page-2',
          type: PageType.Math,
          index: 1,
          title: 'Math Captcha',
          isComplete: false,
          attempts: 0,
          metadata: {
            problems: null,
            userInput: '',
            isValid: false,
            difficulty: Difficulty.Easy,
          },
        },
        {
          id: 'page-3',
          type: PageType.Image,
          index: 2,
          title: 'Image Captcha',
          isComplete: false,
          attempts: 0,
          metadata: {
            imageCptcha: null,
            userInput: null,
            isValid: false
          },
        },
      ],
      step: 1
    }
  }

  nextHandler() {
    this.alertService.clear();
    if (this.pages.step === 3) return;
    if (
      (this.pages.step === 1 && !this.getPage(PageType.Text)?.isComplete) ||
      (this.pages.step === 2 && !this.getPage(PageType.Math)?.isComplete)
    ) {
      this.alertService.warning('Incomplete Step', 'Please complete this step before moving forward.');
      return;
    }

    this.pages.step += 1
    this.saveToStorage()
  }

  prevHandler() {
    if (this.pages.step === 1) return;
    this.pages.step -= 1
  }

  dispaleSubmitButton(): boolean {
    return this.pages.step === 3 && this.getPages().every(page => page.isComplete)
  }

  handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!this.dispaleSubmitButton()) {
      this.alertService.error('Submission Blocked', 'Complete all steps before submitting the form.');
      return;
    }
    
    this.alertService.success('Form Submitted', 'Your form has been submitted successfully.');
    this.saveToStorage()
    this.router.navigate(['/results']);
  }

  public isTextCaptcha(metadata: any): metadata is ResultCaptchaText {
    return metadata && 'captchaCode' in metadata;
  }
  
  public isMathCaptcha(metadata: any): metadata is ResultCaptchaMath {
    return metadata && 'problems' in metadata;
  }
  
  public isImageCaptcha(metadata: any): metadata is ResultCaptchaImage {
    return metadata && 'imageCptcha' in metadata;
  }
  
}