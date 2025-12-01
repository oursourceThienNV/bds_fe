import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';

import { SignupComponent } from './signup/signup.component';


const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'signup',
        component: SignupComponent
    },

    // {
    //     path: 'reset-password',
    //     component: PasswordresetComponent
    // },
    // {
    //     path: 'recoverpwd-2',
    //     component: Recoverpwd2Component
    // },
    // {
    //     path: 'login-2',
    //     component: Login2Component
    // }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule { }
