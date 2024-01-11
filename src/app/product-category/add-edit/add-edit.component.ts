import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { PmIconsProviderModule } from '../../icon-ant/icons-provider.module';
import { AuthService } from '../../shared/services/auth/auth.service';
import { IProductCategory, IStatusProductCategory } from '../../shared/services/product-category/interfaces/product-category.interface';
import { ProductCategoryService } from '../../shared/services/product-category/product-category.service';

@Component({
  selector: 'pm-product-category-add_edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
  standalone: true,
  imports: [
    NgIf, NgFor,
    FormsModule,
    ReactiveFormsModule,
    PmIconsProviderModule,
    NzInputModule,
    NzButtonModule,
    NzFormModule,
    NzSelectModule,
    NzSpinModule
  ]
})
export class PmProductCategoryAddEditComponent implements OnInit {

  productCategoryForm!: FormGroup;
  loading?: boolean;

  @Input() listStatusProductCategory: Array<IStatusProductCategory>;
  @Input() productCategory?: IProductCategory;
  @Input() modeEdit?: boolean;

  @Output() saveSuccess = new EventEmitter<IProductCategory>();

  constructor(
    private fb: FormBuilder,
    private nzMessageService: NzMessageService,
    private authService: AuthService,
    private productCategoryService: ProductCategoryService
  ) {
    this.listStatusProductCategory = [];
  }

  ngOnInit(): void {
    this.productCategoryForm = this.fb.group({
      name: [this.productCategory?.name ?? '', [Validators.required]],
      describe: [this.productCategory?.describe ?? ''],
      status: [this.productCategory?.status ?? '', [Validators.required]],
    });
  }

  async handlerUpdate(event: Event) {
    event.stopPropagation();
    // if (this.modeEdit && !this.authService.checkPermission('/personnel', 'EDIT_PERSONNEL')) {
    //   return;
    // }
    if (!this.productCategoryForm.valid) {
      Object.values(this.productCategoryForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;
    const body = {
      ...this.productCategoryForm.value
    }
    try {
      const result = await (this.modeEdit ? this.productCategoryService.updateProductCategory(body, this.productCategory?.id || '') : this.productCategoryService.createProductCategory(body));
      if (result.code === 200) {
        this.saveSuccess.emit(result.data);
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error(result.message || 'Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    } finally {
      this.loading = false;
    }
  }

}
