import { NgModule } from '@angular/core';
import { NotFound404Component } from './common';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from 'ngx-clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderPipe } from './pipes/order-by.pipe';
import { InfiniteScrollerDirective, TestDirective } from './directives/';
import { LoadingOverlayComponent } from './common/loading-overlay/loading-overlay.component';
import { ErrorMessageComponent } from './common/error-message/error-message.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ToastyModule, ToastyConfig } from 'ng2-toasty';
import {
  ErrorMessageService,
  LoadingOverlayService,
} from './services';
import { BlockingNotificationOverlayComponent } from './common/blocking-notification-overlay/blocking-notification-overlay.component';
import { BlockingNotificationOverlayService } from './services';
import { EtherLogoComponent } from './common';

export function windowFactory() {
  return window;
}
@NgModule({
  imports: [
    CommonModule,
    ClipboardModule,
    BrowserAnimationsModule,
    FormsModule,
    NgbModule.forRoot(),
    PerfectScrollbarModule,
    ReactiveFormsModule,
    ToastyModule
  ],
  exports: [
    // COMPONENTS
    ErrorMessageComponent,
    EtherLogoComponent,
    InfiniteScrollerDirective,
    LoadingOverlayComponent,
    NotFound404Component,
    TestDirective,
    BlockingNotificationOverlayComponent,
    // MODULES
    CommonModule,
    ClipboardModule,
    FormsModule,
    NgbModule,
    PerfectScrollbarModule,
    ReactiveFormsModule,
    ToastyModule,
    // PIPES
    OrderPipe,
  ],
  declarations: [
    ErrorMessageComponent,
    EtherLogoComponent,
    InfiniteScrollerDirective,
    LoadingOverlayComponent,
    BlockingNotificationOverlayComponent,
    OrderPipe,
    NotFound404Component,
    TestDirective,
  ],
  providers: [
    { provide: 'Window', useFactory: windowFactory },
    ErrorMessageService,
    LoadingOverlayService,
    BlockingNotificationOverlayService,
  ]
})
export class SharedModule {
  constructor(private toastyConfig: ToastyConfig) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.timeout = 6000;
  }
}
