import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
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
import { IParamsGetListProductCategory, IProductCategory, IStatusProductCategory } from '../shared/services/product-category/interfaces/product-category.interface';
import { ProductCategoryService } from '../shared/services/product-category/product-category.service';
import { PmProductCategoryAddEditComponent } from './add-edit/add-edit.component';
import { GetStatusByKeyPipe } from './pipes/get-status-by-key.pipe';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'bm-product-category',
  templateUrl: './product-category.component.html',
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
    GetStatusByKeyPipe
  ]
})
export class PmProductCategoryComponent implements OnInit {
  firstCall: boolean;
  loading: boolean;
  columnConfig: IColumnItem[];
  isOpenDrawAddEdit: boolean;
  drawerRefGlobal?: NzDrawerRef;
  onSearch: Subject<string> = new Subject();
  listProductCategory: IProductCategory[];
  totalProductCategory: number;
  params: IParamsGetListProductCategory;
  listStatusProductCategory: Array<IStatusProductCategory>;

  checked: boolean;
  showDelete: boolean;
  listOfCurrentPageData: readonly any[] = [];
  listOfData: readonly any[] = [];
  setOfCheckedId = new Set<string>();
  keyFetch: string;

  constructor(
    private drawerService: NzDrawerService,
    private nzMessageService: NzMessageService,
    private productCategoryService: ProductCategoryService,
    private authService: AuthService
  ) {
    this.firstCall = true;
    this.loading = false;
    this.totalProductCategory = 0;
    this.isOpenDrawAddEdit = false;
    this.columnConfig = [
      {
        name: 'Tên danh mục sản phẩm',
        width: '30%'
      },
      {
        name: 'Mô tả',
        width: '40%'
      },
      {
        name: 'Trạng thái',
        width: '20%'
      }
    ];
    this.listProductCategory = [];
    this.checked = false;
    this.showDelete = false;
    this.params = {
      page: 1,
      per_page: 20
    };
    this.listStatusProductCategory = [];
    this.keyFetch = uuid();
  }

  async ngOnInit(): Promise<void> {
    this.onSearch.pipe(debounceTime(1500), filter(value => value !== this.params.name)).subscribe((value) => {
      this.searchProductCategory(value);
    });
    this.getListStatus();
    this.getListProductCategory();
  }

  async getListStatus() {
    try {
      const result = await this.productCategoryService.getListStatusProductCategory();
      this.listStatusProductCategory.push(...result.data);
      this.keyFetch = uuid();
    } catch (error) {
      console.log(error);
    }
  }

  async getListProductCategory() {
    if (this.loading) {
      return;
    }
    try {
      this.loading = true;
      const result = await this.productCategoryService.getListProductCategory(this.params);
      this.totalProductCategory = result.paging.total_count;
      this.listProductCategory = result.data;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  searchProductCategory(value: string) {
    const text = value.trim();
    !text ? delete this.params.name : (this.params.name = text);
    this.listProductCategory = [];
    this.firstCall = true;
    this.getListProductCategory();
  }

  handlerAddProductCategory(event: Event) {
    event.stopPropagation();
    // if (!this.authService.checkPermission('/personnel', 'ADD_PERSONNEL')) {
    //   return;
    // }
    this.addOrEdit(undefined);
  }

  handlerEditProductCategory(event: Event, item: IProductCategory) {
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

  handlerDeleteProductCategory(event: Event) {
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

  addOrEdit(productCategory: IProductCategory | undefined) {
    if (this.isOpenDrawAddEdit) {
      return;
    }
    this.isOpenDrawAddEdit = true;
    this.drawerRefGlobal = this.drawerService.create<PmProductCategoryAddEditComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: productCategory ? '30vw' : '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: productCategory ? `Sửa thông tin danh mục sản phẩm` : 'Thêm danh mục sản phẩm',
      nzContent: PmProductCategoryAddEditComponent,
      nzContentParams: {
        productCategory: productCategory,
        listStatusProductCategory: this.listStatusProductCategory,
        modeEdit: productCategory ? true : false
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDrawAddEdit = true;
      this.drawerRefGlobal?.getContentComponent().saveSuccess.subscribe((data: IProductCategory) => {
        this.isOpenDrawAddEdit = false;
        this.drawerRefGlobal?.close();
        if (productCategory) {
          Object.assign(productCategory, data);
          return;
        }
        this.listProductCategory = [data, ...this.listProductCategory];
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
    this.getListProductCategory();
  }

  handlerKeyUp(event: any) {
    if (this.params.name === event.target.value) {
      return;
    }
    this.params.page = 1;
    if (event.key === 'Enter') {
      this.searchProductCategory(event.target.value);
      return;
    }
    this.onSearch.next(event.target.value);
  }

  async handlerDelete(productCategory: IProductCategory) {
    if (!productCategory.id) {
      return;
    }
    try {
      const result = await this.productCategoryService.deleteProductCategory([productCategory.id]);
      if (result.code === 200) {
        this.listProductCategory = this.listProductCategory.filter(item => item.id !== productCategory.id);
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    }
  }

}
