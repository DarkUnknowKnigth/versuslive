import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LiveComponent } from './live/live.component';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: 'live', component: LiveComponent},
  { path: 'admin', component: AdminComponent},
  { path: 'login', component: LoginComponent},
  {path: '**', pathMatch: 'full', redirectTo: '/live'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
