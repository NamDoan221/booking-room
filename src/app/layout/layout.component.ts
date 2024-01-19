import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { menuDefault } from './defines/layout.define';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { PmIconsProviderModule } from '../icon-ant/icons-provider.module';
// import { PmLayoutRoutingModule } from './layout.routing';
import { AuthService } from '../shared/services/auth/auth.service';
import { IToken } from '../shared/services/auth/interfaces/auth.interfaces';
import { CacheService } from '../shared/services/cache.service';
import { FunctionService } from '../shared/services/function/function.service';
import { IFunction } from '../shared/services/function/interfaces/function.interface';
import { GlobalEventService } from '../shared/services/global-event.service';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'bm-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass, RouterOutlet,
    PmIconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    NzBadgeModule,
    NzToolTipModule
  ]
})
export class PmLayoutComponent implements OnInit {
  public isCollapsed: boolean;
  menuData: IFunction[];
  currentPath?: string;
  accountFromCache?: IToken;

  constructor(
    private router: Router,
    private auth: AuthService,
    private cacheService: CacheService,
    private functionService: FunctionService,
    private globalEventService: GlobalEventService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.isCollapsed = false;
    this.menuData = []
  }

  ngOnInit() {
    this.accountFromCache = this.auth.decodeToken();
    // this.globalEventService.UrlReplaceBehaviorSubject.subscribe(url => {
    //   this.currentPath = url;
    //   this.cdr.detectChanges();
    // });
    this.buildMenu();
    this.currentPath = this.router.url;
  }

  async buildMenu() {
    // const roles = this.auth.decodeToken()?.Roles;
    try {
      if (this.accountFromCache?.role === 'client') {
        return;
      }
      this.menuData = menuDefault()
      if (this.accountFromCache?.role === 'user') {
        this.menuData = this.menuData.map(item => {
          return {
            ...item,
            FunctionChilds: item.FunctionChilds?.filter(func => func.Url === '/task' || func.Url === '/logout')
          }
        })
      }
      // const result = await this.functionService.getListFunction({ page: 1, pageSize: 100, active: true, search: '' });
      // const functionByRole = result.Value?.filter(item => roles?.find(role => role.IdFunction === item.Id));
      // menuDefault().forEach(item => {
      //   const functionChilds = [];
      //   item.FunctionChilds?.forEach(child => {
      //     if (!!functionByRole?.find(element => element.IsMenu && element.Url === child.Url)) {
      //       functionChilds.push({
      //         ...child,
      //         IsMenu: true
      //       })
      //     }
      //   });
      //   if (!!functionChilds?.length) {
      //     this.menuData.push({
      //       ...item,
      //       IsMenu: true,
      //       FunctionChilds: functionChilds
      //     })
      //   }
      // });
    } catch (error) {
      console.log(error);
    }
  }

  async handlerRouting(event: Event, url: string) {
    event.stopPropagation();
    if (!url) {
      return;
    }
    if (url === '/logout') {
      try {
        // const result = await this.auth.logout();
        this.cacheService.clearAll();
        this.zone.run(() => {
          this.router.navigate(['/login']);
        });
      } catch (error) {
        console.log(error);
      }
      return;
    }
    this.currentPath = url;
    this.zone.run(() => {
      this.router.navigate([url]);
    });
  }

  handlerChangeOpen(event: Event) {
    this.cdr.detectChanges();
  }
}
