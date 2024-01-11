import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
  selector: 'bm-not-found',
  standalone: true,
  imports: [NzResultModule, NzButtonModule],
  template: `
  <div class="w-100 h-100 d-flex align-items-center justify-content-center">
    <nz-result nzStatus="404" nzTitle="404" nzSubTitle="Xin lỗi, trang bạn đã truy cập không tồn tại.">
      <div nz-result-extra class="d-flex justify-content-center">
        <button nz-button nzType="primary" (click)="handlerBackHome($event)">Trang chủ</button>
      </div>
    </nz-result>
  </div>
  `
})
export class PmNotFoundComponent {

  private router = inject(Router);

  protected handlerBackHome(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/account']);
  }
}
