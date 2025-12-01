import { Component } from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import { Renderer2, ElementRef, OnInit } from '@angular/core';
import {CommonCodeServices} from "../../../core/services/services-app/common-code.service";
import {ActivatedRoute, Router} from "@angular/router";
import {LocationServices} from "../../../core/services/services-app/location.service";
import {COMMMON_CODE, ACCOUNT_TYPE, COMMON_STATUS, ROLE} from "../Contants";
import {UserProfileService} from "../../../core/services/user.service";
import Swal from "sweetalert2";
import {MediaService} from "../../../core/services/services-app/media.service";
import {CustomerService} from "../../../core/services/services-app/customer.service";
import {jwtDecode} from "jwt-decode";
import {CommonCodeDialogComponent} from "../common-code/common-code-dialog.component";
import { Location } from '@angular/common';
  
@Component({
  selector: 'app-customer-dialog',
  templateUrl: './customer-add.component.html'})
export class CustomerAddComponent implements OnInit {
    ROLE = ROLE;
    ACCOUNT_TYPE=ACCOUNT_TYPE;
    COMMON_STATUS = COMMON_STATUS;
     accountType:any;
  constructor(
    private renderer: Renderer2, private el: ElementRef,private route: ActivatedRoute,private locationService:LocationServices,private commonService:CommonCodeServices,
    private userService:UserProfileService,
    private mediaService:MediaService,
    private customerService:CustomerService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private _location: Location,
    private router: Router,
  ) {
    this.customerForm = this.fb.group({
      id: [''],
      hoTen: [''],
      sdt: [''],
      pho: [''],
      tinh: [''],
      huyen: [''],
      xa: [''],
      listMqh: [''],
      sanPhamDichVu: [''],
      nhomKh: [''],
      yeuCau: [''],
      gioiTinh: [''],
      cccd: [''],
      ngaySinh: [''],
      nganhNghe: [''],
      thuNhap: [''],
      tinhTrangMuaHang: [''],
      nhuCau: [''],
      soThich: [''],
      moiQuanTam: [''],
      sanPhamTungMua: [''],
      kenhLienHe: [''],
      ngayDongPhiGanNhat: [''],
      ngayDongPhiKeTiep: [''],
      tongDoanhThu: [''],
      doanhThuGanNhat: [''],
      danhSachGapMat: [''],
      nguoiPhuTrach: [''],
      nhanVienTuVan: [''],
      nguon: [''],
      trangThaiCskh: [''],
      chiPhiCskh: [''],
      tinhTrangCskh: [''],
      soTienHienTai: [''],
      tongTienCskh: [''],
      tinhTrangHonNhan: [''],
      email:[''],
      listFile: [],
      workSpaceId: [''],
      meets: this.fb.array([this.fb.control('')]),
      relationshipList: this.fb.array([this.createRelationship()])    });
  }
  createRelationship(): FormGroup {
    return this.fb.group({
      label: [''],          // hoặc ['', Validators.required]
      customerId: [null],   // hoặc [null, Validators.required]
    });
  }
  get meets(): FormArray {
    return this.customerForm.get('meets') as FormArray;
  }

  addMeeting() {
    this.meets.push(this.fb.control(''));
  }

  addCommon(event){
      const res = this.modalService.open(CommonCodeDialogComponent, {size: 'lg', centered: true});
      res.componentInstance.title = "Thêm mới thông tin"
      res.componentInstance.type=event;
      res.closed.subscribe(temp => {
        this.getListCommonCode();
      })
  }

  removeMeeting(i: number) {
    this.meets.removeAt(i);
  }
  get relationshipList(): FormArray {
    return this.customerForm.get('relationshipList') as FormArray;
  }

  addRelationShip(): void {
    this.relationshipList.push(this.createRelationship()); // <-- fix
  }

  removeRelationShip(i: number): void {
    if (this.relationshipList.length > 1) {
      this.relationshipList.removeAt(i);
    }
  }
   formGroup!: FormGroup;
  COMMMON_CODE=COMMMON_CODE;
  customerForm: FormGroup;
  isCollapse = true;
  listProvince:any;
  listDistrict:any;
  listWard:any;
  listChange:any;
  listSource:any;
  files: File[] = [];
  companyId:any;
  selectedFiles: any[]=[]; // hoặc có thể khởi tạo rỗng []
  workSpaceId:any;
  listCommon:any;
  listUser:any;
  isLoading:boolean=false;
  listCustomer:any;
  customer:any;
  action:any;

