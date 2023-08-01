// #region New DOM elements 
const _normalBtn = document.createElement('button');
_normalBtn.type = 'button';
_normalBtn.className = `mr-2 btn btn-sm btn-primary`;
_normalBtn.title = 'Hide Domain information for the current card';
_normalBtn.innerText = 'Normal';

const _domainBtn = document.createElement('button');
_domainBtn.type = 'button';
_domainBtn.className = `btn btn-sm btn-secondary`;
_domainBtn.title = 'Display Domain information for the current card';
_domainBtn.innerText = 'Domain';

const _btnGroup = document.createElement('span');
_btnGroup.className = 'information-toggler ml-3';
// #endregion

// #region Existing DOM elements 
export const headerEl = document.querySelector('.column2 .card-data-info')?.nextElementSibling;
export const cardTextEl = document.querySelector('.column2 .card-text');
export const cardImgEl = document.querySelector('.column1 .card-image img');
export const normalBtn = _normalBtn;
export const domainBtn = _domainBtn;
export const btnGroup = _btnGroup;
// #endregion
