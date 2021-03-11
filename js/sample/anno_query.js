class AnnoQuery extends HTMLElement{
    constructor() {
        super()
        fetch('template.html').then(function(response){
            return response.text()
        }).then(function(text){
            const doc = new DOMParser().parseFromString(text, 'text/html')
            let template = doc.querySelector("#annoQueryTemplate")
            let content = template.content.cloneNode(true)
            this.appendChild(content)

        }.bind(this))
    }

}