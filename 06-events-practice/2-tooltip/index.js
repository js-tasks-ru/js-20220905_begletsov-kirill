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
    const body = document.body;

    body.addEventListener("pointerover", this.pointerOverFunc)
  }

  pointerOverFunc = (event) => {
    const target = event.target;
    const tooltip = target.dataset.tooltip;

    if (!tooltip) {
      return
    }

    this.render();  
      
    this.element.innerHTML = target.dataset.tooltip;
    target.append(this.element);
    target.addEventListener("pointermove", this.moveFunc);

    target.addEventListener("pointerout", this.pointerOutFunc);
  }

  pointerOutFunc = () => {
    document.body.removeEventListener("pointermove", this.moveFunc);
    this.element.remove();
  }
  
  moveFunc = (event) => {
    const indent = 5;

    this.element.style.left = event.pageX + indent + "px";
    this.element.style.top = event.pageY - indent + "px"
  }

  render(){
    const tooltip = document.createElement("span");
    tooltip.className = "tooltip"

    this.element = tooltip;
    document.body.append(this.element)
  }
  destroy(element = this.element){
    element.remove();
    document.body.removeEventListener("pointermove", this.moveFunc);
    document.body.removeEventListener("pointerover", this.pointerOverFunc);
    document.body.removeEventListener("pointerout", this.pointerOutFunc);
  }
}

export default Tooltip;
