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
import { PmIconsProviderModule } from '../icon-ant/icons-provider.module';
import { IColumnItem } from '../shared/interfaces/table.interfaces';
import { AuthService } from '../shared/services/auth/auth.service';
import { ITask } from '../shared/services/task/interfaces/task.interface';
import { TaskService } from '../shared/services/task/task.service';
import { PmTaskAddEditComponent } from './add-edit/add-edit.component';

@Component({
  selector: 'bm-task',
  templateUrl: './task.component.html',
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
export class PmTaskComponent implements OnInit {
  firstCall: boolean;
  loading: boolean;
  columnConfig: IColumnItem[];
  isOpenDrawAddEdit: boolean;
  drawerRefGlobal?: NzDrawerRef;
  onSearch: Subject<string> = new Subject();
  listTask: ITask[];
  totalTask: number;
  role: string;

  constructor(
    private drawerService: NzDrawerService,
    private nzMessageService: NzMessageService,
    private taskService: TaskService,
    private authService: AuthService
  ) {
    this.firstCall = true;
    this.loading = false;
    this.totalTask = 0;
    this.isOpenDrawAddEdit = false;
    this.columnConfig = [
      {
        name: 'Nhân viên',
        width: '25%'
      },
      {
        name: 'Phòng',
        width: '25%'
      },
      {
        name: 'Mô tả công việc',
        width: '25%'
      },
      {
        name: 'Trạng thái',
        width: '10%'
      }
    ];
    this.listTask = [];
    this.role = this.authService.decodeToken()?.role || 'user';
  }

  async ngOnInit(): Promise<void> {
    this.getListTask();
  }

  async getListTask() {
    if (this.loading) {
      return;
    }
    try {
      this.loading = true;
      const result = await (this.role === 'user' ? this.taskService.getListUserTask() : this.taskService.getListTask());
      this.totalTask = result.paging.total_count;
      this.listTask = result.data;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  handlerAddTask(event: Event) {
    event.stopPropagation();
    // if (!this.authService.checkPermission('/personnel', 'ADD_PERSONNEL')) {
    //   return;
    // }
    this.addOrEdit();
  }

  addOrEdit() {
    if (this.isOpenDrawAddEdit) {
      return;
    }
    this.isOpenDrawAddEdit = true;
    this.drawerRefGlobal = this.drawerService.create<PmTaskAddEditComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: 'Thêm công việc',
      nzContent: PmTaskAddEditComponent,
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDrawAddEdit = true;
      this.drawerRefGlobal?.getContentComponent().saveSuccess.subscribe((data: ITask) => {
        this.isOpenDrawAddEdit = false;
        this.drawerRefGlobal?.close();
        this.listTask = [data, ...this.listTask];
        this.totalTask = this.listTask.length;
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
    // this.params.page = params.pageIndex;
    // this.getListAccount();
  }

  async handlerUpdate(task: ITask) {
    try {
      const result = await this.taskService.updateTask(task.id);
      if (result.code === 200) {
        task.status = 'done';
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    }
  }

}