  async ngOnInit(): Promise<void> {
   const state = history.state;
    console.log("Check State:", state);

    if (state && state.prefilledData) {
      // Patch các trường text đơn giản
      this.customerForm.patchValue({
        hoTen: state.prefilledData.hoTen,
        sdt: state.prefilledData.sdt,
        email: state.prefilledData.email,
        yeuCau: state.prefilledData.yeuCau,
        sanPhamDichVu: state.prefilledData.sanPhamDichVu,
        gioiTinh: state.prefilledData.gioiTinh,
      });

      // Xử lý File
      if (state.prefilledFiles) {
        this.selectedFiles = state.prefilledFiles;
      }
    }

    await this.getProvince();
    const authWs = localStorage.getItem('authWs');
    const decodedWs: any = jwtDecode(authWs);
    this.workSpaceId=decodedWs.workSpaceId;
    this.customerForm.get('workSpaceId').setValue(this.workSpaceId);
    await this.getListCommonCode();
    await this.getListUser();
    await this.getListAllCustomer();

    const id = this.route.snapshot.paramMap.get('id');
    this.action = this.route.snapshot.paramMap.get('action');

    

    if(id){
    await this.getCustomerById(id);
    if(this.action==='view'){
      this.customerForm.disable();
      this.customerForm.get('meets')?.disable();
      }

    }else if (state && state.prefilledData && state.prefilledData.tinh) {
          await this.fillAddressFromModal(state.prefilledData);
      }
    this.checkOwner();

  }

async fillAddressFromModal(data: any) {
    console.log("--- BẮT ĐẦU XỬ LÝ ĐỊA CHỈ ---");
    console.log("Dữ liệu nhận được:", data);

    // BƯỚC 1: XỬ LÝ TỈNH
    // Phải chờ tải xong danh sách tỉnh
    await this.loadProvincePromise(); 
    
    // Tìm object Tỉnh khớp với mã (ép về String để so sánh an toàn)
    this.selectedProvince = this.listProvince?.find(
        (p: any) => String(p.code) === String(data.tinh)
    );

    if (this.selectedProvince) {
        console.log("-> Đã tìm thấy Tỉnh:", this.selectedProvince.name);
        
        // Cập nhật cả Form lẫn biến hiển thị
        this.customerForm.patchValue({ tinh: data.tinh });

        // BƯỚC 2: XỬ LÝ HUYỆN
        await this.loadDistrictPromise(data.tinh);
        
        if (data.huyen) {
            this.selectedDistrict = this.listDistrict?.find(
                (d: any) => String(d.code) === String(data.huyen)
            );

            if (this.selectedDistrict) {
                console.log("-> Đã tìm thấy Huyện:", this.selectedDistrict.name);
                this.customerForm.patchValue({ huyen: data.huyen });

                // BƯỚC 3: XỬ LÝ XÃ
                await this.loadWardPromise(data.huyen);
                
                if (data.xa) {
                    this.selectedWard = this.listWard?.find(
                        (w: any) => String(w.code) === String(data.xa)
                    );

                    if (this.selectedWard) {
                        console.log("-> Đã tìm thấy Xã:", this.selectedWard.name);
                        this.customerForm.patchValue({ xa: data.xa });
                    }
                }
            }
        }
    } else {
        console.error("LỖI: Không tìm thấy tỉnh nào có mã =", data.tinh);
        console.log("Danh sách tỉnh hiện có:", this.listProvince);
    }
}


  async getCustomerById(id:any){
    const body={
      id:id
    }
    this.customerService.findById(body).subscribe(async res=>{
      if (res && res.body.responseCode === '200') {
        debugger;// hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.customer = res.body.body.customer;
        this.selectedFiles=res.body.body.listFile;
        const item={code:this.customer.tinh};
        const item2={code:this.customer.huyen};
        await this.getDistrict(item);
        await this.getWard(item2);
        this.customerForm.patchValue(this.customer);
        const rels = res.body.body.relationshipList || [];
        const relArray = this.fb.array(
          rels.length
            ? rels.map((r: any) => this.fb.group({
              label: [r.label],
              customerId: [r.customerId]
            }))
            : [this.createRelationship()] // nếu rỗng vẫn để 1 dòng trống
        );
        this.customerForm.setControl('relationshipList', relArray)
        debugger;
        const arr: string[] = JSON.parse(this.customer.danhSachGapMat);
        const transformed: Date[] = (arr ?? []).map(item => this.splitDateTime(item).date);
        this.customerForm.get('meets')?.patchValue(transformed);
        const { date: ngaySinh } = this.splitDateTime(this.customer.ngaySinh);
        this.customerForm.patchValue({ ngaySinh });

        const { date: ngayDongPhiGanNhat } = this.splitDateTime(this.customer.ngayDongPhiGanNhat);
        this.customerForm.patchValue({ ngayDongPhiGanNhat });

        const { date: ngayDongPhiKeTiep } = this.splitDateTime(this.customer.ngayDongPhiKeTiep);
        this.customerForm.patchValue({ ngayDongPhiKeTiep });
        // this.customerForm.get("ngaySinh").setValue(this.customer.ngaySinh);
      } else {
        console.error('Danh sách tỉnh:', res.responseMessage);
      }
    })
  }

