import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Renderer2, ElementRef, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {LocationServices} from "../../../core/services/services-app/location.service";
import {CommonCodeServices} from "../../../core/services/services-app/common-code.service";
import {COMMMON_CODE} from "../Contants";
import Swal from "sweetalert2";
import {MediaService} from "../../../core/services/services-app/media.service";
import {CustomerService} from "../../../core/services/services-app/customer.service";
import {jwtDecode} from "jwt-decode";
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-customer-dialog',
  templateUrl: './customer-dialog.component.html'
})
export class CustomerDialogComponent implements OnInit{

  customerForm: FormGroup;
  isCollapse = true;
  listProvince:any;
  listDistrict:any;
  listWard:any;
  workSpaceId:any;
  selectedFiles:any[]=[];
  listCommon:any;
  COMMMON_CODE=COMMMON_CODE;
  isLoading = false;
  roleWorkSpaceany;

  // Input properties from parent component
  customer: any = null;
  mode: 'add' | 'edit' | 'view' = 'add';

  constructor(
    public modal: NgbActiveModal,private renderer: Renderer2,
    private el: ElementRef,private router: Router,private locationService:LocationServices,private commonCodeService: CommonCodeServices,
    private fb: FormBuilder,private customerService:CustomerService,
    private mediaService:MediaService
  ) {
    this.customerForm = this.fb.group({
      id: [''],
      hoTen: ['', [Validators.required]],
      sdt: [''],
      pho: [''],
      tinh: [''],
      huyen: [''],
      xa: [''],
      listMqh: [''],
      sanPhamDichVu: [''],
      nhomKh: [''],
      yeuCau: [''],
      listFile: [],
      workSpaceId:[''],
      gioiTinh:[''],
      ngaySinh:[''],
      tinhTrangMuaHang:['']
    });
  }
  ngOnInit(): void {
    const authWs = localStorage.getItem('authWs');
    if(authWs) {
      const decodedWs: any = jwtDecode(authWs);
      this.workSpaceId = Number(decodedWs.workSpaceId);
      this.customerForm.get('workSpaceId').setValue(this.workSpaceId);
    }
    this.getProvince();
    this.getListCommonCode();

    // Load customer data if in edit or view mode
    if (this.customer && (this.mode === 'edit' || this.mode === 'view')) {
      this.loadCustomerData();
    }
  }

  changeSize() {
    if (this.customer && this.customer.id) {
      // Close modal first
      this.modal.close();
      // Navigate to detail view
      this.router.navigate(['/pages/category/khach-hang/detail', this.customer.id, 'view']);
    } else {
      const currentFormData = this.customerForm.value;
    const currentFiles = this.selectedFiles;

    // 2. Đóng modal hiện tại lại
    this.modal.close();

    // 3. Điều hướng sang trang Add và gửi kèm dữ liệu qua 'state'
    // Lưu ý: Dấu '/' ở đầu để đảm bảo đường dẫn tuyệt đối
    this.router.navigate(['/pages/category/khach-hang/add'], {
      state: {
        prefilledData: currentFormData,
        prefilledFiles: currentFiles
      }
    });
    //window.location.href="pages/category/khach-hang/add?name=";
    }
  }

  loadCustomerData() {
    console.log('Loading customer data:', this.customer);

    // Populate form with customer data
    this.customerForm.patchValue({
      id: this.customer.id,
      hoTen: this.customer.hoTen,
      sdt: this.customer.sdt,
      pho: this.customer.pho,
      tinh: this.customer.tinh,
      huyen: this.customer.huyen,
      xa: this.customer.xa,
      gioiTinh: this.customer.gioiTinh,
      ngaySinh: this.customer.ngaySinh,
      yeuCau: this.customer.yeuCau,
      nhomKh: this.customer.nhomKh,
      tinhTrangMuaHang: this.customer.tinhTrangMuaHang,
      workSpaceId: this.workSpaceId
    });

    // Load location data if available
    if (this.customer.tinh) {
      const province = { code: this.customer.tinh };
      this.getDistrict(province);
      this.selectedProvince = { code: this.customer.tinh, name: this.customer.ten_tinh };
    }

    if (this.customer.huyen) {
      const district = { code: this.customer.huyen };
      this.getWard(district);
      this.selectedDistrict = { code: this.customer.huyen, name: this.customer.ten_huyen };
    }

    if (this.customer.xa) {
      this.selectedWard = { code: this.customer.xa, name: this.customer.ten_xa };
    }

    // Load files/media if available
    if (this.customer.medias && Array.isArray(this.customer.medias)) {
      this.selectedFiles = this.customer.medias.map((media: any) => ({
        id: media.id,
        name: media.file_name || media.fileName || 'Unknown file',
        url: media.url
      }));
    }
  }

  getProvince(){
    this.locationService.listProvince().subscribe(res=>{
      if (res && res.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.listProvince = res.body;
      } else {
        console.error('Danh sách tỉnh:', res.responseMessage);
      }
    })
  }
  getListCommonCode(){
    const body={
      workSpaceId:this.workSpaceId
    }
    this.commonCodeService.listCommonByWorkSpaceId(body).subscribe(res=>{
      if (res && res.body.responseCode === '200') {
        debugger;// hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.listCommon = res.body.body;
      } else {
        console.error('Danh sách tỉnh:', res.responseMessage);
      }
    })
  }
  getDistrict(item:any){
    debugger;
    const body={
      code:item.code
    }
    this.locationService.listDistrict(body).subscribe(res=>{
      if (res && res.body.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.listDistrict = res.body.body;
      } else {
        console.error('Danh sách huyện:', res.responseMessage);
      }
    })
  }
  getWard(item:any){
    const body={
      code:item.code
    }
    this.locationService.listWard(body).subscribe(res=>{
      if (res && res.body.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.listWard = res.body.body;
      } else {
        console.error('Danh sách xã:', res.responseMessage);
      }
    })
  }

