import { Dispatch } from 'react';
import { Project } from '../models';

export enum ActionType {
  SetCount = 'setCount',
  SetProject = 'setProject',
  NewProject = 'newProject',
  EditProject = 'editProject',
  DeleteProject = 'deleteProject',
  UpsertProject = 'upsertProject',
  SetView = 'setView',
  SetMode = 'setMode',
  SetIssue = 'setIssue',
  SetResult = 'setResult',
  CrawlProject = 'crawlProject',
  CrawlComplete = 'crawlComplete',
  CrawlCancelled = 'crawlCancelled',
  ShowToast = 'showToast'
}

export enum StateModeType {
  New = 'new',
  Edit = 'edit'
}

export enum StateViewType {
  Form = 'form',
  Project = 'project',
  Crawling = 'crawling'
}

export interface IToast {
  show: boolean;
  message: string;
}

export interface IAction {
  type: ActionType;
  payload: {
    active: Project;
    result: number;
    issue: any;
    view: StateViewType;
    project: Project,
    mode: StateModeType,
    toast: IToast
  };
}

export interface IState {
  projects: Project[];
  active?: Project|null;
  project?: Project|null;
  result?: number|null;
  issue?: any|null;
  view: StateViewType;
  mode: StateModeType;
  toast?: IToast
};

export interface IContext {
  state: IState;
  dispatch: Dispatch<IAction>;
}
