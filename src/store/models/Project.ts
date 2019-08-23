import * as uuid from 'uuid';
import _ from 'lodash';
import { Result } from './Result';

export class Project {
  id?: string;
  name?: string;
  tags?: string[];
  useJs?: boolean;
  home: string;
  numPages?: number;
  results: Result[];
  timestamp: Date;

  constructor(params: any) {
    this.id = params.id || uuid.v4();
    this.name = params.name || 'Crawl Report';
    this.tags = params.tags || ['wcag2a', 'best-practice'];
    this.results = params.results || [];
    this.timestamp = params.timestamp || (new Date()).toDateString();
    this.useJs = params.useJs || true;
    this.home = params.home;
    this.numPages = params.numPages || 1;
  }

  update(params: any) {
    _.merge(this, params);
    return this;
  }

  get isValid() {
    for (const prop of this.rules) {
      if (!_.get(this, prop)) {
        return false;
      }
    }
    return true;
  }

  get rules(): any {
    return [
      'id', 'name', 'tags', 'home', 'numPages'
    ];
  }
}
