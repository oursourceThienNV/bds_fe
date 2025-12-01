import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {UsersComponent} from "./users/users.component";
import {MediaComponent} from "./image/media.component";
import {AuthGuard} from "../../core/guards/auth.guard";
import { DashboardComponent } from './dashboard/dashboard.component';
import { CompanyComponent } from './company/company.component';
import { GroupTeamComponent } from './group-team/group-team.component';
import { CustomerComponent } from './customer/customer.component';
import {CustomerAddComponent} from "./customer/customer-add.component";
import {CommonCodeComponent} from "./common-code/common-code.component";
import {WorkspaceComponent} from "./workspace/workspace.component";
import {WorkspaceFormComponent} from "./workspace/workspace-form.components";
import {TaskStatusComponent} from "./task-status/task-status.component";
import {TaskComponent} from "./task/task.component";
import {IssueDetailComponent} from "./task/issue-detail.component";
import {LicenseComponent} from "./license/license.component";
import {MapCustomerComponent} from "./map-customer/map-customer.component";
const routes: Routes = [
  {path: 'dashboard', component: DashboardComponent,canActivate: [AuthGuard]},
  {path: 'users', component: UsersComponent,canActivate: [AuthGuard]},
  {path: 'media', component: MediaComponent,canActivate: [AuthGuard]},
  {path: 'company', component: CompanyComponent,canActivate: [AuthGuard]},
  {path: 'group-team', component: GroupTeamComponent,canActivate: [AuthGuard]},
  {path: 'common-code', component: CommonCodeComponent,canActivate: [AuthGuard]},
  {path: 'khach-hang', component: CustomerComponent,canActivate: [AuthGuard]},
  {path: 'khach-hang/add', component: CustomerAddComponent,canActivate: [AuthGuard]},
  {path: 'khach-hang/add/:id', component: CustomerAddComponent,canActivate: [AuthGuard]},
  {path: 'khach-hang/detail/:id/:action', component: CustomerAddComponent,canActivate: [AuthGuard]},
  {path: 'khong-gian-lam-viec', component:WorkspaceComponent,canActivate: [AuthGuard]},
  {path: 'khong-gian-lam-viec/add', component:WorkspaceFormComponent,canActivate: [AuthGuard]},
  { path:'khong-gian-lam-viec/add/:id',component: WorkspaceFormComponent},
  { path:'trang-thai-cong-viec',component: TaskStatusComponent},
  { path:'cong-viec',component: TaskComponent},
  { path:'cong-viec-detail',component: IssueDetailComponent},
  {path:'license',component:LicenseComponent,canActivate: [AuthGuard]},
  {path:'map-customer',component:MapCustomerComponent,canActivate: [AuthGuard]},

];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoryRoutingModule {
}
