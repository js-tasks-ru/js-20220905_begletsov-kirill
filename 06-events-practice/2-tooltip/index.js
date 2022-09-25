class Tooltip {
  static instance = null;

  element

  constructor(){
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }else {
      return Tooltip.instance;
    }
  }
  initialize () {
    const dataTooltips = document.querySelectorAll("[data-tooltip]");
    
    const moveFunc = (event) => {

      this.element.style.left = event.pageX + 5 + "px";
      this.element.style.top = event.pageY - 5 + "px"
    
    }

    for (const item of dataTooltips) {
      const parent = item.querySelectorAll("[data-tooltip]");
      
      item.addEventListener("pointerover", event => {
        const target = event.target;

        this.render();

        this.element.innerHTML = target.dataset.tooltip;
        target.append(this.element);
        item.addEventListener("pointermove", moveFunc);
      },true)
      item.addEventListener("pointerout", event => {
        item.removeEventListener("pointermove", moveFunc,true)
        this.destroy(event.target)
      },true)

      if (parent.length) {
        break;
      }
    }
  }
  render(){
    const tooltip = document.createElement("span");
    tooltip.className = "tooltip"

    this.element = tooltip;
    document.body.append(this.element)
  }
  destroy(){
    this.element.remove();
  }
}

export default Tooltip;
