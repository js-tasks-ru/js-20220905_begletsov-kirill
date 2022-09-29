import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {

  element;
  subElements;

  controller = new AbortController();


  constructor(headersConfig = [], {
    data = [],
    sorted = {
      id: 'title',
      order: 'desc'
    },
    url = ''
  } = {}, isSortLocally = false) {

    this.headerConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.url = new URL(url,BACKEND_URL);
    this.isSortLocally = isSortLocally

    this.initialize();
  }

  initialize(){
    
    this.render();

    this.sort(this.sorted.id, this.sorted.order);


    const header = this.element.querySelector('[data-element = "header"]');

    let field = this.sorted.id;
    let order = this.sorted.order; 
    let start = 0;
    let end = 30;
  
    header.addEventListener("pointerdown", (event) =>{
      let target = event.target.parentElement;
      
      if (!target.dataset.id) {
        target = event.target;
      }

      const isSortable = target.dataset.sortable;

      if (isSortable === "true") {
        field = target.dataset.id;
        order = this.getOrder(target.dataset.order); 
        
        this.sort(field, order);  
      }
    });

    document.addEventListener("scroll", () => {
      let relativeBottom = document.documentElement.getBoundingClientRect().bottom;

      if (relativeBottom < document.documentElement.clientHeight) {
        start = end;
        end += 30;
        const url = `?_embed=subcategory.category&_sort=${field}&_order=${order}&_start=${start}&_end=${end}`;
        this.sendQuery(url,true);
      }
    }, {signal: this.controller.signal})
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

  getFormatDate(date){
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
  }

  sendQuery(url =
    `?_embed=subcategory.category&_sort=title&_order=asc&_start=30&_end=60`, isScrolled = false){
    fetchJson(this.url + url)
        .then(data => {
            this.data = data;
            if (isScrolled) {
              const container = document.createElement("div");
              container.innerHTML = this.getBodyData(this.data);

              this.subElements.body.append(container);
            }else{
              this.subElements.body.innerHTML = this.getBodyData(this.data);
            }
        }
    );
  }

  sortOnClient (id, order) {
    const sortedData = this.sortFields(this.data, order,id);
    this.subElements.body.innerHTML = this.getBodyData(sortedData);

    const allColumns = this.element.querySelectorAll(".sortable-table__cell[data-id]");
    const column = this.element.querySelector(`[data-id = "${id}"]`);

    allColumns.forEach(column => {
      column.dataset.order = "";
    });

    column.dataset.order = order; 
  }

  sortOnServer (id, order, start = 0, end = 30) {
    const url = `?_embed=subcategory.category&_sort=${id}&_order=${order}&_start=${start}&_end=${end}`;

    this.sendQuery(url);
    const allColumns = this.element.querySelectorAll(".sortable-table__cell[data-id]");
    const column = this.element.querySelector(`[data-id = "${id}"]`);

    allColumns.forEach(column => {
      column.dataset.order = "";
    });

    column.dataset.order = order; 

  }

  sort(id, order, isSortLocally = this.isSortLocally){
    return isSortLocally ? this.sortOnClient(id,order) : this.sortOnServer(id, order)
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
    this.controller.abort();
  }
}
