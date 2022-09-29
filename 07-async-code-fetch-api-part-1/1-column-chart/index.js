import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
    element;
    subElements = {};
    chartHeight = 50;

    constructor({
        label = '',
        link = '',
        url = '',
        range = {
            from: new Date(),
            to: new Date()
        },
    } = {}) {
        this.data = [];
        this.url = new URL(url,BACKEND_URL);
        this.label = label;
        this.link = link;
        this.range = range;

        this.sendQuery();
        this.render();
    }

    getColumnBody(data = this.data) {
        const dataArray =  Object.values(data);
        const maxValue = Math.max(...dataArray);

        return dataArray
            .map(item => {
                const scale = this.chartHeight / maxValue;
                const percent = (item / maxValue * 100).toFixed(0);

                return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
            })
        .join('');
    }

    getLink() {
        return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
    }

    get template() {
        return `
            <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
                <div class="column-chart__title">
                    Total ${this.label}
                    ${this.getLink()}
                </div>
                <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header">
                        ${this.value}
                    </div>
                    <div data-element="body" class="column-chart__chart">
                        ${this.getColumnBody(this.data)}
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        const element = document.createElement('div');

        element.innerHTML = this.template;

        this.element = element.firstElementChild;

        this.subElements = this.getSubElements(this.element);
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
        `?from=${this.getFormatDate(this.range.from)}T09%3A50%3A00.641Z&to=${this.getFormatDate(this.range.to)}T09%3A50%3A00.641Z`){
        fetchJson(this.url + url)
            .then(data => {
                if (data) {
                    this.data = data;
                    this.element.classList.remove('column-chart_loading');
                    this.subElements.body.innerHTML = this.getColumnBody(this.data);
                    const headerData = Object.values(data).reduce((previousValue, currentValue) => {
                        return previousValue + currentValue;
                    })
                    this.subElements.header.textContent = headerData;
                }
            }
        );
    }

    update(start, end) {
        const url = `?from=${this.getFormatDate(start)}T09%3A50%3A00.641Z&to=${this.getFormatDate(end)}T09%3A50%3A00.641Z`
        
        this.sendQuery(url);
    }

    destroy() {
        this.element.remove();
        this.subElements = {};
    }
}
