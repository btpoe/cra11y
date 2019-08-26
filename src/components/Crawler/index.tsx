import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { IonCard, IonCardContent, IonSpinner, IonProgressBar, IonButton } from '@ionic/react';
import axe from 'axe-core';
import './styles.scss';
import { AppContext, Page, Result } from '../../store';
// import { webpage } from '../../util/electron';
import { ipcRenderer } from 'electron';
import { ActionType } from '../../store/types';

const getLinks = (doc: Document) => {
  const host = new URL(doc.URL).origin;

  return [...doc.querySelectorAll('a[href]')]
    .filter((link: any) => (
      new URL(link.href, host).origin === host
    ))
    .map((link: any) => (
      new URL(link.href.split('#')[0], host)
        .href
        .replace(/\/$/, '')
    ));
};

const Crawler: React.FunctionComponent = (props) => {
  const {
    state: {
      active = {},
    },
    dispatch,
  } = useContext<any>(AppContext);

  // using memo instead of state because we don't need this to trigger a render
  const requested = useMemo<Set<string>>(() => new Set(), []);
  const [crawled, setCrawled] = useState<Page[]>([]);

  const {
    home = '',
    numPages = 1,
    useJs = false,
  } = active;

  const cancelCrawl = useCallback(() => {
    dispatch({ type: ActionType.CrawlCancelled, payload: {} });
    ipcRenderer.send('crawl-flush');
  }, [dispatch]);

  useEffect(() => {
    console.log('useEffect => crawl-reply listener');

    const sendCrawlRequest = (url: string) => {
      if (requested.size < numPages && !requested.has(url)) {
        requested.add(url);
        ipcRenderer.send('crawl-async', { url, useJs });
      }
    };

    const handleCrawlReply = (event: Electron.IpcRendererEvent, args: any) => {
      // make document
      const doc = document.implementation.createHTMLDocument(`Cra11y ${args.url}`);
      const base = document.createElement('base');
      base.setAttribute('href', args.url);
      doc.documentElement.innerHTML = args.html;
      doc.getElementsByTagName('head')[0].appendChild(base);

      const page: Page = new Page({
        url: args.url,
        report: args.report
      });

      setCrawled(crawled => [...crawled, page]);
      getLinks(doc).forEach(sendCrawlRequest);
    };

    const handleCrawlFail = (event: Electron.IpcRendererEvent, args: any) => {
      requested.delete(args.url);
    };

    ipcRenderer.on('crawl-reply', handleCrawlReply);
    ipcRenderer.on('crawl-fail', handleCrawlFail);

    sendCrawlRequest(home);

    return () => {
      ipcRenderer.removeListener('crawl-reply', handleCrawlReply)
      ipcRenderer.removeListener('crawl-fail', handleCrawlFail);
    };
  }, [home, requested, numPages, useJs]);

  useEffect(() => {
    console.log('useEffect => we done');
    // analyize
    (async () => {
      const project = active;
      project.results = [];

      const axeOpts: any = {
        runOnly: {
          type: 'tag',
          values: project.tags.filter((t: any) => t.checked).map((t: any) => t.value) || ['wcag2a', 'best-practice']
        },
        resultTypes: ['violations', 'incomplete', 'inapplicable', 'passes']
      };

      for (const page of crawled) {
        const result = await axe.run(page.html, axeOpts);
        project.results.push(new Result({ url: page.url, ally: result }));
      }

      dispatch({ type: ActionType.CrawlComplete, payload: { project } });
      dispatch({ type: ActionType.ShowToast, payload: { toast: { show: true, message: 'Your project has been created.' } } });
    })();
  }, [
    crawled,
    active,
    dispatch,
  ]);

  return (
    <div className="crawler show">
      <IonCard>
        <IonCardContent>
          <div className="progress-container">
            {crawled.length > 0 ? (
              <div>
                <h2>{crawled.length} of {numPages}</h2>
                <IonProgressBar value={crawled.length / numPages} />
                <p>{crawled[crawled.length - 1].url}</p>
                <IonButton color="danger" onClick={cancelCrawl}>
                  Cancel
                </IonButton>
              </div>
            ) : (
              <div>
                <IonSpinner />
              </div>
            )}
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default Crawler;
