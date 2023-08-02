import getAllCardsInDomain, { csvMaker } from '../lib/domainToCsv';
import { downloadCsvInServiceWorker } from '../lib/utils';
import Card, { CardDomain } from '../models/card';

var card: Card | undefined = undefined;
var domainInfo: CardDomain | undefined = undefined;

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    let rule = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { urlMatches: 'ygoprodeck\.com\/card\/' },
        })
      ],
      actions: [new chrome.declarativeContent.ShowAction()],
    };
    
    chrome.declarativeContent.onPageChanged.addRules([rule]);
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!card || !domainInfo) return;
  
  let list: any = await getAllCardsInDomain(domainInfo, true);
  
  for (let i = 0; i < list.data.length; i++) {
    const curcode = 'DOMA-' + i.toString();
    list.data[i].cardname = '"' + list.data[i].name.replaceAll('"','""') + '"';
    delete list.data[i].name;
    list.data[i].cardid = list.data[i].id;
    delete list.data[i].id;
    list.data[i].cardq = '1';
    list.data[i].cardcode = curcode;
  }

  const csv = csvMaker(list);
  downloadCsvInServiceWorker(csv, card.name);
});

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg.card || !msg.domainInfo) {
    chrome.action.setTitle({ title: "Domain info isn't available." });
    return;
  }

  if (msg.action === 'set-card-info') {
    console.log(msg.card);
    console.log(msg.domainInfo);
    
    chrome.action.setTitle({ title: "Download all cards in this card domain in a .csv file" });
    card = msg.card;
    domainInfo = msg.domainInfo;
    return;
  }
})

export {}
