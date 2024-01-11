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
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { PmIconsProviderModule } from '../icon-ant/icons-provider.module';
import { AuthService } from '../shared/services/auth/auth.service';
import { TeamService } from '../shared/services/team/team.service';
import { PmTeamAddEditComponent } from './add-edit/add-edit.component';
import { IParamsGetListTeam, ITeam } from '../shared/services/team/interfaces/team.interface';

@Component({
  selector: 'bm-team',
  templateUrl: './team.component.html',
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
export class PmTeamComponent implements OnInit {
  loading: boolean;
  isOpenDrawAddEdit: boolean;
  drawerRefGlobal?: NzDrawerRef;
  onSearch: Subject<string> = new Subject();
  listTeam: ITeam[];
  totalTeam: number;
  params: IParamsGetListTeam;
  teamExpand: string[];

  checked: boolean;
  showDelete: boolean;
  listOfCurrentPageData: readonly any[] = [];
  listOfData: readonly any[] = [];
  setOfCheckedId = new Set<string>();

  constructor(
    private drawerService: NzDrawerService,
    private nzMessageService: NzMessageService,
    private teamService: TeamService,
    private authService: AuthService
  ) {
    this.loading = false;
    this.totalTeam = 0;
    this.isOpenDrawAddEdit = false;
    this.listTeam = [];
    this.checked = false;
    this.showDelete = false;
    this.params = {
      page: 1,
      per_page: 100
    };
    this.teamExpand = [];
  }

  async ngOnInit(): Promise<void> {
    this.onSearch.pipe(debounceTime(1500), filter(value => value !== this.params.search)).subscribe((value) => {
      this.searchTeam(value);
    });
    this.getListTeam();
  }

  async getListTeam() {
    if (this.loading) {
      return;
    }
    try {
      this.loading = true;
      const result = await this.teamService.getListTeam(this.params);
      this.totalTeam = result.paging.total_count;
      this.listTeam = result.data;
      this.listTeam.length && (this.teamExpand = [this.listTeam[0].id]);
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  searchTeam(value: string) {
    const text = value.trim();
    !text ? delete this.params.search : (this.params.search = text);
    this.listTeam = [];
    this.getListTeam();
  }

  handlerAddTeam(event: Event) {
    event.stopPropagation();
    // if (!this.authService.checkPermission('/personnel', 'ADD_PERSONNEL')) {
    //   return;
    // }
    this.addOrEdit(undefined);
  }

  handlerEditTeam(event: Event, item: ITeam) {
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

  addOrEdit(team: ITeam | undefined) {
    if (this.isOpenDrawAddEdit) {
      return;
    }
    this.isOpenDrawAddEdit = true;
    this.drawerRefGlobal = this.drawerService.create<PmTeamAddEditComponent>({
      nzBodyStyle: { overflow: 'auto' },
      nzMaskClosable: false,
      nzWidth: team ? '30vw' : '30vw',
      nzClosable: true,
      nzKeyboard: true,
      nzTitle: team ? `Sửa thông tin team` : 'Thêm team',
      nzContent: PmTeamAddEditComponent,
      nzContentParams: {
        team: team,
        modeEdit: team ? true : false
      }
    });

    this.drawerRefGlobal.afterOpen.subscribe(() => {
      this.isOpenDrawAddEdit = true;
      this.drawerRefGlobal?.getContentComponent().saveSuccess.subscribe((data: ITeam) => {
        this.isOpenDrawAddEdit = false;
        this.drawerRefGlobal?.close();
        if (team) {
          Object.assign(team, data);
          return;
        }
        this.listTeam = [data, ...this.listTeam];
      });
    });

    this.drawerRefGlobal.afterClose.subscribe(data => {
      this.isOpenDrawAddEdit = false;
      this.drawerRefGlobal?.close();
    });
  }

  handlerKeyUp(event: any) {
    if (this.params.search === event.target.value) {
      return;
    }
    this.params.page = 1;
    if (event.key === 'Enter') {
      this.searchTeam(event.target.value);
      return;
    }
    this.onSearch.next(event.target.value);
  }

  async handlerDelete(id: string) {
    try {
      const result = await this.teamService.deleteTeam([id]);
      if (result.code === 200) {
        this.listTeam = this.listTeam.filter(item => item.id !== id);
        this.nzMessageService.success('Thao tác thành công.');
        return;
      }
      this.nzMessageService.error('Thao tác không thành công.');
    } catch (error) {
      this.nzMessageService.error('Thao tác không thành công.');
    }
  }

  handlerExpand(event: Event, id: string) {
    event.stopPropagation();
    const index = this.teamExpand.findIndex(item => item === id);

    if (index > -1) {
      this.teamExpand.splice(index, 1);

      return;
    }
    this.teamExpand.push(id);
  }

}
