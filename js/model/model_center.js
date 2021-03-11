class ModelViewer extends HTMLElement{
    constructor(){
        super()
        fetch('template.html').then(function(response){
            return response.text()
        }).then(function(text){
            const doc = new DOMParser().parseFromString(text, 'text/html')
            let templateElem = doc.querySelector('#modelViewerTemplate')

            var content = templateElem.content.cloneNode(true);

            this.id_prefix = this.getAttribute('id')
            //将内部的那些id都加上前缀

            let multiSelectors = content.querySelectorAll(".ui.dropdown")
            Array.from(multiSelectors).forEach(function(elem){
                elem.id = this.id_prefix + elem.id
            }.bind(this))

            this.appendChild(content)
            this.initModel([])
            this.initSpatial([])
            this.initStylish([])
            this.initOptimizer([])
            this.initLrScheduler([])
        }.bind(this))

    }

    /**
     * 检查表单是否有空
     */
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

    setEditable(){
        let elems = this.querySelectorAll("div.field")
        Array.from(elems).forEach(function(elem){
            elem.classList.remove("disabled")
        })
    }

    removeEditable(){
        let elems = this.querySelectorAll("div.field")
        Array.from(elems).forEach(function(elem){
            elem.classList.add("disabled")
        })
    }

    getRealId(id){
        return '#' + this.id_prefix + id
    }

    getValue(key){
        //let $form = $('.ui.form')
        let $form = $(this).children(".ui.form")
        let value = $form.form('get value', key)
        return value
    }
    getValues(){
        //let $form = $('.ui.form')
        let $form = $(this).children(".ui.form")
        let values = $form.form('get values')
        return values

    }
    getModelName(){
        return this.getValue("modelname")
    }
    getAliasName(){
        return this.getValue("aliasname")
    }
    getMpp(){
        return this.getValue("dst_mpp")
    }
    getSize(){
        return this.getValue("dst_size")
    }
    getSpatial(){
        return this.getValue("spatial_augmentation")
    }
    getStylish(){
        return this.getValue("stylish_augmentation")
    }
    getNormalization(){
        let left = this.getValue("normalization_left")
        let right = this.getValue("normalization_right")
        return [left, right]
    }
    getOptimizer(){
        return this.getValue("optimizer")
    }
    getLearnRate(){
        return this.getValue("learning_rate")
    }
    getLrScheduler(){
        return this.getValue("lr_scheduler")
    }

    setValue(key, value){
        //let $form = $('.ui.form')
        let $form = $(this).children(".ui.form")
        //最新测试：dropdown以及select都可以通过该方法赋值（NB!!）
        $form.form('set value', key, value)
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

    setModelName(data){
        this.setValue("modelname", data)
    }
    setAliasName(data){
        this.setValue("aliasname", data)
    }
    setMpp(data){
        this.setValue("dst_mpp", data)
    }
    setSize(data){
        this.setValue("dst_size", data)
    }
    setSpatial(data){
        this.setValue("spatial_augmentation", data)
    }
    setStylish(data){
        this.setValue("stylish_augmentation", data)
    }
    setNormalization(data){
        this.setValue("normalization_left", data[0])
        this.setValue("normalization_right", data[1])
    }
    setOptimizer(data){
        this.setValue("optimizer", data)
    }
    setLearnRate(data){
        this.setValue("learning_rate", data)
    }
    setLrScheduler(data){
        this.setValue("lr_scheduler", data)
    }
    /**
     * 设置模型的名称
     * @param data:有哪些模型可以选择
     */
    initModel(data){
        let modelId = this.getRealId('modelname')
        initSelect(modelId, data)
    }

    initOptimizer(data){
        let optimizerId = this.getRealId("optimizer")
        initSelect(optimizerId, data)
    }

    initLrScheduler(data){
        let lrSchedulerId = this.getRealId("lr_scheduler")
        initSelect(lrSchedulerId, data)
    }

    initSpatial(data){
        let spatialId = this.getRealId("spatial_augmentation")
        initSelect(spatialId, data)
    }

    initStylish(data){
        let stylishId = this.getRealId("stylish_augmentation")
        initSelect(stylishId, data)
    }

    restoreDefaults(){
        let ids = this.getIds()
        for(let i = 0;i<ids.length;i++){
            $('#' + ids[i]).dropdown('restore defaults')
        }
    }
}

window.customElements.define("model-viewer", ModelViewer)



//初始化nav_bar
fetch('nav_bar.html').then(function(response){
    return response.text()
}).then(function(text){
    const doc = new DOMParser().parseFromString(text, 'text/html')
    let temp_slide_center = doc.querySelector('#model_center_nav')
    temp_slide_center.classList.add('active')
    let body = document.querySelector('body')
    body.insertBefore(doc.querySelector('ul'), body.firstChild)

    loadModelList()
})

//将本地的表单里面的数据转换成网上的数据以方便提交（其实目前只需要修改normalization）
function convertLocal2Web(data){
    data['normalization'] = []
    data['normalization'].push(data['normalization_left'])
    data['normalization'].push(data['normalization_right'])
    delete data['normalization_left']
    delete data['normalization_right']
    return data
}

let model_list = []

function loadModelList(){
    fetch(serverurl + "/model/listconfig").then(function(response){
        return response.json()
    }).then(function(json_data){
        return json_data["data"]["list"]
    }).then(function(data){
        model_list = data

        let name = "pagination_model"
        //let callback = displayModelDetail
        let callback = function(event){
            let model_viewer = document.querySelector('#model_viewer')
            if(model_viewer.classList.contains('myHide')){
                model_viewer.classList.remove('myHide')
            }
            let current_li = event.target
            let viewer1 = document.querySelector('#viewer1')
            //先restore一下
            viewer1.restoreDefaults()
            //然后在填入内容
            let li_id = current_li.getAttribute('id')
            for(let i = 0;i<model_list.length;i++){
                let model_info = model_list[i]
                if(model_info["id"] == li_id){
                    //将属性赋予model-viewer
                    //setViewerContent(viewer_id, model)
                    viewer1.setValues(model_info)
                    //其中要搞的是normalization
                    viewer1.setNormalization(model_info['normalization'])
                    break
                }
            }
        }
        let content = model_list
        let li_generator = function(index, item){
            let li = document.createElement('li')
            li.innerText = item["aliasname"]
            if(item["aliasname"] == null)
                li.innerText = "未命名"
            li.setAttribute("id", item["id"])
            li.setAttribute("class", "model_elem")
            return li
        }
        createPagination(name, content, callback, li_generator)
    })
}

function setViewerContent(id, data){
    let viewer = document.querySelector(id)
    viewer.setModelName(data["modelname"])
    viewer.setAliasName(data["aliasname"])
    viewer.setMpp(data["dst_mpp"])
    viewer.setSize(data["dst_size"])
    viewer.setSpatial(data["spatial_augmentation"])
    viewer.setStylish(data["stylish_augmentation"])
    viewer.setNormalization(data["normalization"])
    viewer.setOptimizer(data["optimizer"])
    viewer.setLearnRate(data["learning_rate"])
    viewer.setLrScheduler(data["lr_scheduler"])
}

//刷新当前选中的模型值（根据model_list刷新）
function resetViewerContent(viewer_id, li){
    //要不重新刷新一下model_viewer吧，因为setValue([''])对于dropdown不管用啊
    refreshOuterHtmlById('model_center.html', "#viewer1", function(){
        let li_id = li.getAttribute("id")
        for(let i = 0;i<model_list.length;i++){
            let model = model_list[i]
            if(model["id"] == li_id){
                //将属性赋予model-viewer
                setViewerContent(viewer_id, model)
                break
            }
        }
    })
}

function displayModelDetail(elem){
    let model_viewer_holder = document.querySelector("#model_viewer")
    model_viewer_holder.classList.remove("myHide")
    let current_li = elem.target
    resetViewerContent("#viewer1", current_li)
}

function modifyModelDetail(elem){
    elem.closest("div").classList.add("myHide")
    //將禁用域去掉
    //document.querySelector("#model_detail").classList.remove("disabled")
    let viewer1 = document.querySelector('#viewer1')
    viewer1.setEditable()
    //开启保存、丢弃按钮
    document.querySelector("#modifyDiv2").classList.remove("myHide")
}

function saveModify(){
    //TODO:查询当前选中的模型，在向服务器提交修改
    document.querySelector("#modifyDiv2").classList.add("myHide")

    //查询当前的数据并转换为网上的数据
    let viewer1 = document.querySelector("#viewer1")
    let data = viewer1.getValues()
    data = convertLocal2Web(data)
    //再加上当前的id就搞定了
    let current_li = document.querySelector("li.model_elem.elem_selected")
    let id = current_li.getAttribute("id")
    data["id"] = id
    fetch(serverurl + "/model/updateconfig",{
        method: 'POST',
        headers : new Headers({
            'Content-Type': 'application/json'
        }),
        body : JSON.stringify(data)
    }).then(function(response){
        //当收到回复之后，在修改model_list
        if(response.ok){
            for(let i = 0;i<model_list.length;i++){
                if(model_list[i]["id"] == id){
                    model_list[i] = data
                    resetViewerContent("#viewer1", current_li)
                    //将元素设置为禁止修改
                    document.querySelector("#viewer1").removeEditable()
                    document.querySelector("#modifyDiv1").classList.remove("myHide")
                    break
                }
            }
        }else{
            alert("更新模型信息失败")
        }
    })
}

function discardModify(elem){
    //直接返回，
    let parentDiv = elem.closest("div")
    parentDiv.classList.add("myHide")

    //Todo:将里面的栏目变成修改之前的状态
    let current_li = document.querySelector("li.elem_selected")
    resetViewerContent("#viewer1", current_li)


    //将元素设置为禁止修改
    //document.querySelector("#model_detail").classList.add("disabled")
    document.querySelector("#viewer1").removeEditable()

    document.querySelector("#modifyDiv1").classList.remove("myHide")

}

function getCurrentSelectedList(){
    let selected_li = document.querySelector("li.elem_selected")
    return selected_li.innerHTML
}

function openAddModel(){
    let viewer2 = document.querySelector("#viewer2")
    viewer2.setEditable()
    $("#addModel").modal({
        onApprove : function(){
            if(viewer2.existEmpty()){
                alert("所填值存在为空")
            } else{
                //TODO:向服务器提交数据
                let viewer2 = document.querySelector("#viewer2")
                let data = viewer2.getValues()
                data = convertLocal2Web(data)
                fetch(serverurl + "/model/addconfig", {
                    method: 'POST',
                    headers : new Headers({
                        'Content-Type': 'application/json'
                    }),
                    body : JSON.stringify(data)
                }).then(function(response){
                    if(response.ok){
                        console.log("提交数据成功")
                    }else{
                        alert("提交数据失败")
                    }
                    refreshHtmlById("model_center.html", "#model_shower", function(){
                        //刷新列表
                        loadModelList()
                    })
                })

            }
        }
    }).modal('show')
}
