import { Component } from '@angular/core';
import { CaptchaService } from '../../services/captcha/captcha.service';
import { Page, Pages, PageType, ResultCaptchaImage, ResultCaptchaMath, ResultCaptchaText } from '../../../sheared/utils';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-result',
  imports: [NgFor, NgClass, NgSwitch, NgSwitchCase, NgIf, NgSwitchDefault],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent {
  results: Page[] = []

  constructor(public captchaService: CaptchaService, private router: Router) {
    this.results = this.captchaService.getPages();
    if (this.getCompletedCount() != 3) {
      this.router.navigate(['/challenges']);
      return;
    }
  }

  getIconClass(type: PageType): string {
    switch(type) {
      case PageType.Text: return 'fa-font';
      case PageType.Math: return 'fa-calculator';
      case PageType.Image: return 'fa-image';
      default: return 'fa-check';
    }
  }

  getPageTitle(page: Page): string {
    switch(page.type) {
      case PageType.Text: return page.title || 'Text Verification';
      case PageType.Math: return page.title || 'Math Challenge';
      case PageType.Image: return page.title || 'Image Selection';
      default: return page.title || 'Verification';
    }
  }

  getCompletedCount(): number {
    return this.results.filter(page => page.isComplete).length;
  }

  getTotalAttempts(): number {
    return this.results.reduce((total, page) => total + page.attempts, 0);
  }

  isPageValid(page: Page): boolean {
    switch(page.type) {
      case PageType.Text:
        return (page.metadata as ResultCaptchaText).isValid;
      case PageType.Math:
        return (page.metadata as ResultCaptchaMath).isValid;
      case PageType.Image:
        return (page.metadata as ResultCaptchaImage).isValid;
      default:
        return false;
    }
  }

  getImageChallengeResult(metadata: ResultCaptchaImage | null) {
    if (!metadata) return [];
    const solution  = metadata.imageCptcha?.solutions.map(icon => icon.id)
    const selected = metadata.userInput?.filter(id => id != null)
    return metadata.imageCptcha?.all.map(d => ({
      icon: d.icon,
      name: d.name,
      isCorrect: solution?.includes(d.id),
      isSelected: selected?.includes(d.id),
    }))
  }

  getNewSession() {
    this.captchaService.newSession();
    this.results = this.captchaService.getPages();
    this.router.navigate(['/challenges']);
  }

  getTextCaptchaMetadata(page: Page): ResultCaptchaText | null {
    return page.type === PageType.Text ? (page.metadata as ResultCaptchaText) : null;
  }
  
  getMathCaptchaMetadata(page: Page): ResultCaptchaMath | null {
    return page.type === PageType.Math ? (page.metadata as ResultCaptchaMath) : null;
  }
  
  getImageCaptchaMetadata(page: Page): ResultCaptchaImage | null {
    return page.type === PageType.Image ? (page.metadata as ResultCaptchaImage) : null;
  }
  
}
