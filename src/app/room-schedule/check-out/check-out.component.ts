import { NgIf, NgClass, DatePipe, NgFor, DecimalPipe } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzDatePickerModule } from "ng-zorro-antd/date-picker";
import { NzDrawerModule } from "ng-zorro-antd/drawer";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzInputNumberModule } from "ng-zorro-antd/input-number";
import { NzNotificationModule } from "ng-zorro-antd/notification";
import { NzSelectModule } from "ng-zorro-antd/select";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { NzSwitchModule } from "ng-zorro-antd/switch";
import { NzTableModule } from "ng-zorro-antd/table";
import { NzTagModule } from "ng-zorro-antd/tag";
import { NzToolTipModule } from "ng-zorro-antd/tooltip";
import { PmIconsProviderModule } from "../../icon-ant/icons-provider.module";
import { PmLibCardModule } from "../../shared/components/card/card.module";
import { IBodyCheckOutRoom, IBodyGetPrice, IRoomSchedule } from "../../shared/services/room-schedule/interfaces/room-schedule.interface";
import { IProduct } from "../../shared/services/product/interfaces/product.interface";
import { RoomScheduleService } from "../../shared/services/room-schedule/room-schedule.service";
import { GetNumberUsePipe } from "./pipes/get-number-use.pipe";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import { NzMessageService } from "ng-zorro-antd/message";
import { Subject, debounceTime } from "rxjs";

@Component({
  selector: 'pm-room-schedule-check_out',
  templateUrl: './check-out.component.html',
  styleUrls: ['./check-out.component.scss'],
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
    GetNumberUsePipe,
    DecimalPipe
  ]
})
export class PmRoomScheduleCheckOutComponent implements OnInit {

  keyFetch: string;
  productUse: Array<{ id_product: string, number: number }>;
  listProduct: Array<IProduct>;
  loading?: boolean;
  loadingSave?: boolean;
  total_price: number;
  onGetPrice: Subject<void> = new Subject();

  roomScheduleService = inject(RoomScheduleService);
  nzMessageService = inject(NzMessageService);

  @Input() roomSchedule!: IRoomSchedule;

  @Output() saveSuccess = new EventEmitter<number>();

  constructor() {
    this.listProduct = [];
    this.productUse = [];
    this.keyFetch = uuid();
    this.total_price = 0;
    this.onGetPrice.pipe(debounceTime(1500)).subscribe(() => {
      this.getPrice();
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      this.loading = true;
      const result = await this.roomScheduleService.getProduct();
      this.listProduct.push(...result.data);
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
    this.getPrice();
  }

  async getPrice() {
    try {
      const body: IBodyGetPrice = {
        id_order: this.roomSchedule.id,
        id_account: this.roomSchedule.id_account,
        id_product: this.roomSchedule.id_product,
        time: dayjs().format('DD/MM/YYYY')
      }
      const products = this.productUse.filter(item => item.number);

      if (products.length) {
        body.product = products
      }
      const result = await this.roomScheduleService.getPrice(body);

      this.total_price = result.total_price
    } catch (error) {
      console.log(error);
    }
  }

  handlerChangeNumber(event: Event, id: string, add: boolean) {
    event.stopPropagation();
    const product = this.productUse.find(item => item.id_product === id);

    if (product) {
      product.number = add ? (product.number || 0) + 1 : (product.number || 1) - 1;
      this.keyFetch = uuid();
      this.onGetPrice.next();

      return;
    }
    if (add) {
      this.productUse.push({
        id_product: id,
        number: 1
      });
      this.keyFetch = uuid();
      this.onGetPrice.next();

      return;
    }
  }

  async handlerSave(event: Event) {
    event.stopPropagation();
    this.loadingSave = true;
    const body: IBodyCheckOutRoom = {
      total_price: this.total_price
    }
    try {
      const result = await this.roomScheduleService.checkOutRoom(body, this.roomSchedule.id);
      if (result.code === 200) {
        this.saveSuccess.emit(this.total_price);
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error(result.message || 'Thao tác không thành công.');
    } catch (error) {
      console.log(error);
      this.nzMessageService.error('Thao tác không thành công.');
    } finally {
      this.loadingSave = false;
    }
  }
}