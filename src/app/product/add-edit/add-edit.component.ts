import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { PmIconsProviderModule } from '../../icon-ant/icons-provider.module';
import { convertFileToBase64 } from '../../shared/defines/function.define';
import { AuthService } from '../../shared/services/auth/auth.service';
import { IProductCategory } from '../../shared/services/product-category/interfaces/product-category.interface';
import { IProduct } from '../../shared/services/product/interfaces/product.interface';
import { ProductService } from '../../shared/services/product/product.service';

@Component({
  selector: 'pm-product-add_edit',
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
    NzSpinModule,
    JsonPipe
  ]
})
export class PmProductAddEditComponent implements OnInit {

  productForm!: FormGroup;
  loading?: boolean;
  image?: string;
  file?: File;
  show?: boolean;

  @Input() listProductCategory: Array<IProductCategory>;
  @Input() product?: IProduct;
  @Input() modeEdit?: boolean;

  @Output() saveSuccess = new EventEmitter<IProduct>();

  @ViewChild('elInputFile') inputFile!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private nzMessageService: NzMessageService,
    private authService: AuthService,
    private productService: ProductService
  ) {
    this.listProductCategory = [];
  }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: [this.product?.name ?? '', [Validators.required]],
      id_category: [this.product?.id_category ?? '', [Validators.required]],
      price: [this.product?.price ?? '', [Validators.required, Validators.pattern(/^\d+$/)]]
    });
    this.product?.image && (this.image = this.product.image);
  }

  handlerChangeAvatar() {
    this.inputFile.nativeElement.click();
  }

  async handlerChangeInputFile(event: any) {
    const url = await convertFileToBase64(event.target.files[0]);

    this.image = url as string;
    this.file = event.target.files[0];
  }

  handlerMouseEvent(show: boolean) {
    this.show = show;
  }

  async handlerUpdate(event: Event) {
    event.stopPropagation();
    // if (this.modeEdit && !this.authService.checkPermission('/personnel', 'EDIT_PERSONNEL')) {
    //   return;
    // }
    if (!this.productForm.valid) {
      Object.values(this.productForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;
    const body = {
      ...this.productForm.value
    }
    if (this.file) {
      body.image = this.file
    }
    try {
      const result = await (this.modeEdit ? this.productService.updateProduct(body, this.product?.id || '') : this.productService.createProduct(body));
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

