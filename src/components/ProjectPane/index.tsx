import React, { useContext } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonGrid, IonRow, IonCol } from '@ionic/react';
import { AppContext } from '../../store';
import './styles.scss';
import ResultPane from '../ResultPane';
import IssuePane from '../IssuePane';

interface ProjectPaneProps {
  show?: boolean
}

const ProjectPane: React.FunctionComponent<ProjectPaneProps> = (props) => {
  const { state } = useContext<any>(AppContext);

  if (!props.show) {
    return null;
  }

  const result = state.active.results[state.result];

  return (
    <div className="project-pane">
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <h2>{result.url}</h2>
            <p>{state.active.timestamp}</p>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <div className="project-pane-body">
        <IonGrid>
          <IonRow>
            <IonCol size="3">
              <ResultPane
                show={true}
              />
            </IonCol>
            <IonCol size="9">
              <IssuePane
                show={true}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </div>
    </div>
  );
};

ProjectPane.defaultProps = {
  show: true
};

export default ProjectPane;
