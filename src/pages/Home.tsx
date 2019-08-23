import React, { useContext } from 'react';
import ElectronWindow from '../components/ElectronWindow';
import UrlPane from '../components/UrlPane';
import ProjectPane from '../components/ProjectPane';
import { AppContext } from '../store';
import ProjectForm from '../components/ProjectForm';
import Crawler from '../components/Crawler';
import { StateViewType } from '../store/types';

const Home: React.FunctionComponent = () => {
  const { state } = useContext<any>(AppContext);

  const viewMap: any = {
    [StateViewType.Form]: ProjectForm,
    [StateViewType.Project]: ProjectPane,
    [StateViewType.Crawling]: Crawler
  };

  const getView = () => {
    const Component = viewMap[state.view];
    return (
      <Component />
    )
  }

  return (
    <ElectronWindow>
      <UrlPane />
      {getView()}
    </ElectronWindow>
  );
};

export default Home;
