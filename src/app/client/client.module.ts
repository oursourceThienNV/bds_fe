import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientRoutingModule } from './client-routing.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './shared/header/header.component';
import { LeftSidebarComponent } from './shared/left-sidebar/left-sidebar.component';
import { RightSidebarComponent } from './shared/right-sidebar/right-sidebar.component';
import { UpdateUserComponent } from './user/update-user/update-user.component';
import { UserProfileComponent } from './user/user-profile/user-profile.component';
import { CreateOrUpdateCompanyComponent } from './company/create-or-update-company/create-or-update-company.component';
import { CompanyProfileComponent } from './company/company-profile/company-profile.component';
import { FranchiseComponent } from './franchise/franchise.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { PostDetailComponent } from './post/post-detail/post-detail.component';
import { QuestionComponent } from './question/question.component';

@NgModule({
  declarations: [
    HomeComponent,
    MarketplaceComponent,
    HeaderComponent,
    LeftSidebarComponent,
    RightSidebarComponent,
    UpdateUserComponent,
    UserProfileComponent,
    CreateOrUpdateCompanyComponent,
    CompanyProfileComponent,
    FranchiseComponent,
    PostDetailComponent,
    QuestionComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClientRoutingModule,
    CKEditorModule
  ]
})
export class ClientModule { }
