import React, { createContext, useReducer } from "react";
import { Project } from './models';
import { IState, ActionType, IAction, IContext, StateViewType, StateModeType } from './types';
import { get, store, destroy, upsert } from '../util';
import _ from 'lodash';

const allProjects: Project[] = [];
const lsState: any = get('state');

export const initialState: IState = {
  projects: allProjects,
  active: null, //allProjects[0],
  result: null, //allProjects[0].results[0],
  issue: null,
  view: StateViewType.Form,
  mode: StateModeType.New,
  toast: {
    show: false,
    message: ''
  }
}

const AppContext = createContext<any>(initialState);

export const reducer = (state: IState, action: IAction) => {
  let newState: IState = state;
  switch (action.type) {
    case ActionType.ShowToast: {
      newState = { ...state, toast: action.payload.toast };
      break;
    }
    case ActionType.SetProject: {
      newState = { ...state, active: action.payload.active, result: 0, issue: _.get(action.payload.active, 'results.0.ally.violations.0') }
      break;
    }
    case ActionType.SetView: {
      newState = { ...state, view: action.payload.view }
      break;
    }
    case ActionType.SetMode: {
      newState = { ...state, mode: action.payload.mode }
      break;
    }
    case ActionType.SetIssue: {
      newState = { ...state, issue: action.payload.issue }
      break;
    }
    case ActionType.SetResult: {
      newState = { ...state, result: action.payload.result }
      break;
    }
    case ActionType.NewProject: {
      newState = { ...state, view: StateViewType.Form, mode: StateModeType.New }
      break;
    }
    case ActionType.EditProject: {
      newState = { ...state, view: StateViewType.Form, mode: StateModeType.Edit }
      break;
    }
    case ActionType.DeleteProject: {
      const projects = destroy(_.cloneDeep(state.projects) || [], action.payload.project, 'id');
      newState = {
        ...state,
        projects,
        view: projects.length ? StateViewType.Project : StateViewType.Form,
        mode: projects.length ? StateModeType.Edit : StateModeType.New,
        active: projects[0],
        result: 0,
        issue: _.get(projects[0], 'results.0.ally.violations.0')
      }
      break;
    }
    case ActionType.UpsertProject: {
      const projects = upsert(state.projects || [], action.payload.project, 'id');
      newState = { ...state, projects };
      break;
    }
    case ActionType.CrawlProject: {
      const projects = upsert(state.projects || [], action.payload.project, 'id');
      newState = { ...state, projects, active: action.payload.project, view: StateViewType.Crawling }
      break;
    }
    case ActionType.CrawlComplete: {
      const projects = upsert(state.projects || [], action.payload.project, 'id');
      newState = { ...state, projects, active: action.payload.project, result: 0, issue: _.get(projects[0], 'results.0.ally.violations.0'), view: StateViewType.Project };
      break;
    }
    case ActionType.CrawlCancelled: {
      const projects = destroy(state.projects || [], state.active, 'id');
      newState = {
        ...state,
        projects,
        active: null,
        result: 0,
        issue: null,
        view: StateViewType.Form,
        mode: StateModeType.New
      };
      break;
    }
  }

  store('state', newState);
  return newState;
};

function AppContextProvider(props: any) {
  const fullInitialState: IState = Object.assign(initialState, lsState);

  // console.log('fullInitialState', fullInitialState);

  const [state, dispatch] = useReducer<React.Reducer<IState, IAction>>(reducer, fullInitialState);
  const value: IContext = { state, dispatch };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
}

const AppContextConsumer = AppContext.Consumer;

export { AppContext, AppContextProvider, AppContextConsumer };
