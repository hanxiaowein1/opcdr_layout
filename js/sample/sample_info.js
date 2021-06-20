/**
 * 查询到的切片数量框、样本数量狂、样本名称这几个表单的集合，方便统一获取其值(以后可以统一继承自sSlectBase类，以简化代码)
 */
class SampleInfo extends HTMLElement{
    constructor() {
        super();
        fetch('template.html').then(function(response){
            return response.text()
        }).then(function(text){
            const doc = new DOMParser().parseFromString(text, 'text/html')
            let template = doc.querySelector("#sampleInfo")
            let content = template.content.cloneNode(true)

            this.appendChild(content)

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
        let select_elems = this.querySelectorAll('input')
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
}

window.customElements.define("sample-info", SampleInfo)