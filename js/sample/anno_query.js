/**
 * 关于标注属性的几个下拉框的类，用来方便得到标注所有下拉框的筛选值
 */
class AnnoQuery extends SelectBase{
    constructor() {
        super()
        fetch('template.html').then(function(response){
            return response.text()
        }).then(function(text){
            const doc = new DOMParser().parseFromString(text, 'text/html')
            let template = doc.querySelector("#annoQueryTemplate")
            let content = template.content.cloneNode(true)
            this.id_prefix = this.getAttribute('id')

            let multiSelectors = content.querySelectorAll(".ui.dropdown")
            Array.from(multiSelectors).forEach(function(elem){
                elem.id = this.id_prefix + elem.id
            }.bind(this))
            this.appendChild(content)

        }.bind(this))
    }

    init(){
        let data = {
            "fields": ["anno_class", "is_typical", "is_hard"]
        }
        fetch(serverurl + '/annotation/getAnnotationFields', {
            method : 'POST',
            headers : new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(data)
        }).then(function(response){
            return response.json()
        }).then(function(json_data){
            let anno_class = getFormatSelectData(json_data['data']['result']['anno_class'])
            let is_hard = getFormatSelectData(json_data['data']['result']['is_hard'])
            let is_typical = getFormatSelectData(json_data['data']['result']['is_typical'])

            initSelect("#" + this.id_prefix + 'anno_class', anno_class)
            initSelect("#" + this.id_prefix + 'is_hard', is_hard)
            initSelect("#" + this.id_prefix + 'is_typical', is_typical)
        }.bind(this))
    }
}

window.customElements.define("anno-query", AnnoQuery)