import React, { useContext, useState, useEffect, useCallback } from 'react';
import { IonCard, IonCardContent, IonSpinner, IonProgressBar, IonButton } from '@ionic/react';
import _ from 'lodash';
import axe from 'axe-core';
import './styles.scss';
import { AppContext, Page, Result } from '../../store';
// import { webpage } from '../../util/electron';
import { ipcRenderer } from 'electron';
import { ActionType } from '../../store/types';

interface CrawlerState {
  started: boolean;
  links: string[];
  crawled: Page[];
  done: boolean;
  nextUrl?: string;
}

const Crawler: React.FunctionComponent = (props) => {
  const { state, dispatch } = useContext<any>(AppContext);
  const [crawlState, setCrawlState] = useState<CrawlerState>({
    started: false,
    done: false,
    nextUrl: '',
    links: [],
    crawled: []
  });

  const latest = () => {
    if (crawlState.started && crawlState.crawled.length) {
      return crawlState.crawled[crawlState.crawled.length - 1].url;
    }
    return '';
  }

  const progress = () => {
    if (!crawlState.started) {
      return 0;
    }
    return crawlState.crawled.length / state.active.numPages;
  }

  const cancelCrawl = () => {
    dispatch({ type: ActionType.CrawlCancelled, payload: {} })
  }

  const getContent = () => {
    if (crawlState.started && crawlState.crawled.length) {
      return (
        <div>
          <h2>{crawlState.crawled.length} of {state.active.numPages}</h2>
          <IonProgressBar value={progress()} />
          <p>{latest()}</p>
          <IonButton color="danger" onClick={() => cancelCrawl()}>
            Cancel
          </IonButton>
        </div>
      );
    }

    return (
      <div>
        <IonSpinner />
      </div>
    );
  }

  const analyze = useCallback(
    async () => {
      const project = state.active;
      project.results = [];

      const axeOpts: any = {
        runOnly: {
          type: 'tag',
          values: project.tags.filter((t: any) => t.checked).map((t: any) => t.value) || ['wcag2a', 'best-practice']
        },
        resultTypes: ['violations', 'incomplete', 'inapplicable', 'passes']
      };

      for (const page of crawlState.crawled) {
        const result = await axe.run(page.html, axeOpts);
        project.results.push(new Result({ url: page.url, ally: result }));
      }

      dispatch({ type: ActionType.CrawlComplete, payload: { project } });
      dispatch({ type: ActionType.ShowToast, payload: { toast: { show: true, message: 'Your project has been created.' } } });
    },
    [state.active, crawlState.crawled, dispatch]
  );

  const getLinks = useCallback(
    (doc: Document) => {
      const links = Array.from(doc.querySelectorAll('a')).filter((link) => {
        return typeof link.href === 'string'
          && (link.href.startsWith(state.active.home)
            || (link.href.startsWith('/') && !link.href.startsWith('#')));
      }).map((link: any) => {
        if (link.href.startsWith(state.active.home)) {
          return link.href.replace(/\/$/, '');
        }
        return `${state.active.home}/${link.href.replace(/\/$/, '')}`;
      });
      return links;
    },
    [state.active.home]
  )

  const crawled = useCallback(
    (url) => {
      return (crawlState.crawled.find((page: Page) => page.url === url));
    },
    [crawlState.crawled]
  );

  useEffect(() => {
    console.log('useEffect => only called once => crawl-reply');

    ipcRenderer.on('crawl-reply', (event: Electron.IpcRendererEvent, args: any) => {
      // make document
      const doc = document.implementation.createHTMLDocument(`Cra11y ${args.url}`);
      const base = document.createElement('base');
      base.setAttribute('href', args.url);
      doc.documentElement.innerHTML = args.response;
      doc.getElementsByTagName('head')[0].appendChild(base);

      const page: Page = new Page({
        url: args.url,
        html: doc
      });

      setCrawlState((s: CrawlerState) => {
        console.log('useEffect => setCrawlState');

        const newLinks = getLinks(page.html);
        const allLinks = _.uniq([...s.links, ...newLinks]);
        const { crawled } = s;
        crawled.push(page);

        return {
          ...s,
          nextUrl: allLinks.shift(),
          crawled,
          links: allLinks
        }
      });

      return page;
    });
  }, [getLinks])

  useEffect(() => {
    if (!crawlState.started) {
      console.log('useEffect => start');
      setCrawlState(s => {
        return {
          ...s,
          links: [],
          nextUrl: state.active.home,
          started: true
        }
      });
    } else {
      console.log('useEffect => keep crawling?');
      if (crawlState.nextUrl && (crawlState.crawled.length < state.active.numPages) && !crawled(crawlState.nextUrl)) {
        console.log('useEffect => continue crawling');
        ipcRenderer.send('crawl-async', {
          url: crawlState.nextUrl,
          useJs: state.active.useJs
        });
      } else {
        console.log('useEffect => we done');
        analyze();
      }
    }
  }, [
    crawlState.started,
    crawlState.nextUrl,
    crawlState.crawled,
    state.active.home,
    state.active.numPages,
    state.active.useJs,
    analyze,
    crawled
  ]);

  return (
    <div className="crawler show">
      <IonCard>
        <IonCardContent>
          <div className="progress-container">
            {getContent()}
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default Crawler;
