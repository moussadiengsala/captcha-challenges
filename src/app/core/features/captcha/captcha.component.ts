import { afterRender, Component, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TextCaptchaComponent } from '../../../sheared/components/text-captcha/text-captcha.component';
import { MathCaptchaComponent } from '../../../sheared/components/math-captcha/math-captcha.component';
import { ImageCaptchaComponent } from '../../../sheared/components/image-captcha/image-captcha.component';
import { CaptchaService } from '../../services/captcha/captcha.service';
import { Page, PageType } from '../../../sheared/utils';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-captcha',
  imports: [ReactiveFormsModule, TextCaptchaComponent, MathCaptchaComponent, ImageCaptchaComponent, NgIf, CommonModule],
  templateUrl: './captcha.component.html',
  styleUrl: './captcha.component.css'
})

export class CaptchaComponent {

  constructor(public captchatService: CaptchaService) {
    afterRender(() => {
      console.log(this.captchatService);
    })
  }

  challenges = new FormGroup({})

  trackByFn(index: number, page: Page) { return page.id }
}
