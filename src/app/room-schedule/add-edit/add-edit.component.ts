import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { differenceInCalendarDays } from 'date-fns';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { PmIconsProviderModule } from '../../icon-ant/icons-provider.module';
import { PmLibCardModule } from '../../shared/components/card/card.module';
import { AccountService } from '../../shared/services/account/account.service';
import { IAccount, IParamsGetListAccount } from '../../shared/services/account/interfaces/account.interface';
import { AuthService } from '../../shared/services/auth/auth.service';
import { IParamsGetListProduct, IProduct } from '../../shared/services/product/interfaces/product.interface';
import { ProductService } from '../../shared/services/product/product.service';
import { IBodyRoomSchedulePreOrder, IRoomSchedule } from '../../shared/services/room-schedule/interfaces/room-schedule.interface';
import { RoomScheduleService } from '../../shared/services/room-schedule/room-schedule.service';
import dayjs from 'dayjs';

@Component({
  selector: 'pm-room-schedule-add_edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
  standalone: true,
  imports: [
    NgIf, NgClass, DatePipe, NgFor,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzTableModule,
    PmIconsProviderModule,
    FormsModule,
    ReactiveFormsModule,
    PmLibCardModule,
    NzDrawerModule,
    NzNotificationModule,
    NzFormModule,
    NzSelectModule,
    NzInputNumberModule,
    NzToolTipModule,
    NzDatePickerModule,
    NzTagModule,
    NzSpinModule,
    NzSwitchModule,
  ]
})
export class PmRoomScheduleAddEditComponent implements OnInit {

  roomScheduleForm!: FormGroup;
  loading: boolean;

  totalRoom: number;
  listRoom: IProduct[];
  onSearchRoom: Subject<string> = new Subject();
  paramsGetRoom: IParamsGetListProduct;
  loadingRoom: boolean;
  firstCallRoom: boolean;

  rangeChange: boolean;
  durationChange: boolean;
  startTime?: Date;

  listAccount: IAccount[];
  totalAccount: number;
  onSearchAccount: Subject<string> = new Subject();
  paramsGetAccount: IParamsGetListAccount;
  loadingAccount: boolean;
  firstCallAccount: boolean;

  range(start: number, end: number): number[] {
    const result: number[] = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  disabledDate = (current: Date): boolean => differenceInCalendarDays(current, new Date()) < 0;

  @Output() saveSuccess = new EventEmitter<IRoomSchedule>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private roomScheduleService: RoomScheduleService,
    private nzMessageService: NzMessageService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NzNotificationService,
    private accountService: AccountService
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
    this.rangeChange = false;
    this.durationChange = false;

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
    this.initData();
    this.onSearchRoom.pipe(debounceTime(500), filter(value => value !== this.paramsGetRoom.name)).subscribe((value) => {
      this.searchRoom(value);
    });
    this.onSearchAccount.pipe(debounceTime(500), filter(value => value !== this.paramsGetAccount.name)).subscribe((value) => {
      this.searchAccount(value);
    });
    this.getListRoom();
    this.getListAccount();
  }

  initData() {
    this.roomScheduleForm = this.fb.group({
      id_account: ['', [Validators.required]],
      id_product: ['', [Validators.required]],
      rangeTime: [[], [Validators.required]]
    });
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

  async handlerSave(event: Event) {
    event.stopPropagation();
    if (!this.roomScheduleForm.valid) {
      Object.values(this.roomScheduleForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;
    const start = dayjs(this.roomScheduleForm.value.rangeTime[0]).format('DD/MM/YYYY');
    const end = dayjs(this.roomScheduleForm.value.rangeTime[1]).format('DD/MM/YYYY');

    delete this.roomScheduleForm.value.rangeTime;
    const body: IBodyRoomSchedulePreOrder = {
      ...this.roomScheduleForm.value,
      start: start,
      end: end
    }
    try {
      const result = await this.roomScheduleService.preOrderRoomSchedule(body);
      if (result.code === 200) {
        this.saveSuccess.emit(result.data);
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error(result.message || 'Thao tác không thành công.');
    } catch (error) {
      console.log(error);
      this.nzMessageService.error('Thao tác không thành công.');
    } finally {
      this.loading = false;
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
      const result = await this.accountService.getListAccount(this.paramsGetAccount);
      this.totalAccount = result.paging.total_count;
      this.listAccount.push(...result.data);
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

}
