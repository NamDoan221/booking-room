import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AccountService } from '../../shared/services/account/account.service';
import { IAccount } from '../../shared/services/account/interfaces/account.interface';
import { AuthService } from '../../shared/services/auth/auth.service';
import { get, uniqBy } from 'lodash';
import { NgFor, NgForOf, NgIf } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { PmIconsProviderModule } from '../../icon-ant/icons-provider.module';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { IRole } from '../../shared/services/role/interfaces/role.interface';
import { RoleService } from '../../shared/services/role/role.service';
import { TeamService } from '../../shared/services/team/team.service';
import { IAccountInTeam, IBodyAddTeam, ITeam } from '../../shared/services/team/interfaces/team.interface';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'pm-team-add_edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
  standalone: true,
  imports: [
    NgIf, NgFor, NzSelectModule,
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
export class PmTeamAddEditComponent implements OnInit {

  teamForm!: FormGroup;
  loading?: boolean;
  listAccount: Array<IAccountInTeam>;
  listSelectedAccount: Array<IAccountInTeam>;

  @Input() team?: ITeam;
  @Input() modeEdit?: boolean;

  @Output() saveSuccess = new EventEmitter<ITeam>();

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private nzMessageService: NzMessageService,
    private authService: AuthService,
    private teamService: TeamService
  ) {
    this.listAccount = [];
    this.listSelectedAccount = [];
  }

  ngOnInit(): void {
    this.listSelectedAccount = [...(this.team?.accounts || [])];
    this.teamForm = this.fb.group({
      name: [this.team?.name ?? '', [Validators.required]],
      accounts: [this.team?.accounts.map(item => item.id) ?? [], [Validators.required]],
      leader: [this.team?.accounts.find(item => item.position === 'leader')?.id ?? '', [Validators.required]]
    });
    this.getListAccountNotTeam();
  }

  async getListAccountNotTeam() {
    try {
      const result = await this.accountService.getListAccountNotTeam();
      this.listAccount.push(...uniqBy([...result.data, ...(this.team?.accounts || [])], item => item.id));
    } catch (error) {
      console.log(error);
    }
  }

  async handlerUpdate(event: Event) {
    event.stopPropagation();
    // if (this.modeEdit && !this.authService.checkPermission('/personnel', 'EDIT_PERSONNEL')) {
    //   return;
    // }
    if (!this.teamForm.valid) {
      Object.values(this.teamForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;
    const controlValue = this.teamForm.value;
    const body: IBodyAddTeam = {
      name: controlValue.name,
      accounts: controlValue.accounts.map((item: string) => {
        return {
          id_account: item,
          position: item === controlValue.leader ? 'leader' : 'member'
        }
      })
    }
    try {
      const result = await (this.modeEdit ? this.teamService.updateTeam(body, this.team?.id || '') : this.teamService.createTeam(body));
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

  handlerChangeAccount(event: string[]) {
    this.listSelectedAccount = this.listAccount.filter(account => event.includes(account.id));
  }

}
