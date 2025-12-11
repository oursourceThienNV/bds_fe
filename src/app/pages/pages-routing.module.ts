import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "../core/guards/auth.guard";


const routes: Routes = [
  // { path: '', redirectTo: 'dashboard' },
  { path: '', loadChildren: () => import('../client/client.module').then(m => m.ClientModule), canActivate: [AuthGuard] },
  { path: 'category', loadChildren: () => import('./category/category.module').then(m => m.CategoryModule), canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
