import { Routes } from '@angular/router';
import { ResultComponent } from './core/features/result/result.component';
import { CaptchaComponent } from './core/features/captcha/captcha.component';
import { HomeComponent } from './core/features/home/home.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'results', component: ResultComponent},
    {path: 'challenges', component: CaptchaComponent}
];
