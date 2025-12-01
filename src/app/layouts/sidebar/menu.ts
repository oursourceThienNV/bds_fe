import { MenuItem } from './menu.model';
export const MENU_ADMIN: MenuItem[]  = [
  // { label: 'Trang chủ', icon: '/assets/images/icon/home.svg', link: '/pages/category/dashboard' },
  // { label: 'Đội nhóm', icon: '/assets/images/icon/icon-team-group.svg', link: '/pages/category/group-team' },
  // { label: 'Quản lý công ty', icon: '/assets/images/icon/company.svg', link: '/pages/category/company' },
  { label: 'Quản lý người dùng', icon: '/assets/images/icon/icon-team-group.svg', link: '/pages/category/users' },
  { label: 'Quản lý license', icon: '/assets/images/icon/license.svg', link: '/pages/category/license'},
];
// export const MENU_COMPANY: MenuItem[]  = [
//   // { label: 'Trang chủ', icon: '/assets/images/icon/home.svg', link: '/pages/category/dashboard' },
//   { label: 'Đội nhóm', icon: '/assets/images/icon/icon-team-group.svg', link: '/pages/category/group-team' },
//   { label: 'Quản lý công ty', icon: '/assets/images/icon/company.svg', link: '/pages/category/company' },
//   { label: 'Quản lý người dùng', icon: '/assets/images/icon/icon-team-group.svg', link: '/pages/category/users' },
//   { label: 'Quản lý không gian làm việc', icon: '/assets/images/icon/icon-team-group.svg', link: '/pages/category/khong-gian-lam-viec' },
//   // { label: 'Diễn đàn công ty', icon: '/assets/images/icon/icon-forum.svg', link: '/forum' },
//   // { label: 'Quản lý ticket', icon: '/assets/images/icon/icon-forum.svg', link: '/forum' },
//
// ];
// export const MENU_GROUP: MenuItem[]  = [
//   // { label: 'Trang chủ', icon: '/assets/images/icon/home.svg', link: '/pages/category/dashboard' },
//   { label: 'Đội nhóm', icon: '/assets/images/icon/icon-team-group.svg', link: '/pages/category/group-team' },
//   { label: 'Quản lý người dùng', icon: '/assets/images/icon/icon-team-group.svg', link: '/pages/category/users' },
//   { label: 'Quản lý không gian làm việc', icon: '/assets/images/icon/icon-team-group.svg', link: '/pages/category/khong-gian-lam-viec' },
//   { label: 'Quản lý chung', icon: '/assets/images/icon/icon-team-group.svg', link: '/pages/category/common-code' },
// ];
// export const MENU_PERSON: MenuItem[]  = [
//   // { label: 'Trang chủ', icon: '/assets/images/icon/home.svg', link: '/pages/category/dashboard' },
//   { label: 'Quản lý chung', icon: '/assets/images/icon/icon-team-group.svg', link: '/pages/category/common-code' },
//   { label: 'Quản lý không gian làm việc', icon: '/assets/images/icon/icon-team-group.svg', link: '/pages/category/khong-gian-lam-viec' },
// ];
// export const MENU_WORKSPACE: MenuItem[] = [
//   { label: 'Trang chủ', icon: '/assets/images/icon/home.svg', link: '/pages/category/dashboard' },
//   { label: 'Quản lý khách hàng', icon: '/assets/images/icon/icon-manager-customer.svg', link: '/pages/category/khach-hang' },
//   { label: 'Bản đồ', icon: '/assets/images/icon/icon-map.svg', link: '/pages/category/map-customer' },
//   { label: 'Quản lý công việc', icon: '/assets/images/icon/icon-list-task.svg', link: '/pages/category/cong-viec' },
//
//   // --- Nhóm CÀI ĐẶT ---
//   { label: 'CÀI ĐẶT', isTitle: true },
//
//   { label: 'Cài đặt QLCV', icon: '/assets/images/icon/icon-list-task.svg', link: '/pages/category/trang-thai-cong-viec' },
//   // { label: 'Cài đặt tài khoản', icon: '/assets/images/icon/icon-list-task.svg', link: '#' },
//   {
//     label: 'Danh mục chung',
//     icon: '/assets/images/icon/icon-team-group.svg',
//     subItems: [
//       { label: 'Nhóm khách hàng',       link: '/pages/category/common-code', queryParams: { tab: 'customer-group' } },
//       { label: 'Ngành nghề',            link: '/pages/category/common-code', queryParams: { tab: 'industry' } },
//       { label: 'Nguồn',                 link: '/pages/category/common-code', queryParams: { tab: 'source' } },
//       { label: 'Kênh liên hệ',          link: '/pages/category/common-code', queryParams: { tab: 'channel' } },
//       { label: 'Trạng thái giao dịch',  link: '/pages/category/common-code', queryParams: { tab: 'deal-status' } },
//     ]
//   },
//];
/*export const MENU_INVESTOR: MenuItem[] = [
  {
    id: 1,
    label: 'Cấu hình ',
    icon: 'bx-home-circle',
    subItems: [
      {
        id: 6,
        label: 'Quản lý thông tin cá nhân',
        link: '/pages/category/users',
        parentId: 1
      },
      {
        id: 7,
        label: 'Quản lý NCC',
        link: '/pages/category/provider',
        parentId: 1
      }
    ]
  },
  {
    id: 10,
    label: 'Quản lý hoạt động',
    icon: 'bxs-shopping-bag',
    subItems: [
      {
        id: 11,
        label: 'Quản lý sản phẩm',
        link: '/pages/category/product',
        parentId: 10
      },
      {
        id: 11,
        label: 'Quản lý nhập kho',
        link: '/pages/category/import-house',
        parentId: 10
      }
      ,
      {
        id: 12,
        label: 'Quản lý xuất kho',
        link: '/pages/category/export-house',
        parentId: 10
      }

    ]
  }
];*/


