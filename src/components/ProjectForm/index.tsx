import React, { useState, useContext, useEffect } from 'react';
import { IonGrid, IonRow, IonCol, IonItem, IonLabel, IonInput, IonCheckbox, IonList, IonButton, IonIcon, IonAlert } from '@ionic/react';
import { closeCircleOutline } from 'ionicons/icons';
import { Project, AppContext } from '../../store';
import { ActionType, StateModeType } from '../../store/types';
import './styles.scss';
import _ from 'lodash';

const ProjectForm: React.FunctionComponent = () => {
  const project: Project = new Project({
    name: 'Boplex Audit',
    tags: [],
    useJs: true,
    home: 'http://dev.boplex.com',
    numPages: 1,
    results: [],
    timestamp: (new Date()).toDateString()
  });

  const tagValues = [
    { label: 'WCAG A', value: 'wcag2a', checked: true },
    { label: 'WCAG AA', value: 'wcag2aa' },
    { label: 'Section 508', value: 'section508' },
    { label: 'Best Practice', value: 'best-practice', checked: true },
  ];

  const { state, dispatch } = useContext<any>(AppContext);
  const [formValue, setFormValues] = useState<any>(state.mode === StateModeType.Edit ? state.active : project);
  const [valid, isValid] = useState<any>(false);
  const [tags, setTags] = useState<any>(tagValues);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (formValue.home) {
      isValid(true);
    } else {
      isValid(false);
    }
  }, [formValue.home]);

  const updateFormField = (key: string, value: any) => {
    const newValues = _.merge(formValue, { [key]: value });
    setFormValues({
      ...newValues
    });
  }

  const updateTags = (tag: any, checked: boolean) => {
    const index = tags.findIndex((t: any) => t.value === tag.value);
    tags[index].checked = checked;
    setTags(tags)
  }

  const submitForm = (e: any) => {
    e.preventDefault();
    saveProject();
  }

  const cancelForm = () => {
    dispatch({ type: ActionType.SetView, payload: { view: 'project' } })
  }

  const saveProject = () => {
    const project = {
      ...formValue,
      tags
    };
    dispatch({ type: ActionType.CrawlProject, payload: { project } });
  }

  const deleteProject = () => {
    dispatch({ type: ActionType.DeleteProject, payload: { project: formValue }});
    dispatch({ type: ActionType.ShowToast, payload: { toast: { show: true, message: 'Your project has been deleted.' } } });
  }

  const heading = () => {
    if (state.mode === StateModeType.Edit) {
      return `Edit Project ${state.active.name}`;
    }
    return 'Create New Project';
  }

  return (
    <div className="project-form">
      {state.projects.length > 0 &&
        <IonIcon onClick={() => cancelForm()} className="project-form-close" icon={closeCircleOutline} />
      }
      <form className="project-form-container" onSubmit={(e: any) => submitForm(e)}>
        <IonGrid>
          <IonRow>
            <IonCol size="8">
              <h1 className="project-form-title">{heading()}</h1>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <IonItem lines="none">
                <IonLabel position="floating">
                  <h3>Project Name</h3>
                </IonLabel>
                <IonInput
                  type="text"
                  name="name"
                  value={formValue.name}
                  onIonChange={(e) => updateFormField('name', e.detail.value)}
                />
              </IonItem>
            </IonCol>
            <IonCol size="6">
              <IonItem lines="none">
                <IonLabel position="floating">
                  <h3>Number of Pages</h3>
                </IonLabel>
                <IonInput
                  type="number"
                  name="numPages"
                  value={formValue.numPages}
                  onIonChange={(e) => updateFormField('numPages', e.detail.value)}
                />
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonItem lines="none">
                <IonLabel position="floating">
                  <h3>Home Page Url</h3>
                </IonLabel>
                <IonInput
                  type="url"
                  name="home"
                  disabled={state.mode === StateModeType.Edit}
                  value={formValue.home}
                  onIonChange={(e) => updateFormField('home', e.detail.value)}
                />
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonItem lines="none">
                <IonLabel text-wrap>
                  <h3>Enable Javascript</h3>
                  <p>Warning: This may cause crawling to take longer.</p>
                </IonLabel>
                <IonCheckbox
                  slot="end"
                  color="primary"
                  name="useJs"
                  checked={formValue.useJs}
                  onIonChange={(e) => updateFormField('useJs', !formValue.useJs)}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2>A11y Settings</h2>
            </IonCol>
          </IonRow>
          <IonRow className="project-form-group">
            <IonCol>
              <IonList>
                {tagValues.map((tag: any, i: number) => (
                  <IonItem key={i} lines="none">
                    <IonLabel>
                      {tag.label}
                    </IonLabel>
                    <IonCheckbox slot="end" value={tag.value} checked={tag.checked} color="primary" onIonChange={(e) => updateTags(tag, e.detail.checked)}/>
                  </IonItem>
                ))}
              </IonList>
            </IonCol>
          </IonRow>

          <IonRow className="project-form-submit">
            <IonCol>
              <IonButton disabled={!valid} type="submit" color="primary">
                Create
              </IonButton>
              {state.mode === StateModeType.Edit &&
                <IonButton color="danger" onClick={() => setShowAlert(true)}>
                  Delete Project
                </IonButton>
              }
            </IonCol>
          </IonRow>
        </IonGrid>
      </form>
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={'Deleting Project'}
        subHeader={formValue.name}
        message={'Are you sure you want to delete this project? This action is not reversible.'}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
          }, {
            text: 'Confirm',
            handler: () => {
              deleteProject();
            }
          }
        ]}
      />
    </div>
  );
};

export default ProjectForm;
