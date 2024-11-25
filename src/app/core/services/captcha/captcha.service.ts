import { Injectable } from '@angular/core';
import { Difficulty, Page, Pages, PageType, ResultCaptchaImage, ResultCaptchaMath, ResultCaptchaText } from '../../../sheared/utils';
import { AlertService } from '../alert/alert.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})



export class CaptchaService {
  private readonly MAX_ATTEMPTS = 3;
  private readonly STORAGE_KEY = 'captchaPages';
  private readonly EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes

  private pages: Pages;
  private attemptsMap: Map<string, number> = new Map();
  private pageMap: Map<string, Page> = new Map();

  constructor(
    private alertService: AlertService, 
    private router: Router
  ) {
    this.alertService.clear();
    this.pages = this.loadFromStorage();
    this.initializeAttemptsMap();
    this.initializepageMap()
  }

  private initializeAttemptsMap(): void {
    this.pages.pages.forEach(page => {
      this.attemptsMap.set(page.id, page.attempts);
    });
  }

  private initializepageMap(): void {
    this.pages.pages.forEach(page => {
      this.pageMap.set(page.id, page);
    });
  }

  public getPages(): Page[] {
    return [...this.pages.pages];
  }

  public getStep(): number {
    return this.pages.step;
  }

  public getMaxAttempts(): number {
    return this.MAX_ATTEMPTS;
  }

  public getPage(pageType: PageType): Page | undefined {
    return this.pages.pages.find((p) => p.type === pageType);
  }

  public getRemainingAttempts(pageId: string): number {
    const attempts = this.attemptsMap.get(pageId) || 0;
    return Math.max(0, this.MAX_ATTEMPTS - attempts);
  }

  public isPageLocked(pageId: string): boolean {
    const attempts = this.attemptsMap.get(pageId) || 0;
    const page = this.pageMap.get(pageId);
    return (attempts >= this.MAX_ATTEMPTS) || (!!page && page.metadata.isValid);
  }

  public resetPages(pageType: PageType): void {
    const currentPages = this.loadFromStorage();
    
    const updatedPages = currentPages.pages.map((page) => {
      if (page.type === pageType) {
        const defaultPage = this.pageMap.get(page.id);
        if (!defaultPage) return page;

        // Preserve the attempts count while resetting other metadata
        const currentAttempts = this.attemptsMap.get(page.id) || 0;
        return {
          ...defaultPage,
          attempts: currentAttempts,
          isComplete: currentAttempts >= 1
        }
      }
      return page;
    });

    this.pages.pages = updatedPages;
    this.saveToStorage();
  }

  public incrementAttempts(pageId: string): number {
    const currentAttempts = this.attemptsMap.get(pageId) || 0;
    const newAttempts = currentAttempts + 1;
    
    const page = this.pageMap.get(pageId);
    if (page) {
      this.attemptsMap.set(pageId, newAttempts);
      page.attempts = newAttempts;
      if (newAttempts >= 1) {
        page.isComplete = true;
      }
      this.saveToStorage();    
    }
    
    return newAttempts;
  }

  public newSession(): void {
    this.pages = this.getDefaultPages();
    this.attemptsMap.clear();
    this.initializeAttemptsMap();
    this.saveToStorage();
  }

  // Keep existing methods but update the storage to include attempts map
  private saveToStorage(): void {
    const attemptsObject = Object.fromEntries(this.attemptsMap);
    const dataToSave = {
      ...this.pages,
      attempts: attemptsObject,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      this.alertService.error(
        'Storage Error',
        'Failed to save progress. Please ensure cookies are enabled.'
      );
    }
  }

  private loadFromStorage(): Pages {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return this.getDefaultPages();

      const parsedData = JSON.parse(data);
      
      if (this.isStorageExpired(parsedData.timestamp)) {
        this.clearStorage();
        return this.getDefaultPages();
      }

      // Restore attempts map from storage
      if (parsedData.attempts) {
        this.attemptsMap = new Map(Object.entries(parsedData.attempts));
      }

      return parsedData;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return this.getDefaultPages();
    }
  }

  private isStorageExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.EXPIRY_TIME;
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // ... (keep other existing methods)

  private getDefaultPages(): Pages {
    return {
      pages: [
        {
          id: 'page-1',
          type: PageType.Text,
          index: 0,
          title: 'Text Verification',
          header: 'Please enter the text shown below',
          descriptions: 'Type the characters you see in the image. Letters are not case-sensitive.',
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
          title: 'Math Challenge',
          header: 'Solve this simple math problem',
          descriptions: 'Solve mathematical equation shown below. Enter only numbers as your answer.',
          isComplete: false,
          attempts: 0,
          metadata: {
            problems: null,
            userInput: '',
            isValid: false,
            difficulty: null,
          },
        },
        {
          id: 'page-3',
          type: PageType.Image,
          index: 2,
          title: 'Image Recognition',
          header: 'Select matching images',
          descriptions: 'Click or tap on all images that match the description. Click verify once you\'re done.',
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

  public nextHandler(): boolean {
    this.alertService.clear();
    
    if (this.pages.step >= 3) return false;
    
    const currentPage = this.getPage(
      this.pages.step === 1 ? PageType.Text : PageType.Math
    );

    if (!currentPage?.isComplete) {
      this.alertService.warning(
        'Incomplete Step', 
        'Please complete this step before moving forward.'
      );
      return false;
    }

    this.pages.step += 1;
    this.saveToStorage();
    return true;
  }

  public prevHandler(): boolean {
    if (this.pages.step === 1) return false;
    
    this.pages.step -= 1;
    return true;
  }

  public canSubmit(): boolean {
    return this.pages.step === 3 && 
           this.getPages().every(page => page.isComplete);
  }

  public handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!this.canSubmit()) {
      this.alertService.error(
        'Submission Blocked', 
        'Complete all steps before submitting the form.'
      );
      return;
    }

    try {
      
      this.alertService.success(
        'Form Submitted', 
        'Your form has been submitted successfully.'
      );
      this.saveToStorage();
      this.router.navigate(['/results']);
    } catch (error) {
      this.alertService.error(
        'Submission Failed',
        'An error occurred while submitting the form. Please try again.'
      );
    }
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
