/**
 * 切片属性表单集合类
 */
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

            this.fields = ["slide_group", "slide_format", "pro_method", "image_method", "zoom", "is_positive"]

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
            //要手动把options给加上去
            Array.from(this.fields).forEach(function(elem){
                let temp_data = this.getFormatSelectData(json_data['data']['result'][elem])
                this.addOptions(temp_data, this.id_prefix + elem + "_select")
            }.bind(this))

            /**
             * 为slide_group添加回调函数。例如在slide_group中选择sfy1时，会重新加载其他的切片属性下拉框，例如拍摄方式等下拉框。
             * 其他下拉框会根据slide_group中选择的切片来源，来初始化下拉框中可选择的选项。
             * 例如如果sfy1只有non-bd的拍摄方式，在选择sfy1是，拍摄方式下拉框中仅可以选择non-bd
             */
            Array.from(this.fields).forEach(function(elem){
                if(elem == "slide_group"){
                    $('#' + this.id_prefix + elem + '_select').dropdown({
                        values : this.getFormatSelectData(json_data['data']['result'][elem]),
                        onAdd : function(value, text, $choice){
                            let data = this.getValues()
                            data[elem].push(value)
                            delete data['slide_category']
                            getSlidesFieldsCondition(data).then(function(json_data){
                                let result = json_data['data']['result']
                                this.updateSelect(result, elem)
                            }.bind(this))
                        }.bind(this),
                        onRemove : function(value, text, $choice){
                            let data = this.getValues()
                            let index = data[elem].indexOf(value)
                            if(index > -1){
                                data[elem].splice(index, 1)
                            }
                            delete data['slide_category']
                            getSlidesFieldsCondition(data).then(function(json_data){
                                let result = json_data['data']['result']
                                this.updateSelect(result, elem)
                            }.bind(this))
                        }.bind(this)
                    })
                }
                else{
                    $('#' + this.id_prefix + elem + '_select').dropdown({
                            values : this.getFormatSelectData(json_data['data']['result'][elem])
                        }
                    )
                }

            }.bind(this))
            initSelect("#" + this.id_prefix + 'slide_category', [])
        }.bind(this))
    }

    /**
     * 将data转换为符合初始化semantic-ui dropdown控件的数据格式
     * @param data
     * @returns {*[]}
     */
    getFormatSelectData(data){
        let ret = []
        Array.from(data).forEach(function(elem){
            let temp_data = {}
            temp_data['name'] = elem
            temp_data['value'] = elem
            ret.push(temp_data)
        })
        return ret
    }

    /**
     * 为select控件添加options
     * @param data
     * @param id
     */
    addOptions(data, id){
        let select = this.querySelector('#' + id)
        for(let i = 0;i<data.length;i++){
            let option = document.createElement('option')
            option.setAttribute('value', data[i]['value'])
            option.innerText = data[i]['name']
            select.appendChild(option)
        }
    }

    /**
     * 清楚<select>元素下的所有options
     * @param id
     */
    clearOptions(id){
        let select = this.querySelector('#' + id)
        let length = select.options.length;
        for (let i = length-1; i >= 0; i--) {
            select.options[i] = null;
        }
    }

    /**
     * 清空下拉框的选择栏目，更改下拉框的选项
     * @param data
     * @param select
     */
    updateSelect(data, select){
        Array.from(this.fields).forEach(function(elem){
            if(elem == select){
                return
            }
            let temp_data = this.getFormatSelectData(data[elem])
            $('#' + this.id_prefix + elem + "_select").dropdown(
                'setup menu', {
                    values : temp_data
                }
            )
            //在setup menu后，还需要clear选项
            $('#' + this.id_prefix + elem + "_select").dropdown('clear')
            //先clearoption，在addoption
            this.clearOptions(this.id_prefix + elem + "_select")
            //addoption
            this.addOptions(temp_data, this.id_prefix + elem + "_select")
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