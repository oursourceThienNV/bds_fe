import {Directive, EventEmitter, HostListener, Output} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";

@Directive({
  selector: '[appDnd]'
})
export class DndDirective {
  @Output('files') files: EventEmitter<FileList> = new EventEmitter();

  constructor(private sanitizer: DomSanitizer) {
  }

  @HostListener('dragover', ['$event'])
  public onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  @HostListener('drop', ['$event'])
  public onDrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    const files = evt.dataTransfer.files;
    this.files.emit(files)
  }
}