  onSubmit(): void {
    this.isLoading=true;
    if(this.selectedFiles==null){
      this.selectedFiles = [];
    }
    const filesWithoutId = this.selectedFiles.filter(f => !f.id);
    const filesWithId = this.selectedFiles.filter(f => f.id);
    const listId = Array.from(
      new Set(
        filesWithId
          .map(f => f.id)
          .filter((id): id is number => !!id)
      )
    );
    if (filesWithoutId.length === 0) {
      this.customerForm.get("listFile").setValue(listId);
      // Không upload, lưu luôn với mediaIds rỗng
      this.save(); // <-- truyền mảng Long rỗng
      return;        // <-- nhớ return để không chạy xuống dưới
    }

    const formData = new FormData();
    filesWithoutId.forEach(f => formData.append('files', f, f.name)); // hoặc 'files[]' nếu BE yêu cầu

    this.mediaService.uploadMultiple(formData).subscribe({
      next: (res) => {
        const mediaIds = this.toMediaIdList(res); // [12,13,...]
        const listFile = Array.from(new Set([...mediaIds, ...listId]));
        this.customerForm.get("listFile").setValue(listFile);
        this.save();                     // <-- truyền danh sách Long
      },
      error: (err) => {
        console.error('Upload thất bại', err);
        this.isLoading=false;
        this.showError(err?.error?.message || 'Upload thất bại');
      }
    });
  }
  private toMediaIdList(res: any): number[] {
    const arr = res?.body ?? res?.data ?? res?.files ?? res?.items ?? (Array.isArray(res) ? res : []);
    return arr
      .map((x: any) => Number(x?.media?.id))
      .filter((id: any) => Number.isFinite(id));
  }
  save(){
    // const v = this.customerForm.value;
    // this.isLoading = true;
    if (this.customerForm.invalid) {
    this.customerForm.markAllAsTouched();
    return;
  }
    const data = this.customerForm.value;
    this.customerService.insertOrUpdate(data).subscribe({
      next: (res) => {
          this.isLoading = false;
        if (res.body?.body === true) {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Thêm mới thành công',
            showConfirmButton: false,
            timer: 2000

          })
         // this.isLoading=false;
          this.modal.close({ result: 'complete' });
        } else {
          this.isLoading=false;
          this.showError('Đã có lỗi xảy ra, vui lòng thử lại');
        }
       // this.isLoading = false;
      },
      error: (err) => {
        this.showError(err?.error?.message || 'Lỗi hệ thống');
        this.isLoading = false;
      }
    });
  }
  private showError(message: string): void {
    Swal.fire({
      position: 'top-end',
      icon: 'error',
      title: message,
      showConfirmButton: false,
      timer: 2500
    });
  }
  onFileSelect(event: any): void {
    debugger;
    const files = event.target.files;
    if (this.selectedFiles === undefined) {
      this.selectedFiles = [];
    }
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files[i]);
      }
      event.dataTransfer?.clearData();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.add('dragover');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.remove('dragover');
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.remove('dragover');

    const files = event.dataTransfer?.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files[i]);
      }
    }
  }
  private splitDateTime(datetime: Date | string | null): {
    date: Date | null,
  } {
    debugger;
    if (!datetime) return { date: null};
    const d = new Date(datetime);
    return {
      date: new Date(d.getFullYear(), d.getMonth(), d.getDate())
    };
  }
  getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'fa-file-pdf text-danger';
      case 'doc':
      case 'docx': return 'fa-file-word text-primary';
      case 'xls':
      case 'xlsx': return 'fa-file-excel text-success';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif': return 'fa-file-image text-warning';
      case 'zip':
      case 'rar': return 'fa-file-archive text-secondary';
      case 'txt': return 'fa-file-alt text-muted';
      default: return 'fa-file text-muted';
    }
  }
  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }


  //  Biến điều khiển hiển thị
dropdownOpen = false;
activeTab: 'tinh' | 'huyen' | 'xa' = 'tinh';
selectedProvince: any;
selectedDistrict: any;
selectedWard: any;
searchText = '';

onSearchChange() {
  this.searchText = this.searchText.trim();
}

// Xử lý chọn tỉnh
selectProvince(item: any) {
  this.selectedProvince = item;
  this.selectedDistrict = null;
  this.selectedWard = null;
  this.customerForm.patchValue({ tinh: item.code, huyen: '', xa: '' });
  this.getDistrict(item);  // dùng lại hàm bạn có sẵn
  this.activeTab = 'huyen';
}

// Xử lý chọn huyện
selectDistrict(item: any) {
  this.selectedDistrict = item;
  this.selectedWard = null;
  this.customerForm.patchValue({ huyen: item.code, xa: '' });
  this.getWard(item);  // dùng lại hàm bạn có sẵn
  this.activeTab = 'xa';
}

// Xử lý chọn xã
selectWard(item: any) {
  this.selectedWard = item;
  this.customerForm.patchValue({ xa: item.code });
  this.dropdownOpen = false; // đóng dropdown
}

// 🟢 Mở / đóng dropdown
// toggleDropdown() {
//   this.dropdownOpen = !this.dropdownOpen;
//   this.activeTab = 'tinh';
// }

toggleDropdown(forceOpen?: boolean) {
  this.dropdownOpen = forceOpen ?? !this.dropdownOpen;
  this.activeTab = 'tinh';
}
}
