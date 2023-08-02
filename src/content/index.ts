import { btnGroup, cardImgEl, cardTextEl, domainBtn, headerEl, normalBtn } from '../lib/dom';
import { getOriginalInformation, getDomainInformation } from '../lib/card';
import Card from '../models/card';

var card: Card | undefined = undefined;
var domainInfo: any = undefined;

const manageDOM = () => {
  if (!headerEl || !cardTextEl || !cardImgEl) return;
  normalBtn.addEventListener('click', (e) => {
    normalBtn.classList.add('btn-primary');
    domainBtn.classList.add('btn-secondary');
    normalBtn.classList.remove('btn-secondary');
    domainBtn.classList.remove('btn-primary');
    if (!cardTextEl) return;
    cardTextEl.textContent = card?.desc ?? null;
  });
  domainBtn.addEventListener('click', (e) => {
    domainBtn.classList.add('btn-primary');
    normalBtn.classList.add('btn-secondary');
    domainBtn.classList.remove('btn-secondary');
    normalBtn.classList.remove('btn-primary');
    if (!cardTextEl) return;
    cardTextEl.textContent = domainInfo?.desc ?? null;
  });

  btnGroup.append(normalBtn);
  btnGroup.append(domainBtn);

  headerEl.append(btnGroup);
}

const main = async () => {
  if (!headerEl || !cardTextEl || !cardImgEl) return;
  // @ts-expect-error
  const imgName = cardImgEl.src.split('/').pop();
  const id = imgName.split('.')[0];

  card = await getOriginalInformation(id);
  domainInfo = await getDomainInformation(card);
  console.log(card);
  console.log(domainInfo);
}

main();
manageDOM();

export {}
