import { Injectable } from '@angular/core';
import { map, catchError, flatMap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
} from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.validarUsuario().pipe(
      flatMap(() => {
        if (!this.authService.usuario) {
          this.authService.recuperarUsuario().subscribe({
            next: (user) => {
              this.authService.usuario = user;
            }
          });
        }
        return of(true);
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.authService.afterLoginURI = state.url;
          window.location.href = this.authService.loginURI;
        }
        return of(false);
      })
    );
  }
}
