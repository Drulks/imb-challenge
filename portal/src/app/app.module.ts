import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CityInputComponent } from './components/city-input/city-input.component';
import { UserAddressFormComponent } from './components/user-address-form/user-address-form.component';
import { PetFormComponent } from './components/pet-form/pet-form.component';
import { PetListComponent } from './components/pet-list/pet-list.component';

@NgModule({
  declarations: [
    AppComponent,
    CityInputComponent,
    UserAddressFormComponent,
    PetFormComponent,
    PetListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
