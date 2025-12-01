import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {TranslateService} from "@ngx-translate/core";
import { MediaService } from 'src/app/core/services/services-app/media.service';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './media-dialog.component.html'
})
export class MediaDialogComponent implements OnInit {
  title: string = '';
  inputData: any;
  role:any;
  checkAction: any;
  dataForm: FormGroup = this.fb.group({
    id: [null],
    url: [null]
  });
  constructor(public modal: NgbActiveModal,
              private translateService: TranslateService,
              public mediaService: MediaService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    if (this.inputData) {
      this.dataForm.patchValue(this.inputData);
      this.role=this.dataForm.get("role").value;
    }
  }
  save() {
    if (this.dataForm.invalid || !this.selectedFile) {
      this.dataForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('type', '1'); // Giá trị ví dụ
    formData.append('typeId', '123'); // Giá trị ví dụ

    this.mediaService.uploadMedia(formData).subscribe({
      next: (res) => {
        this.modal.close(res);
      },
      error: (err) => {
        console.error("Upload thất bại", err);
      }
    });
  }

  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
      this.selectedFile = null;
    }
  }





}

