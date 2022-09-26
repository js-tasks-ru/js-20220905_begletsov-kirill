export default class SortableTable {

  element;
  sortedData;

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
        <span data-element="arrow" class = "sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>`
    }).join("");
  }

  getData(item){
    const cells = this.headerConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    })

    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`
    }).join("");
  }

  getBodyData(data){
    return data.map(item => {
      return `<a href="/products/${item.id}" class="sortable-table__row">
       ${this.getData(item)}
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
    this.sortedData = this.sortFields(this.data, order,field);
    const allColumns = this.element.querySelectorAll(".sortable-table__cell[data-id]");
    const column = this.element.querySelector(`[data-id = "${field}"]`);

    allColumns.forEach(column => {
      column.dataset.order = "";
    });

    column.dataset.order = order;
    
    this.update(this.sortedData)
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
      }else if (typeof a[field] === "string"){
        return directions[param] *  a[field].localeCompare(b[field],['ru','en'], {caseFirst:'upper'});
      }else{
        throw new Error('Unknown type');
      }
    });
  }
  destroy(){
    this.element.remove();
    this.subElements = {};
  }
}

