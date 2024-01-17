import { DatePipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import dayjs from 'dayjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDrawerModule, NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { PmIconsProviderModule } from '../icon-ant/icons-provider.module';
import { PmLibCardModule } from '../shared/components/card/card.module';
import { AccountService } from '../shared/services/account/account.service';
import { AuthService } from '../shared/services/auth/auth.service';
import { IParamsGetListRoomSchedule, IRoomSchedule } from '../shared/services/room-schedule/interfaces/room-schedule.interface';
import { RoomScheduleService } from '../shared/services/room-schedule/room-schedule.service';
import { PmRoomScheduleAddEditComponent } from './add-edit/add-edit.component';
import duration from 'dayjs/plugin/duration';
import isoWeek from 'dayjs/plugin/isoWeek';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import { PmRoomScheduleCheckOutComponent } from './check-out/check-out.component';

dayjs.extend(relativeTime)
dayjs.extend(isoWeek)
dayjs.extend(utc);
dayjs.extend(duration);
dayjs.extend(quarterOfYear)

@Component({
  selector: 'pm-room-schedule',
  templateUrl: './room-schedule.component.html',
  styleUrls: ['./room-schedule.component.scss'],
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
    NzSegmentedModule,
    NzCheckboxModule,
    DecimalPipe
  ]
})
export class PmRoomScheduleComponent implements OnInit {

  columnConfig: string[];
  isOpenDrawAddEdit: boolean;
  isOpenDrawAddPersonnel: boolean;
  isOpenDrawAttendance: boolean;
  drawerRefGlobal!: NzDrawerRef;
  options: string[];
  selectedFilterTimeIndex: number;

  loading: boolean;
  total: number;
  listRoomSchedule: IRoomSchedule[];
  firstCall: boolean;
  params: IParamsGetListRoomSchedule;
  onSearch: Subject<string> = new Subject();
  defaultFilterTime: string[];
  dataView: { key: string, label: string }[];
  dataViewSelected: string;

  keyFetch: string;

  constructor(
    private drawerService: NzDrawerService,
    private roomScheduleService: RoomScheduleService,
    private accountService: AccountService,
    private authService: AuthService,
    private nzMessageService: NzMessageService
  ) {
    this.loading = false;
    this.total = 0;
    this.listRoomSchedule = [];
    this.isOpenDrawAddEdit = false;
    this.isOpenDrawAddPersonnel = false;
    this.isOpenDrawAttendance = false;
    this.columnConfig = [
      'Tên phòng',
      'Loại phòng',
      'Thời gian đặt phòng',
      'Thời gian nhận phòng',
      'Thời gian trả phòng',
      'Người đặt phòng',
      'Trạng thái',
      'Đã thanh toán'
    ];
    this.defaultFilterTime = [dayjs().startOf('month').format('DD/MM/YYYY'), dayjs().endOf('month').format('DD/MM/YYYY')];
    this.params = {
      page: 1,
      per_page: 20,
      start: this.defaultFilterTime[0],
      end: this.defaultFilterTime[1],
      name: ''
    };
    this.firstCall = true;
    this.options = ['Ngày', 'Tuần', 'Tháng', 'Quý', 'Năm', 'Tự chọn'];
    this.selectedFilterTimeIndex = 2;
    this.keyFetch = '';
    this.dataView = [{
      key: 'pre_order',
      label: 'Đặt trước'
    },
    {
      key: 'check_in',
      label: 'Đã nhận phòng'
    },
    {
      key: 'check_out',
      label: 'Đã trả phòng'
    }];
    this.dataViewSelected = '';
  }

  ngOnInit(): void {
    this.onSearch.pipe(debounceTime(1500), filter(value => value !== this.params.name)).subscribe((value) => {
      this.searchRoomSchedule(value);
    });
    this.getListRoomSchedule();
  }

  handleFilterTimeChange(e: number) {
    let timeKey: any = 'day';
    switch (e) {
      case 0:
        timeKey = 'day';
        break;
      case 1:
        timeKey = 'isoWeek';
        break;
      case 2:
        timeKey = 'month';
        break;
      case 3:
        timeKey = 'quarter';
        break;
      case 4:
        timeKey = 'year';
        break;
    }
    this.defaultFilterTime = [dayjs().startOf(timeKey).format('DD/MM/YYYY'), dayjs().endOf(timeKey).format('DD/MM/YYYY')];
    this.params.start = this.defaultFilterTime[0];
    this.params.end = this.defaultFilterTime[1];
    this.getListRoomSchedule();
    if (e === 5) {
      this.defaultFilterTime = [dayjs().startOf(timeKey).format('YYYY-MM-DD'), dayjs().endOf(timeKey).format('YYYY-MM-DD')];
    }
  }

