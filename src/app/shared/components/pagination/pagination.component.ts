import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {
  @Input() page;
  @Input() pageSize;
  @Input() collectionSize;
  @Output() pageChange = new EventEmitter();
  @Output() pageSizeChange = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
  }

  onPageChange(event: number) {
    this.pageChange.emit(event);
  }

  pageSizeChangeEvent(event: number) {
    this.pageSizeChange.emit(this.pageSize);
  }
}
