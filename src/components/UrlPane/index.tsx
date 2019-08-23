import { IonIcon, IonButtons, IonContent, IonPopover, IonHeader, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonLabel, IonSearchbar, IonBadge } from '@ionic/react';
import React, { useState, useContext } from 'react';
import { arrowDropdown, addCircleOutline } from 'ionicons/icons';
import ProjectPopover from '../ProjectPopover/index';
import { AppContext, Project, Result } from '../../store';
import { ActionType } from '../../store/types';
import './styles.scss';

const UrlPane: React.FunctionComponent = () => {
  const { state, dispatch } = useContext<any>(AppContext);
  const [showPopover, setShowPopover] = useState<any>({ show: false, event: null });
  const [searchValue, setSearchValue] = useState<any>('');

  const switchProject = (project: Project) => {
    dispatch({ type: ActionType.SetProject, payload: { active: project } })
    setShowPopover({ show: false });
  }

  const editProject = () => {
    dispatch({ type: ActionType.EditProject, payload: { active: state.active } });
    setShowPopover({ show: false });
  }

  const newProject = () => {
    dispatch({ type: ActionType.NewProject, payload: {} });
    setShowPopover({ show: false });
  }

  const setResult = (index: number) => {
    dispatch({ type: ActionType.SetResult, payload: { result: index } });
  }

  const updateSearchValue = (value: string) => {
    setSearchValue(value);
  }

  const getResults = () => {
    if (!searchValue) {
      return state.active ? state.active.results : [];
    }

    return (state.active.results || []).filter((result: Result) => {
      return result.url.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
    })
  }

  const header = () => {
    if (!state.active) {
      return (
        <IonToolbar>
          <IonTitle>Create New Project</IonTitle>
          <IonButtons slot="end">
            <IonButton
              icon-only={true}
              onClick={(e) => newProject()}
            >
              <IonIcon slot="icon-only" icon={addCircleOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      );
    }

    return (
      <IonToolbar>
        <IonTitle>{state.active.name}</IonTitle>
        <IonButtons slot="end">
          <IonButton
            icon-only={true}
            onClick={(e: any) => {
              e.persist();
              setShowPopover({ show: true, event: e })
            }}
          >
            <IonIcon slot="icon-only" icon={arrowDropdown} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    );
  }

  return (
    <div className="url-pane">
      <div className="spacer" />
      <IonHeader>
        {header()}
      </IonHeader>
      <IonContent>
        {state.active &&
          <IonToolbar>
            <IonSearchbar mode="ios" color="light" animated={true} value={searchValue} onIonChange={(e: CustomEvent) => updateSearchValue(e.detail.value)} />
            <IonButtons slot="end">
              <IonButton
                onClick={() => newProject()}
                icon-only={true}
              >
                <IonIcon color="light" slot="icon-only" icon={addCircleOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        }
        <IonList>
          {getResults().map((result: Result, index: number) => (
            <IonItem lines="full" key={index} onClick={() => setResult(index)}>
              <IonLabel text-wrap={true}>
                <h3>{result.url}</h3>
                <p>{state.active.timestamp}</p>

                <div className="badge-list">
                  <IonBadge color="primary">
                    {result.ally.violations.length}
                  </IonBadge>
                  <IonBadge color="secondary">
                    {result.ally.incomplete.length}
                  </IonBadge>
                  <IonBadge color="tertiary">
                    {result.ally.inapplicable.length}
                  </IonBadge>
                  <IonBadge color="success">
                    {result.ally.passes.length}
                  </IonBadge>
                </div>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
      <IonPopover
        isOpen={showPopover.show}
        event={showPopover.event}
        onDidDismiss={() => setShowPopover({ show: false, event: null })}
      >
        <ProjectPopover
          active={state.active}
          projects={state.projects}
          switchProject={switchProject}
          editProject={editProject}
          newProject={newProject}
        />
      </IonPopover>
    </div>
  );
};

export default UrlPane;
