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
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { Subject } from 'rxjs';
import { PmIconsProviderModule } from '../icon-ant/icons-provider.module';
import { AuthService } from '../shared/services/auth/auth.service';
import { ISalaryConfig } from '../shared/services/salary-config/interfaces/salary-config.interface';
import { SalaryConfigService } from '../shared/services/salary-config/salary-config.service';
import { IParamsGetListTeam } from '../shared/services/team/interfaces/team.interface';
import { PmSalaryConfigAddEditComponent } from './add-edit/add-edit.component';

@Component({
  selector: 'bm-salary-config',
  templateUrl: './salary-config.component.html',
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
    DecimalPipe
  ]
})
export class PmSalaryConfigComponent implements OnInit {
  loading: boolean;
  isOpenDrawAddEdit: boolean;
  drawerRefGlobal?: NzDrawerRef;
  onSearch: Subject<string> = new Subject();
  listSalaryConfig: ISalaryConfig[];
  totalSalaryConfig: number;
  params: IParamsGetListTeam;

  checked: boolean;
  showDelete: boolean;
  listOfCurrentPageData: readonly any[] = [];
  listOfData: readonly any[] = [];
  setOfCheckedId = new Set<string>();

  constructor(
    private drawerService: NzDrawerService,
    private nzMessageService: NzMessageService,
    private salaryConfigService: SalaryConfigService,
    private authService: AuthService
  ) {
    this.loading = false;
    this.totalSalaryConfig = 0;
    this.isOpenDrawAddEdit = false;
    this.listSalaryConfig = [];
    this.checked = false;
    this.showDelete = false;
    this.params = {
      page: 1,
      per_page: 100
    };
  }

  async ngOnInit(): Promise<void> {
    this.getListSalaryConfig();
  }

  async getListSalaryConfig() {
    if (this.loading) {
      return;
    }
    try {
      this.loading = true;
      const result = await this.salaryConfigService.getListSalary(this.params);
      this.totalSalaryConfig = result.paging.total_count;
      this.listSalaryConfig = result.data;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  handlerAddSalaryConfig(event: Event) {
    event.stopPropagation();
    // if (!this.authService.checkPermission('/personnel', 'ADD_PERSONNEL')) {
    //   return;
    // }
    this.addOrEdit(undefined);
  }

  handlerEditSalaryConfig(event: Event, item: ISalaryConfig) {
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

  handlerDeleteTeam(event: Event) {
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

  addOrEdit(salaryConfig: ISalaryConfig | undefined) {
    if (this.isOpenDrawAddEdit) {
      return;
    }
    this.isOpenDrawAddEdit = true;
    this.drawerRefGlobal = this.drawerService.create<PmSalaryConfigAddEditComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: salaryConfig ? '30vw' : '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: salaryConfig ? `Sửa cấu hình lương` : 'Cấu hình lương',
      nzContent: PmSalaryConfigAddEditComponent,
      nzContentParams: {
        listSalaryConfig: this.listSalaryConfig,
        salaryConfig: salaryConfig,
        modeEdit: salaryConfig ? true : false
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDrawAddEdit = true;
      this.drawerRefGlobal?.getContentComponent().saveSuccess.subscribe((data: ISalaryConfig) => {
        this.isOpenDrawAddEdit = false;
        this.drawerRefGlobal?.close();
        if (salaryConfig) {
          salaryConfig.wage = data.wage;
          return;
        }
        this.listSalaryConfig = [data, ...this.listSalaryConfig];
      });
    });

    this.drawerRefGlobal.afterClose.subscribe(data => {
      this.isOpenDrawAddEdit = false;
      this.drawerRefGlobal?.close();
    });
  }

  async handlerDelete(id: string) {
    try {
      const result = await this.salaryConfigService.deleteSalaryConfig([id]);
      if (result.code === 200) {
        this.listSalaryConfig = this.listSalaryConfig.filter(item => item.account_id !== id);
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    }
  }

}
