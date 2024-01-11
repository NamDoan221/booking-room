import { AsyncPipe, DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule, NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { PmIconsProviderModule } from '../icon-ant/icons-provider.module';
import { IColumnItem } from '../shared/interfaces/table.interfaces';
import { AuthService } from '../shared/services/auth/auth.service';
import { IProductCategory } from '../shared/services/product-category/interfaces/product-category.interface';
import { ProductCategoryService } from '../shared/services/product-category/product-category.service';
import { IParamsGetListProduct, IProduct } from '../shared/services/product/interfaces/product.interface';
import { ProductService } from '../shared/services/product/product.service';
import { PmProductAddEditComponent } from './add-edit/add-edit.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { GetNameCategoryByIdPipe } from './pipes/get-name-category-by-id.pipe';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'bm-product',
  templateUrl: './product.component.html',
  standalone: true,
  imports: [
    NgIf, AsyncPipe, DatePipe, NgFor,
    NzInputModule,
    NzButtonModule,
    NzTableModule,
    PmIconsProviderModule,
    FormsModule,
    ReactiveFormsModule,
    NzDrawerModule,
    NzNotificationModule,
    NzFormModule,
    NzToolTipModule,
    NzTabsModule,
    NzSpinModule,
    NzPopconfirmModule,
    NzSelectModule,
    DecimalPipe,
    GetNameCategoryByIdPipe
  ]
})
export class PmProductComponent implements OnInit {
  firstCall: boolean;
  loading: boolean;
  columnConfig: IColumnItem[];
  isOpenDrawAddEdit: boolean;
  drawerRefGlobal?: NzDrawerRef;
  onSearch: Subject<string> = new Subject();
  listProduct: IProduct[];
  totalProduct: number;
  params: IParamsGetListProduct;
  listProductCategory: Array<IProductCategory>;
  productCategorySelect: Array<string>;
  keyFetch: string;

  checked: boolean;
  showDelete: boolean;
  listOfCurrentPageData: readonly any[] = [];
  listOfData: readonly any[] = [];
  setOfCheckedId = new Set<string>();

  constructor(
    private drawerService: NzDrawerService,
    private nzMessageService: NzMessageService,
    private productCategoryService: ProductCategoryService,
    private productService: ProductService,
    private authService: AuthService
  ) {
    this.firstCall = true;
    this.loading = false;
    this.totalProduct = 0;
    this.isOpenDrawAddEdit = false;
    this.columnConfig = [
      {
        name: 'Tên sản phẩm',
        width: '40%'
      },
      {
        name: 'Danh mục sản phẩm',
        width: '30%'
      },
      {
        name: 'Giá',
        width: '20%'
      }
    ];
    this.listProduct = [];
    this.checked = false;
    this.showDelete = false;
    this.params = {
      page: 1,
      per_page: 20
    };
    this.listProductCategory = [];
    this.productCategorySelect = [];
    this.keyFetch = uuid();
  }

  async ngOnInit(): Promise<void> {
    this.onSearch.pipe(debounceTime(1500), filter(value => value !== this.params.name)).subscribe((value) => {
      this.searchProduct(value);
    });
    this.getListProductCategory();
    this.getListProduct();
  }

  async getListProductCategory() {
    try {
      const result = await this.productCategoryService.getListProductCategory({ page: 1, per_page: 1000 });
      this.listProductCategory = result.data;
      this.keyFetch = uuid();
    } catch (error) {
      console.log(error);
    }
  }

  async getListProduct() {
    if (this.loading) {
      return;
    }
    try {
      this.loading = true;
      const result = await this.productService.getListProduct(this.params);
      this.totalProduct = result.paging.total_count;
      this.listProduct = result.data;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  searchProduct(value: string) {
    const text = value.trim();
    !text ? delete this.params.name : (this.params.name = text);
    this.listProduct = [];
    this.firstCall = true;
    this.getListProduct();
  }

  handlerAddProduct(event: Event) {
    event.stopPropagation();
    // if (!this.authService.checkPermission('/personnel', 'ADD_PERSONNEL')) {
    //   return;
    // }
    this.addOrEdit(undefined);
  }

  handlerEditProduct(event: Event, item: IProduct) {
    event.stopPropagation();
    this.addOrEdit(item);
  }

  updateCheckedSet(id: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
    if (this.setOfCheckedId.size > 0) {
      this.showDelete = true;
      return;
    }
    this.showDelete = false;
  }

  handlerDeleteProduct(event: Event) {
    event.stopPropagation();
    console.log(this.setOfCheckedId);
  }

  onItemChecked(id: string, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach(item => this.updateCheckedSet(item.id, value));
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange(event: readonly any[]): void {
    this.listOfCurrentPageData = event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every(item => this.setOfCheckedId.has(item.id));
  }

  addOrEdit(product: IProduct | undefined) {
    if (this.isOpenDrawAddEdit) {
      return;
    }
    this.isOpenDrawAddEdit = true;
    this.drawerRefGlobal = this.drawerService.create<PmProductAddEditComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: product ? '30vw' : '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: product ? `Sửa thông tin sản phẩm` : 'Thêm sản phẩm',
      nzContent: PmProductAddEditComponent,
      nzContentParams: {
        listProductCategory: this.listProductCategory,
        product: product,
        modeEdit: product ? true : false
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDrawAddEdit = true;
      this.drawerRefGlobal?.getContentComponent().saveSuccess.subscribe((data: IProduct) => {
        this.isOpenDrawAddEdit = false;
        this.drawerRefGlobal?.close();
        if (product) {
          Object.assign(product, data);
          return;
        }
        this.listProduct = [data, ...this.listProduct];
      });
    });

    this.drawerRefGlobal.afterClose.subscribe(data => {
      this.isOpenDrawAddEdit = false;
      this.drawerRefGlobal?.close();
    });
  }

  handlerQueryParamsChange(params: NzTableQueryParams): void {
    if (!params || this.firstCall) {
      this.firstCall = false;
      return;
    }
    this.params.page = params.pageIndex;
    this.getListProduct();
  }

  handlerKeyUp(event: any) {
    if (this.params.name === event.target.value) {
      return;
    }
    this.params.page = 1;
    if (event.key === 'Enter') {
      this.searchProduct(event.target.value);
      return;
    }
    this.onSearch.next(event.target.value);
  }

  async handlerDelete(product: IProduct) {
    if (!product.id) {
      return;
    }
    try {
      const result = await this.productService.deleteProduct([product.id]);
      if (result.code === 200) {
        this.listProduct = this.listProduct.filter(item => item.id !== product.id);
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    }
  }

  handlerChangeProductCategorySelected(event: string[]) {
    this.params.ids_category = event.join(',') || '';
    this.getListProduct();
  }

}
