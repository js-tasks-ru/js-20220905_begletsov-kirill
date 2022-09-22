export default class NotificationMessage {
    element;

    constructor(message, {
        duration = 1000,
        type = "success",
    } = {}){
        this.duration = duration;
        this.message = message;
        this.type = type;

        if (this.type !== "success") {
            this.type = "error";
        }

        this.show();
    }
    get temmplate(){
        return `
            <div class="timer"></div>
            <div class="notification-header">${this.type}</div>
            <div class="notification-body">${this.message}</div>
        `
    }

    show(notification = document.createElement('div')){

        notification.className = `notification ${this.type}`;
        notification.setAttribute("style", `--value:${this.duration / 1000}s`);
        notification.innerHTML = this.temmplate;


        this.element = notification;

        const check = document.querySelector(".notification")

        if (check) {
            this.remove(check)
        }

        setTimeout(() => this.remove(), this.duration);
    }
    remove(element = this.element){
        element.remove();
    }
    destroy(){
        this.remove();
    }

}
