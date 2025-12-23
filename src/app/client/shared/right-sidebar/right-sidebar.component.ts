import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.scss']
})
export class RightSidebarComponent implements OnInit {
  isPostDetailPage: boolean = false;

  trendingBrands = [
    { name: 'Chuối Banh Mỳ B', avatar: 'https://ui-avatars.com/api/?name=Chuoi+Banh+My&background=ff6b6b&color=fff' },
    { name: 'Cà phê Xanh', avatar: 'https://ui-avatars.com/api/?name=Ca+phe+Xanh&background=0D8ABC&color=fff' },
    { name: 'Há sữa PaaPao', avatar: 'https://ui-avatars.com/api/?name=Ha+sua+PaaPao&background=4ecdc4&color=fff' },
    { name: 'Gà Rán Wow Chicken', avatar: 'https://ui-avatars.com/api/?name=Ga+Ran&background=ff9f1c&color=fff' },
    { name: 'Sâu Hí mini 24h', avatar: 'https://ui-avatars.com/api/?name=Sau+Hi&background=95e1d3&color=000' },
    { name: 'Tiệm Nails Kawaii', avatar: 'https://ui-avatars.com/api/?name=Tiem+Nails&background=ffc8dd&color=000' }
  ];

  guides = [
    { title: 'Hướng dẫn đăng tin', icon: 'mdi-file-document-outline' },
    { title: 'Quy trình nhượng quyền', icon: 'mdi-handshake-outline' },
    { title: 'Đối tác hỗ', icon: 'mdi-account-group-outline' }
  ];

  supportTopics = [
    { title: 'Tư vấn chọn ngành phù hợp', icon: 'mdi-chart-line' },
    { title: 'Tính chi phí mở cửa hàng', icon: 'mdi-calculator' },
    { title: 'Gợi ý mặt bằng phù hợp', icon: 'mdi-store' }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Check initial route
    this.checkRoute(this.router.url);

    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkRoute(event.urlAfterRedirects);
    });
  }

  checkRoute(url: string): void {
    // Check if current route is post detail page
    this.isPostDetailPage = url.includes('/client/post/') && !url.endsWith('/post');
  }

}
