export class ModalDto {
  type: "WARNING" | "ERROR" | "SUCCESS" | "NOTIFY" | undefined;
  title?: string | undefined;
  content?: string | undefined
  acceptBtnLabel?: string | undefined;
  closeBtnLabel?: string | undefined;

  constructor(type: "WARNING" | "ERROR" | "SUCCESS" | "NOTIFY" | undefined, title: string | undefined, acceptBtnLabel: string | undefined, closeBtnLabel: string | undefined, content: string | undefined) {
    this.type = type;
    this.title = title;
    this.content = content;
    this.acceptBtnLabel = acceptBtnLabel;
    this.closeBtnLabel = closeBtnLabel;
  }
}
