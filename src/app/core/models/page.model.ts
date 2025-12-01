export interface IPage {
  // The number of elements in the page
  size?: number;
  // The total number of elements
  totalElements?: number;
  // The total number of pages
  totalPages?: number;
  // The current page number
  pageNumber?: number;
}

export class Page implements IPage {
  constructor(public size?: number, public totalElements?: number, public totalPages?: number, public pageNumber?: number) {
    // The number of elements in the page
    this.size = size || 0;
    // The total number of elements
    this.totalElements = totalElements || 0;
    // The total number of pages
    this.totalPages = totalPages || 0;
    // The current page number
    this.pageNumber = pageNumber || 0;
  }
}
