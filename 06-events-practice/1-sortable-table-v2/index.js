export default class SortableTable {

  element;

  subElements;

  constructor(headersConfig = [], {
    data = [],
    sorted = {
      id: '',
      order: 'desc'
    }
  } = {}) {

    this.headerConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;


    this.initialize();
  }

  initialize(){
    
    this.render();
    this.sort(this.sorted.id, this.sorted.order);


    const header = this.element.querySelector('[data-element = "header"]');
    
    header.addEventListener("pointerdown", (event) =>{
      let target = event.target.parentElement;
      
      if (!target.dataset.id) {
        target = event.target;
      }

      const field = target.dataset.id;
      const order = this.getOrder(target.dataset.order);
    
      this.sort(field, order);
    })

  }
  render(){
    const table = document.createElement("div");
    table.className = "sortable-table";
    table.innerHTML = this.temlate;

    this.element = table;
    this.subElements = this.getSubElements(this.element);

  }
  getOrder(order){
    return order === "asc" ? "desc" : "asc";
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
    const sortedData = this.sortFields(this.data, order,field);
    this.subElements.body.innerHTML = this.getBodyData(sortedData);

    const allColumns = this.element.querySelectorAll(".sortable-table__cell[data-id]");
    const column = this.element.querySelector(`[data-id = "${field}"]`);

    allColumns.forEach(column => {
      column.dataset.order = "";
    });

    column.dataset.order = order;    
  }

  sortFields(data, param = 'asc', field) {
    const directions = {
        asc: 1,
        desc: -1
    };

    const column = this.headerConfig.find(item => item.id === field);
    const {sortType} = column;

    return [...data].sort((a,b) => {
      if (sortType === "string"){
        return directions[param] *  a[field].localeCompare(b[field],['ru','en'], {caseFirst:'upper'});
      }else if (sortType === "number") {
        return directions[param] * (a[field] - b[field])
      }else{
        throw new Error('Unknown type of sorting!');
      }
    });
  }
  destroy(){
    this.element.remove();
    this.subElements = {};
  }
}
