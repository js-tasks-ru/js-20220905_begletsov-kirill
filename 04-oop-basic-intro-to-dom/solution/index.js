export default class ColumnChart {
    element;
    elementContent = {}
    chartHeight = 50
    constructor({
        data = [],
        label = '',
        value = 0,
        link = '',
        formatHeading = data => data,
    } = {}){
       
        this.data = data;
        this.label = label;
        this.link = link;
        this.value = value;
        if (formatHeading(value)) {
            this.value = formatHeading(value);
        }
        this.render();
    }

    calculateHeight(data){
        if (!data.length){
            return;
        }
        const maxValue = Math.max(...data);


        const result = data.map(item => {
            const step = this.chartHeight / maxValue;
            const percent = (item / maxValue * 100).toFixed(0);

            return `<div style="--value: ${Math.floor(step * item)}" data-tooltip="${percent}%"></div>`;
        })

        return result.join("");
        

    }
    getLink(){
        return this.link ? `<a class="column-chart__link" href = "${this.link}">View all</a>`: ""
    }
    render(){
        const div = document.createElement('div');
        if (!this.data.length) {
            div.className = "column-chart column-chart_loading";
        }else {
            div.className = "column-chart"
        };
        
        div.setAttribute("style", `--chart-height: ${this.chartHeight}`)
        div.innerHTML = `<div class = "column-chart__title">
            Total ${this.label}
            ${this.getLink()}
        </div>
        <div class = "column-chart__container">
            <div class = "column-chart__header">${this.value}</div>
            <div id="content" class = "column-chart__chart">
            ${this.calculateHeight(this.data)}
            </div>
        </div>
        `

        this.element = div;
        this.elementContent = this.element.querySelectorAll('#content');
    }
    update(newData) {

        this.elementContent.innerHTML = this.calculateHeight(newData);
    }

    remove () {
        this.element.remove();
    }
    destroy(){
        this.remove();
    }
}