  searchRoomSchedule(value: string) {
    const text = value.trim();
    !text ? delete this.params.name : (this.params.name = text);
    this.listRoomSchedule = [];
    this.firstCall = true;
    this.getListRoomSchedule();
  }

  async getListRoomSchedule() {
    if (this.loading) {
      return;
    }
    try {
      this.loading = true;
      const result = await this.roomScheduleService.getListRoomSchedule(this.params);
      this.total = result.paging.total_count;
      this.listRoomSchedule = result.data;
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  handlerSelectViewType(event: string) {
    this.dataViewSelected = event;
    this.params.status = event;
    this.getListRoomSchedule();
  }

  handlerQueryParamsChange(params: NzTableQueryParams): void {
    if (!params || this.firstCall) {
      this.firstCall = false;
      return;
    }
    this.params.page = params.pageIndex;
    this.getListRoomSchedule();
  }

  handlerKeyUp(event: any) {
    if (this.params.name === event.target.value) {
      return;
    }
    this.params.page = 1;
    if (event.key === 'Enter') {
      this.searchRoomSchedule(event.target.value);
      return;
    }
    this.onSearch.next(event.target.value);
  }

  handlerSelectedFilterTime(result: Date[]): void {
    if (dayjs(this.params.start).isSame(dayjs(result[0])) && dayjs(this.params.end).isSame(dayjs(result[1]))) {
      return;
    }
    this.params.start = dayjs(result[0]).format('DD/MM/YYYY');
    this.params.end = dayjs(result[1]).format('DD/MM/YYYY');
    this.getListRoomSchedule();
  }

  handlerAddRoomSchedule(event: Event) {
    event.stopPropagation();
    // if (!this.authService.checkPermission('/Room-schedule', 'ADD_SCHEDULE')) {
    //   return;
    // }
    this.addOrEdit();
  }

  addOrEdit() {
    if (this.isOpenDrawAddEdit) {
      return;
    }
    this.isOpenDrawAddEdit = true;
    this.drawerRefGlobal = this.drawerService.create<PmRoomScheduleAddEditComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: 'Đặt phòng',
      nzContent: PmRoomScheduleAddEditComponent
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDrawAddEdit = true;
      this.drawerRefGlobal.getContentComponent().saveSuccess.subscribe((data: any) => {
        this.isOpenDrawAddEdit = false;
        this.drawerRefGlobal.close();
        this.listRoomSchedule = [data, ...this.listRoomSchedule];
      });
      this.drawerRefGlobal.getContentComponent().close.subscribe(() => {
        this.isOpenDrawAddEdit = false;
        this.drawerRefGlobal.close();
      });
    });

    this.drawerRefGlobal.afterClose.subscribe(data => {
      this.isOpenDrawAddEdit = false;
      this.drawerRefGlobal.close();
    });
  }

  protected async handlerCheckIn(event: Event, item: IRoomSchedule) {
    event.stopPropagation();
    try {
      const result = await this.roomScheduleService.checkInRoom(item.id);
      if (result.code === 200) {
        item.status = 'check_in';
        item.time_check_in = dayjs().format('DD/MM/YYYY');
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    }
  }

  protected handlerCheckOut(event: Event, item: IRoomSchedule) {
    event.stopPropagation();
    if (this.isOpenDrawAddEdit) {
      return;
    }
    this.isOpenDrawAddEdit = true;
    this.drawerRefGlobal = this.drawerService.create<PmRoomScheduleCheckOutComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: 'Trả phòng',
      nzContent: PmRoomScheduleCheckOutComponent,
      nzContentParams: {
        roomSchedule: item
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDrawAddEdit = true;
      this.drawerRefGlobal.getContentComponent().saveSuccess.subscribe((data: number) => {
        this.isOpenDrawAddEdit = false;
        this.drawerRefGlobal.close();
        item.status = 'check_out';
        item.total_price = data;
        item.time_check_out = dayjs().format('DD/MM/YYYY');
      });
      this.drawerRefGlobal.getContentComponent().close.subscribe(() => {
        this.isOpenDrawAddEdit = false;
        this.drawerRefGlobal.close();
      });
    });

    this.drawerRefGlobal.afterClose.subscribe(data => {
      this.isOpenDrawAddEdit = false;
      this.drawerRefGlobal.close();
    });
  }

}
