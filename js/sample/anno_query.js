class AnnoQuery extends HTMLElement{
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

    //其中key是name
    setValues(data){
        let $form = $(this).children(".ui.form")
        let keys = this.getKeys()
        for(let key in data){
            let value = data[key]
            if(keys.includes(key)){
                $form.form('set value', key, value)
            }
        }
    }

    getKeys(){
        let ret = []
        let select_elems = this.querySelectorAll('select')
        Array.from(select_elems).forEach(function(select_elem){
            ret.push(select_elem.getAttribute('name'))
        })
        return ret
    }

    setValue(key, value){
        let $form = $(this).children(".ui.form")
        $form.form('set value', key, value)
    }

    getValues(){
        let $form = $(this).children(".ui.form")
        let values = $form.form('get values')
        return values
    }

    existEmpty(){
        //let $form = $(".ui.form")
        let $form = $(this).children(".ui.form")
        let values = $form.form('get values')
        for(let key in values){
            let attrName = key
            let attrValue = values[key]
            if(attrValue == '' || attrValue.length == 0)
                return true
        }
        return false
    }

    restoreDefaults(){
        let ids = this.getIds()
        for(let i = 0;i<ids.length;i++){
            $('#' + ids[i]).dropdown('restore defaults')
        }
    }

    getIds(){
        let ret = []
        let select_elems = this.querySelectorAll('select')
        Array.from(select_elems).forEach(function(select_elem){
            ret.push(select_elem.getAttribute('id'))
        })
        return ret
    }
}

window.customElements.define("anno-query", AnnoQuery)