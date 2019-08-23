import React, { useContext } from 'react';
import './styles.css';
import { IonToast } from '@ionic/react';
import { AppContext } from '../../store';
import { ActionType } from '../../store/types';

const ElectronWindow: React.FunctionComponent = (props) => {
  const { state, dispatch } = useContext<any>(AppContext);

  return (
    <div className="electron-window">
      {props.children}

      <IonToast
        isOpen={state.toast.show}
        position="top"
        onDidDismiss={() => dispatch({ type: ActionType.ShowToast, payload: { toast: { show: false, message: '' } } })}
        message={state.toast.message}
        duration={3000}
      />
    </div>
  );
};

export default ElectronWindow;
