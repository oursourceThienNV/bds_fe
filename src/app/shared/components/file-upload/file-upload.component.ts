import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  listFile: any[] = []

  constructor() {
  }

  ngOnInit(): void {
  }

  openUploadCVFile(event: any) {
    console.log(event.target.files)
  }

}
