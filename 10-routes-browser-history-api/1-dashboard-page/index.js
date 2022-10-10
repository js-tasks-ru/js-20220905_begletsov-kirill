import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
    element;
    subElements = {};

    controller = new AbortController();

    constructor(){
        this.initialize();
        this.from = new Date();
        this.to = new Date();
    }

    initialize(){
        const to = this.to;
        const from = this.from;

        this.rangePicker = new RangePicker({from, to});
        this.rangePicker.element.setAttribute("data-element", "rangePicker");

        this.from = new Date(this.rangePicker.subElements.from.innerHTML);
        this.to = new Date(this.rangePicker.subElements.to.innerHTML);

        this.ordersChart = new ColumnChart({
            url: "api/dashboard/orders",
            range: {
              from: this.from,
              to: this.to
            },
            label: "orders",
            link: "#"
        });
        this.ordersChart.element.setAttribute("data-element", "ordersChart");

        this.salesChart = new ColumnChart({
            url: "api/dashboard/sales",
            range: {
                from: this.from,
                to: this.to
            },
            label: "sales",
            formatHeading: data => `$${data}`
        });
        this.salesChart.element.setAttribute("data-element", "salesChart");


        this.customersChart = new ColumnChart({
            url: "api/dashboard/customers",
            range: {
                from: this.from,
                to: this.to
            },
            label: "customers",
        });
        this.customersChart.element.setAttribute("data-element", "customersChart");
        

        const bestsellersURL = new URL("api/dashboard/bestsellers", BACKEND_URL);
        bestsellersURL.searchParams.set("from", this.from.toISOString());
        bestsellersURL.searchParams.set("to", this.to.toISOString());

        this.sortableTable = new SortableTable(header, {
            url: bestsellersURL,
            isSortLocally: true,
            start: 0,
            step: 30
        });
        this.sortableTable.element.setAttribute("data-element", "sortableTable");


        document.addEventListener("date-select", async ()=>{
            const {from, to} = this.rangePicker.selected;
            
            this.salesChart.update(new Date(from), new Date(to));
            this.customersChart.update(new Date(from), new Date(to));
            this.ordersChart.update(new Date(from), new Date(to));

            const {id, order} = this.sortableTable.sorted;

            bestsellersURL.searchParams.set("from", from.toISOString());
            bestsellersURL.searchParams.set("to", to.toISOString());
            this.sortableTable.url = bestsellersURL;
            const data = await this.sortableTable.loadData(id, order);
            
            this.sortableTable.subElements.body.innerHTML = this.sortableTable.getTableRows(data);
            
        }, {signal: this.controller.signal});

    }

    get template(){
        return `
            <div class = "dashboard full-height flex-column">
                <div class = "content__top-panel">
                    <h2 class = "page-title">Панель управления</h2>
                </div>
            </div>
        `
    }

    async render(){
        const wrapper = document.createElement("div");

        wrapper.innerHTML = this.template;

        this.element = wrapper.firstElementChild;

        this.getRangePicker();
        this.getColumnCharts();
        this.getSortableTable();

        this.subElements = this.getSubElements();

        return this.element;
    }

    getRangePicker(){
        const topPanel = this.element.querySelector(".content__top-panel");

        topPanel.append(this.rangePicker.element);
    }

    getColumnCharts(){
        const charts = document.createElement("div");
        charts.className = "dashboard__charts";

        charts.append(this.ordersChart.element);
        charts.append(this.salesChart.element);
        charts.append(this.customersChart.element);

        this.element.append(charts);
    }

    getSortableTable(){
        const title = document.createElement("h3");
        title.className = "block-title"
        title.textContent = "Лидеры продаж"
        this.element.append(title);
        this.element.append(this.sortableTable.element)
    }

    getSubElements(element = this.element) {
        const elements = element.querySelectorAll("[data-element]");
    
        return [...elements].reduce((accum, subElement) => {
          accum[subElement.dataset.element] = subElement;
    
          return accum;
        }, {});
    }

    destroy(){
        this.remove();
        this.subElements = {};
        this.element = null;
        this.controller.abort();
    }

    remove(element = this.element){
        element.remove();
    }
}
