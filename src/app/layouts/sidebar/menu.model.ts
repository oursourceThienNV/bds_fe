export interface MenuItem {
  label: string;
  icon?: string;
  link?: string;
  subItems?: MenuItem[];
  isTitle?: boolean;                 // Heading không click (vd: CÀI ĐẶT)
  queryParams?: { [key: string]: any }; // Truyền tham số (vd: ?tab=source)
}
