import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { AuthModule } from './auth/auth.module';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@NgModule({
  declarations: [    ],
  imports: [
    CommonModule,
    AccountRoutingModule,
    AuthModule,
    ReactiveFormsModule,
    FormsModule,

  ]
})
export class AccountModule { }
