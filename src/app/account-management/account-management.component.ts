import { Component, OnInit } from '@angular/core';
import { NzDrawerModule, NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTabChangeEvent, NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { PmIconsProviderModule } from '../icon-ant/icons-provider.module';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { isNil } from 'ng-zorro-antd/core/util';
import { TabsDefault } from '../shared/defines/tab.define';
import { ITab } from '../shared/interfaces/tab.interface';
import { IColumnItem } from '../shared/interfaces/table.interfaces';
import { AccountService } from '../shared/services/account/account.service';
import { IAccount, IParamsGetListAccount } from '../shared/services/account/interfaces/account.interface';
import { AuthService } from '../shared/services/auth/auth.service';
import { PmAccountAddEditComponent } from './add-edit/add-edit.component';

@Component({
  selector: 'bm-account-management',
  templateUrl: './account-management.component.html',
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
    NzPopconfirmModule
  ]
})
export class PmAccountManagementComponent implements OnInit {
  firstCall: boolean;
  loading: boolean;
  columnConfig: IColumnItem[];
  isOpenDrawAddEdit: boolean;
  drawerRefGlobal?: NzDrawerRef;
  onSearch: Subject<string> = new Subject();
  listAccount: IAccount[];
  totalAccount: number;
  params: IParamsGetListAccount;

  tabs: ITab[];
  selectedTab: number;

  checked: boolean;
  showDelete: boolean;
  listOfCurrentPageData: readonly any[] = [];
  listOfData: readonly any[] = [];
  setOfCheckedId = new Set<string>();

  constructor(
    private drawerService: NzDrawerService,
    private nzMessageService: NzMessageService,
    private accountService: AccountService,
    private authService: AuthService
  ) {
    this.firstCall = true;
    this.loading = false;
    this.totalAccount = 0;
    this.isOpenDrawAddEdit = false;
    this.columnConfig = [
      {
        name: 'Họ và tên',
        width: '25%'
      },
      {
        name: 'Tên tài khoản',
        width: '15%'
      },
      {
        name: 'Số điện thoại',
        width: '15%'
      },
      {
        name: 'Email',
        width: '20%'
      },
      {
        name: 'Quyền quản trị viên',
        width: '15%'
      }
    ];
    this.listAccount = [];
    this.checked = false;
    this.showDelete = false;
    this.params = {
      page: 1,
      per_page: 20,
      // status: 'onl'
    };
    this.selectedTab = 0;
    this.tabs = TabsDefault();
  }

  async ngOnInit(): Promise<void> {
    this.onSearch.pipe(debounceTime(1500), filter(value => value !== this.params.name)).subscribe((value) => {
      this.searchAccount(value);
    });
    this.getListAccount();
  }

  async getListAccount() {
    if (this.loading) {
      return;
    }
    try {
      this.loading = true;
      const result = await this.accountService.getListAccount(this.params);
      this.totalAccount = result.paging.total_count;
      this.listAccount = result.data;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  searchAccount(value: string) {
    const text = value.trim();
    !text ? delete this.params.name : (this.params.name = text);
    this.listAccount = [];
    this.firstCall = true;
    this.getListAccount();
  }

  handlerAddAccount(event: Event) {
    event.stopPropagation();
    // if (!this.authService.checkPermission('/personnel', 'ADD_PERSONNEL')) {
    //   return;
    // }
    this.addOrEdit(undefined);
  }

  handlerEditAccount(event: Event, item: IAccount) {
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

  handlerDeleteAccount(event: Event) {
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

  addOrEdit(account: IAccount | undefined) {
    if (this.isOpenDrawAddEdit) {
      return;
    }
    this.isOpenDrawAddEdit = true;
    this.drawerRefGlobal = this.drawerService.create<PmAccountAddEditComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: account ? '30vw' : '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: account ? `Sửa thông tin tài khoản` : 'Thêm tài khoản',
      nzContent: PmAccountAddEditComponent,
      nzContentParams: {
        account: account,
        modeEdit: account ? true : false
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDrawAddEdit = true;
      this.drawerRefGlobal?.getContentComponent().saveSuccess.subscribe((data: IAccount) => {
        this.isOpenDrawAddEdit = false;
        this.drawerRefGlobal?.close();
        if (account) {
          Object.assign(account, data);
          return;
        }
        this.listAccount = [data, ...this.listAccount];
        this.totalAccount = this.listAccount.length;
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
    this.getListAccount();
  }

  handlerKeyUp(event: any) {
    if (this.params.name === event.target.value) {
      return;
    }
    this.params.page = 1;
    if (event.key === 'Enter') {
      this.searchAccount(event.target.value);
      return;
    }
    this.onSearch.next(event.target.value);
  }

  handlerTabChange(event: NzTabChangeEvent) {
    if (isNil(event.index)) {
      return;
    }
    this.selectedTab = event.index;
    this.params.status = event.index === 0 ? 'onl' : 'of';
    this.firstCall = true;
    this.getListAccount();
  }

  async handlerDelete(account: IAccount) {
    try {
      const result = await this.accountService.deleteAccount([account.id]);
      if (result.code === 200) {
        this.listAccount = this.listAccount.filter(item => item.id !== account.id);
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    }
  }

}
