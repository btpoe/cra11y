export class Page {
  url: string;
  html: any;

  constructor(params: any) {
    this.url = params.url;
    this.html = params.html;
  }
}
