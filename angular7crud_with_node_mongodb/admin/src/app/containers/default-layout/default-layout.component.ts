import { Component, OnDestroy, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { navItems } from '../../_nav';
import { coachnavItems } from '../../coach_nav';
import { AuthenticationService } from '../../services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnDestroy {
  //public navItems = navItems;

    navItems:any;  

  public sidebarMinimized = true;
  private changes: MutationObserver;
  public element: HTMLElement;
  private authService: AuthenticationService;

  
  
  constructor(
    private router: Router,
     @Inject(DOCUMENT) _document?: any,
    
  ) { 

        var get_user_type = localStorage.user_type;

         if(get_user_type=='admin')
         {
            this.navItems = navItems;
         }
         else{
          this.navItems = coachnavItems;
         }

        this.changes = new MutationObserver((mutations) => {
          this.sidebarMinimized = _document.body.classList.contains('sidebar-minimized');
        });
        this.element = _document.body;
        this.changes.observe(<Element>this.element, {
          attributes: true,
          attributeFilter: ['class']
        });
  }

  ngOnDestroy(): void {
    this.changes.disconnect();
  }

  logout() {
    localStorage.removeItem('expire');
    // this.loading = false;
    localStorage.removeItem('userData');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_type');
    this.router.navigate(['/login']);
  }
}
