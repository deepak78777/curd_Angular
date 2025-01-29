import { Routes,RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { MainlayoutComponent } from './layout/mainlayout/mainlayout.component';
import { AuthlayoutComponent } from './layout/authlayout/authlayout.component';
import { AuthGuard } from './guards/auth.guard';
import { ElementsCurdComponent } from './pages/elements-curd/elements-curd.component';
import { LoginComponent } from './user/login/login.component';
import { EmployeeComponent } from './pages/employee/employee.component';
import { register } from 'module';
import { RegisterComponent } from './user/register/register.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    
    {
        path:'',
        component:MainlayoutComponent,
        children:[
            {
                path:'home',
                component:ElementsCurdComponent,
                canActivate:[AuthGuard]
            },
            {
                path:'employee',
                component:EmployeeComponent,
                // canActivate:[AuthGuard]
            }
        ]
        
    },
    {
        path:'',
        component:AuthlayoutComponent,
        children:[
            {
                path:'login',
                component:LoginComponent
            },
            {
                path:'register',
                component:RegisterComponent
            }
        ]
    },
    
    { path: '**', redirectTo: 'login' },
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })

  export class AppRoutingModule {}