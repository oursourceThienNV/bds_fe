import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UpdateUserComponent } from './user/update-user/update-user.component';
import { UserProfileComponent } from './user/user-profile/user-profile.component';
import { CreateOrUpdateCompanyComponent } from './company/create-or-update-company/create-or-update-company.component';
import { CompanyProfileComponent } from './company/company-profile/company-profile.component';
import { FranchiseComponent } from './franchise/franchise.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { PostDetailComponent } from './post/post-detail/post-detail.component';
import { QuestionComponent } from './question/question.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'question', component: QuestionComponent },
  { path: 'home', component: HomeComponent },
  { path: 'marketplace', component: MarketplaceComponent },
  { path: 'update-user', component: UpdateUserComponent },
  { path: 'user/:id', component: UserProfileComponent },
  { path: 'create-or-update-company', component: CreateOrUpdateCompanyComponent },
  { path: 'create-or-update-company/:id', component: CreateOrUpdateCompanyComponent },
  { path: 'company/:id', component: CompanyProfileComponent },
  { path: 'franchise', component: FranchiseComponent },
  { path: 'post/:id', component: PostDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
