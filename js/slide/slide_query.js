class SlideQuery extends HTMLElement{
    constructor() {
        super()
        fetch('template.html').then(function(response){
            return response.text()
        }).then(function(text){
            const doc = new DOMParser().parseFromString(text, 'text/html')
            let template = doc.querySelector("#slideQueryTemplate")
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
            "fields": ["slide_group", "slide_format", "pro_method", "image_method", "zoom", "is_positive"]
        }
        fetch(serverurl + "/slide/getSlidesFields", {
            method : 'POST',
            headers : new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(data)
        }).then(function (response){
            return response.json()
        }).then(function(json_data){
            let slide_group = getFormatSelectData(json_data['data']['result']['slide_group'])
            let pro_method = getFormatSelectData(json_data['data']['result']['pro_method'])
            let image_method = getFormatSelectData(json_data['data']['result']['image_method'])
            let zoom = getFormatSelectData(json_data['data']['result']['zoom'])
            let is_positive = getFormatSelectData(json_data['data']['result']['is_positive'])
            let slide_format = getFormatSelectData(json_data['data']['result']['slide_format'])

            //为切片选择添加选项
            initSelect("#" + this.id_prefix + 'slide_group_select', slide_group)
            initSelect("#" + this.id_prefix + 'slide_format_select', slide_format)
            initSelect("#" + this.id_prefix + 'pro_method_select', pro_method)
            initSelect("#" + this.id_prefix + 'image_method_select', image_method)
            initSelect("#" + this.id_prefix + 'zoom_select', zoom)
            initSelect("#" + this.id_prefix + 'is_positive_select', is_positive)
            initSelect("#" + this.id_prefix + 'slide_category', [])
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

    getKeys(){
        let ret = []
        let select_elems = this.querySelectorAll('select')
        Array.from(select_elems).forEach(function(select_elem){
            ret.push(select_elem.getAttribute('name'))
        })
        let select_elems2 = this.querySelectorAll('input')
        Array.from(select_elems2).forEach(function(select_elem){
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
}

window.customElements.define("slide-query", SlideQuery)