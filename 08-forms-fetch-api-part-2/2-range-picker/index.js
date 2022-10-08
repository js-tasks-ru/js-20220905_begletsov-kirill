export default class RangePicker {
    element;
    subElements;

    constructor({
        from = new Date(),
        to = new Date()
    } = {}){

        this.selected = {from, to};
        this.showDateFrom = new Date(from);
        
        this.render();
    }

    formatDate(date) {
        return date.toLocaleString("ru", {dateStyle: "short"});
    }

    get template(){
        const {from, to} = this.selected;
        
        return `
            <div class="rangepicker">
                <div class="rangepicker__input" data-element="input">
                    <span data-element="from">${this.formatDate(from)}</span> -
                    <span data-element="to">${this.formatDate(to)}</span>
                </div>
                <div class="rangepicker__selector" data-element="selector"></div>
            </div>
        `
    }
    
    render(){
        const element = document.createElement("div");

        element.innerHTML = this.template;

        this.element = element.firstElementChild;

        this.subElements = this.getSubElements();

        this.initEventListeners();
    }

    getSubElements(element = this.element) {
        const elements = element.querySelectorAll("[data-element]");
    
        return [...elements].reduce((accum, subElement) => {
          accum[subElement.dataset.element] = subElement;
    
          return accum;
        }, {});
    }

    initEventListeners(){
        const {input, selector} = this.subElements;

        input.addEventListener("click", () => {
            this.element.classList.toggle("rangepicker_open");
            this.dateRender();
        });
        document.addEventListener("click", this.onOutSideClick, true);
        selector.addEventListener("click",this.onSelectorClick);
    }

    onOutSideClick = (event) => {
        const isRangepickerOpen = this.element.classList.contains("rangepicker_open");
        const {input} = this.subElements;
        const isRangepicker = input.closest(".rangepicker") === event.target.closest(".rangepicker");

        if (isRangepickerOpen && !isRangepicker) {
            this.close();
        }
    }

    close(){
        this.element.classList.remove("rangepicker_open");
    }

    onCellClick = (target) =>{
        const { value } = target.dataset;

        if (value) {
            const date = new Date(value);

            if (this.selectingFrom) {
                this.selected = {
                    from: date,
                    to: null
                };
                this.selectingFrom = false;
                this.rangePick();
            } else {
                if  (date > this.selected.from) {
                    this.selected.to = date;
                } else {
                    this.selected.to = this.selected.from;
                    this.selected.from = date;
                }

                this.selectingFrom = true;
                this.rangePick();
            }

            if (this.selected.from && this.selected.to) {
                this.dispatchEvent();
                this.subElements.from.innerHTML = this.formatDate(this.selected.from);
                this.subElements.to.innerHTML = this.formatDate(this.selected.to);
            }
        }
    }

    onSelectorClick = (event) =>{
        const target = event.target;
        
        if (event.target.classList.contains("rangepicker__cell")) {
          this.onCellClick(target);
        }
    }

    dateRender() {
        const firstDate = new Date(this.showDateFrom);
        const secondDate = new Date(this.showDateFrom);
        const { selector } = this.subElements;
    
        secondDate.setMonth(secondDate.getMonth() + 1);
    
        selector.innerHTML = `
          <div class="rangepicker__selector-arrow"></div>
          <div class="rangepicker__selector-control-left"></div>
          <div class="rangepicker__selector-control-right"></div>
          ${this.renderCalendar(firstDate)}
          ${this.renderCalendar(secondDate)}
        `;
    
        const leftArrow = selector.querySelector(".rangepicker__selector-control-left");
        const rightArrow = selector.querySelector(".rangepicker__selector-control-right");
    
        leftArrow.addEventListener("click", () => {
            this.showDateFrom.setMonth(this.showDateFrom.getMonth() - 1);
            this.dateRender();
        });

        rightArrow.addEventListener("click", () => {
            this.showDateFrom.setMonth(this.showDateFrom.getMonth() - 1);
            this.dateRender();
        });
    
        this.rangePick();
    }

    rangePick(){
        const {from, to} = this.selected;

        const cells = this.element.querySelectorAll(".rangepicker__cell");

        for (const cell of cells) {
            const {value} = cell.dataset;
            const date = new Date(value);

            cell.classList.remove("rangepicker__selected-from");
            cell.classList.remove("rangepicker__selected-between");
            cell.classList.remove("rangepicker__selected-to");

            if (from && value === from.toISOString()) {
                cell.classList.add("rangepicker__selected-from");
            } else if (to && value === to.toISOString()) {
                cell.classList.add("rangepicker__selected-to");
            } else if (from && to && date >= from && date <= to) {
                cell.classList.add("rangepicker__selected-between");
            }
        }

        if (from) {
            const elementFrom = this.element.querySelector(`[data-value="${from.toISOString()}"]`);
            if (elementFrom) {
                elementFrom.closest(".rangepicker__cell").classList.add("rangepicker__selected-from");
            }
        }
      
        if (to) {
            const elementTo = this.element.querySelector(`[data-value="${to.toISOString()}"]`);
            if (elementTo) {
                elementTo.closest(".rangepicker__cell").classList.add("rangepicker__selected-to");
            }
        }
    }

    renderCalendar(showDate){

        const date = new Date(showDate);
        const getGridStartIndex = dayIndex => {
            const index = dayIndex === 0 ? 6 : (dayIndex - 1);
            return index + 1;
        };

        date.setDate(1);

        const monthStr = date.toLocaleString("ru", {month: "long"});

        let table = `<div class="rangepicker__calendar">
                        <div class="rangepicker__month-indicator">
                            <time datetime=${monthStr}>${monthStr}</time>
                        </div>
                        <div class="rangepicker__day-of-week">
                            <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
                        </div>
                    <div class="rangepicker__date-grid">
        `;

        table += `
            <button type="button"
                class="rangepicker__cell"
                data-value="${date.toISOString()}"
                style="--start-from: ${getGridStartIndex(date.getDay())}">
                ${date.getDate()}
            </button>`;

        date.setDate(2);

        while (date.getMonth() === showDate.getMonth()) {
            table += `
                <button type="button"
                class="rangepicker__cell"
                data-value="${date.toISOString()}">
                    ${date.getDate()}
                </button>`;

            date.setDate(date.getDate() + 1);
        }

        table += "</div></div>";

        return table;
    }


    dispatchEvent(){
        this.element.dispatchEvent(new CustomEvent("date-select", {
            bubbles: true,
            detail: this.selected
        }));
    }

    remove(element = this.element){
        element.remove();

        document.removeEventListener("click", this.onOutSideClick);
    }

    destroy(){
        this.remove();
        this.subElements = {};
        this.element = null;

    }

}
