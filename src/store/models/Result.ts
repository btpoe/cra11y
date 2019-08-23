export class Result {
  url: string;
  ally: any;

  constructor(params: any) {
    this.url = params.url;
    this.ally = params.ally || {};
  }
}
