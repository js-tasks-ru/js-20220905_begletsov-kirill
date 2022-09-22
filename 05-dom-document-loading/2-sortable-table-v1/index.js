export default class SortableTable {

  element;
  updatedData;

  subElements;

  constructor(headerConfig = [], data = []) {
    this.headerConfig = [...headerConfig];
    this.data = [...data];

    this.render();
  }

  render(){
    const table = document.createElement("div");
    table.className = "sortable-table";
    table.innerHTML = this.temlate;

    this.element = table;
    this.subElements = this.getSubElements(this.element)
  }

  getHeaderConfig(data){
    return data.map(item => {
      return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}">
        <span>${item.title}</span>
      </div>`
    }).join("");
  }

  getData(header, data){
    const head = header.map(item => item.id);
    let result = [];
    for (const item of head) {
      for (const [key, value] of Object.entries(data)) {
        if (item === key) {
          if (item === "images") {
            result.push(`<div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="#">
          </div>`)
          continue;
          }
          result.push(`<div class="sortable-table__cell">${value}</div>`)
        }
      }
    }
    return result.join("");
  }

  getBodyData(data){
    return data.map(item => {
      return `<a href="/products/${item.id}" class="sortable-table__row">
       ${this.getData(this.headerConfig, item)}
      </a>`
    }).join("");
  }

  get temlate(){
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderConfig(this.headerConfig)}
      </div>
      <div data-element="body" class="sortable-table__body">
        ${this.getBodyData(this.data)}
      </div>
    `
  }
  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  sort(field, order){
    this.updatedData = this.sortFields(this.data, order,field);
    this.update(this.updatedData);
  }

  update(data){
    this.subElements.body.innerHTML = this.getBodyData(data)
    
  }

  sortFields(data, param = 'asc', field) {
    const directions = {
        asc: 1,
        desc: -1
    };

    return [...data].sort((a,b) => {
      if (typeof a[field] === "number") {
        return directions[param] * (a[field] - b[field])
      }else {
        return directions[param] *  a[field].localeCompare(b[field],['ru','en'], {caseFirst:'upper'});
      }
    });
  }
  destroy(){
    this.element.remove();
    this.subElements = {};
  }
}

