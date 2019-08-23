import React, { useContext } from 'react';
import './styles.css';
import { IonList, IonListHeader, IonLabel, IonItem, IonBadge } from '@ionic/react';
import { AppContext } from '../../store';
import { ActionType } from '../../store/types';

interface ResultPaneProps {
  show: boolean
}
interface List {
  label: string;
  value: string;
  color: string;
}

const ResultPane: React.FunctionComponent<ResultPaneProps> = (props) => {
  const { state, dispatch } = useContext<any>(AppContext);

  if (!props.show) {
    return null;
  }

  const listMap: List[] = [
    { label: 'Violations', value: 'violations', color: 'primary' },
    { label: 'Incomplete', value: 'incomplete', color: 'secondary' },
    { label: 'Inapplicable', value: 'inapplicable', color: 'tertiary' },
    { label: 'Passes', value: 'passes', color: 'success' },
  ];

  const setIssue = (issue: any) => {
    dispatch({ type: ActionType.SetIssue, payload: { issue } })
  }

  const generateList = (list: List, index: number) => {
    const { active, result: resultIndex } = state;
    const activeResult = active.results[resultIndex];
    const issues = activeResult.ally[list.value];

    return (
      <IonList key={index}>
        <IonListHeader>
          <IonLabel>
            {list.label}
          </IonLabel>
        </IonListHeader>
        {(issues||[]).map((issue: any, i: number) => (
          <IonItem lines="full" key={issue.id + i} onClick={() => setIssue(issue)}>
            <IonLabel text-wrap={true}>
              <h3>{issue.help}</h3>
              {issue.impact && <p>Impact: {issue.impact}</p>}
            </IonLabel>
            <IonBadge slot="end" color={list.color}>
              <IonLabel>
                {issue.nodes.length}
              </IonLabel>
            </IonBadge>
          </IonItem>
        ))}
      </IonList>
    );
  }

  return (
    <div className="result-pane">
      {listMap.map((list: List, index: number) => generateList(list, index))}
    </div>
  );
};

ResultPane.defaultProps = {
  show: true
};

export default ResultPane;
