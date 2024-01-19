import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Subject, debounceTime, filter } from 'rxjs';
import { PmIconsProviderModule } from '../../icon-ant/icons-provider.module';
import { AccountService } from '../../shared/services/account/account.service';
import { IAccount, IParamsGetListAccount } from '../../shared/services/account/interfaces/account.interface';
import { AuthService } from '../../shared/services/auth/auth.service';
import { IParamsGetListProduct, IProduct } from '../../shared/services/product/interfaces/product.interface';
import { RoomScheduleService } from '../../shared/services/room-schedule/room-schedule.service';
import { ITask } from '../../shared/services/task/interfaces/task.interface';
import { TaskService } from '../../shared/services/task/task.service';

@Component({
  selector: 'pm-task-add_edit',
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
export class PmTaskAddEditComponent implements OnInit {

  taskForm!: FormGroup;
  loading?: boolean;

  totalRoom: number;
  listRoom: IProduct[];
  onSearchRoom: Subject<string> = new Subject();
  paramsGetRoom: IParamsGetListProduct;
  loadingRoom: boolean;
  firstCallRoom: boolean;

  listAccount: IAccount[];
  totalAccount: number;
  onSearchAccount: Subject<string> = new Subject();
  paramsGetAccount: IParamsGetListAccount;
  loadingAccount: boolean;
  firstCallAccount: boolean;

  @Output() saveSuccess = new EventEmitter<ITask>();

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private nzMessageService: NzMessageService,
    private authService: AuthService,
    private taskService: TaskService,
    private roomScheduleService: RoomScheduleService,
  ) {
    this.loading = false;
    this.listRoom = [];
    this.paramsGetRoom = {
      page: 1,
      per_page: 100,
      name: ''
    }
    this.totalRoom = 0;
    this.loadingRoom = true;
    this.firstCallRoom = true;

    this.totalAccount = 0;
    this.listAccount = [];
    this.paramsGetAccount = {
      page: 1,
      per_page: 100,
      name: ''
    }
    this.loadingAccount = true;
    this.firstCallAccount = true;
  }

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      account_id: ['', [Validators.required]],
      product_id: ['', [Validators.required]],
      describe: ['', [Validators.required]]
    });
    this.onSearchRoom.pipe(debounceTime(500), filter(value => value !== this.paramsGetRoom.name)).subscribe((value: string) => {
      this.searchRoom(value);
    });
    this.onSearchAccount.pipe(debounceTime(500), filter(value => value !== this.paramsGetAccount.name)).subscribe((value: string) => {
      this.searchAccount(value);
    });
    this.getListRoom();
    this.getListAccount();
  }

  handlerSearchRoom(event: string) {
    this.paramsGetRoom.page = 1;
    this.onSearchRoom.next(event);
  }

  handlerScrollBottomRoom() {
    if (this.loadingRoom || !this.totalRoom || this.totalRoom <= this.listRoom.length) {
      return;
    }
    this.paramsGetRoom.page += 1;
    this.getListRoom();
  }

  searchRoom(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetRoom.name : (this.paramsGetRoom.name = text);
    this.listRoom = [];
    this.getListRoom();
  }

  async getListRoom() {
    if (this.loadingRoom && !this.firstCallRoom) {
      return;
    }
    this.firstCallRoom = false;
    try {
      this.loadingRoom = true;
      const result = await this.roomScheduleService.getListRoom();
      this.totalRoom = result.paging.total_count;
      this.listRoom.push(...result.data);
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingRoom = false;
    }
  }

  handlerSearchAccount(event: string) {
    this.paramsGetAccount.page = 1;
    this.onSearchAccount.next(event);
  }

  handlerScrollAccount(event: any) {
    if (event.target.scrollTop < (event.target.scrollHeight - event.target.offsetHeight - 30) || this.loadingAccount || !this.totalAccount || this.totalAccount <= this.listAccount.length) {
      return;
    }
    this.paramsGetAccount.page += 1;
    this.getListAccount();
  }

  searchAccount(value: string) {
    const text = value.trim();
    !text ? delete this.paramsGetAccount.name : (this.paramsGetAccount.name = text);
    this.listAccount = [];
    this.getListAccount();
  }

  async getListAccount() {
    if (this.loadingAccount && !this.firstCallAccount) {
      return;
    }
    this.firstCallAccount = false;
    try {
      this.loadingAccount = true;
      const result = await this.accountService.getListAccountNotClient();
      this.listAccount.push(...result.data);
      this.totalAccount = this.listAccount.length;
    } catch (error) {
      console.log(error);
    } finally {
      this.loadingAccount = false;
    }
  }

  handlerKeyUp(event: any) {
    if (this.paramsGetAccount.name === event.target.value) {
      return;
    }
    this.paramsGetAccount.page = 1;
    if (event.key === 'Enter') {
      this.searchAccount(event.target.value);
      return;
    }
    this.onSearchAccount.next(event.target.value);
  }

  async handlerUpdate(event: Event) {
    event.stopPropagation();
    // if (this.modeEdit && !this.authService.checkPermission('/personnel', 'EDIT_PERSONNEL')) {
    //   return;
    // }
    if (!this.taskForm.valid) {
      Object.values(this.taskForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;
    const body = {
      ...this.taskForm.value
    }
    try {
      const result = await this.taskService.createTask(body);
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