  async getListAllCustomer(){
    const body={
      id:this.workSpaceId
    }
    this.customerService.getAll(body).subscribe(res=>{
      if (res && res.body.responseCode === '200') {
        debugger;// hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.listCustomer = res.body.body;
      } else {
        console.error('Danh sách tỉnh:', res.responseMessage);
      }
    })
  }
  async getListCommonCode(){
    const body={
      workSpaceId:this.workSpaceId
    }
    this.commonService.listCommonByWorkSpaceId(body).subscribe(res=>{
      if (res && res.body.responseCode === '200') {
        debugger;// hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.listCommon = res.body.body;
      } else {
        console.error('Danh sách tỉnh:', res.responseMessage);
      }
    })
  }
  async getProvince(){
    this.locationService.listProvince().subscribe(res=>{
      if (res && res.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.listProvince = res.body;
      } else {
        console.error('Danh sách tỉnh:', res.responseMessage);
      }
    })
  }
  async getDistrict(item:any){
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
  async getWard(item:any){
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
  async getListUser(){
    const body={
      workSpaceId:this.workSpaceId
    }
    this.userService.listUserWorkSpaceId(body).subscribe(res => {
      if (res && res.body.responseCode === '200') { // hoặc Constant.HTTP_ERROR.ERROR_SUCCESS nếu bạn định nghĩa
        this.listUser = res.body.body;
        this.listUser = this.listUser.map(u => ({
          ...u,
          displayName: `${u.username} - ${u.fullname}`
        }));
      } else {
        console.error('Lỗi lấy danh sách cửa hàng:', res.responseMessage);
      }
    }, error => {
      console.error('Lỗi kết nối đến server:', error);
    });
  }
  onSubmit(): void {
    this.customerForm.get("danhSachGapMat")?.setValue(JSON.stringify(this.customerForm.value.meets));
    console.log(this.customerForm.get("danhSachGapMat").value);
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    if (this.selectedFiles === undefined) {
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
    const v = this.customerForm.value;
    this.isLoading = true;
    const data = this.customerForm.value;
    this.customerService.insertOrUpdate(data).subscribe({
      next: (res) => {
        if (res.body?.body === true) {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Cập nhật thành công',
            showConfirmButton: false,
            timer: 2000
          }).then(() => {
            this.goBack();
          });
        } else {
          this.showError('Đã có lỗi xảy ra, vui lòng thử lại');
        }
        this.isLoading = false;
        
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

loadProvincePromise(): Promise<void> {
  return new Promise((resolve) => {
    this.locationService.listProvince().subscribe({
      next: (res) => {
        if (res && res.responseCode === '200') {
          this.listProvince = res.body;
        }
        resolve();
      },
      error: () => resolve()
    });
  });
}

loadDistrictPromise(provinceCode: any): Promise<void> {
  return new Promise((resolve) => {
    const body = { code: provinceCode };
    this.locationService.listDistrict(body).subscribe({
      next: (res) => {
        if (res && res.body.responseCode === '200') {
          this.listDistrict = res.body.body;
        }
        resolve(); // Báo hiệu đã tải xong
      },
      error: () => resolve() // Lỗi cũng báo xong để code không bị treo
    });
  });
}

loadWardPromise(districtCode: any): Promise<void> {
  return new Promise((resolve) => {
    const body = { code: districtCode };
    this.locationService.listWard(body).subscribe({
      next: (res) => {
        if (res && res.body.responseCode === '200') {
          this.listWard = res.body.body;
        }
        resolve(); // Báo hiệu đã tải xong
      },
      error: () => resolve()
    });
  });
}

toggleDropdown(forceOpen?: boolean) {
  this.dropdownOpen = forceOpen ?? !this.dropdownOpen;
  this.activeTab = 'tinh';
}

// dinh dang tien 

formatCurrency(controlName: string, event: any) {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/[^\d]/g, ''); // bỏ hết ký tự không phải số

  if (value) {
    // chuyển về dạng có dấu phẩy
    value = new Intl.NumberFormat('en-US').format(Number(value));
  }

  input.value = value;

  // Cập nhật lại giá trị trong FormControl (bỏ dấu phẩy để dễ lưu)
  const numericValue = value.replace(/,/g, '');
  this.formGroup.get(controlName)?.setValue(numericValue, { emitEvent: false });
}
//  quay lai 
  goBack() {
  this._location.back(); // Quay lại trang danh sách
}
  isOwner: boolean = false;
checkOwner() {
    
    let token = localStorage.getItem('authData'); 

    if (token) {
      try {
      
        token = token.replace(/"/g, '');
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const user = JSON.parse(jsonPayload);


        if (user.role == this.ROLE.ADMIN_COMPANY) {
            this.isOwner = true;
        } else {
            this.isOwner = false;
        }

      } catch (e) {
        this.isOwner = false;
      }
    }
  }
}
