/**
 * 模型属性的查看器（利用表单元素进行查看）
 */
class ModelViewer extends SelectBase{
    constructor(){
        super()
        console.log("ModelViewer construct")
        fetch('template.html').then(function(response){
            return response.text()
        }).then(function(text){
            const doc = new DOMParser().parseFromString(text, 'text/html')
            let templateElem = doc.querySelector('#modelViewerTemplate')

            var content = templateElem.content.cloneNode(true);

            this.id_prefix = this.getAttribute('id')
            //将内部的那些id都加上前缀

            // let multiSelectors = content.querySelectorAll(".ui.dropdown")
            // Array.from(multiSelectors).forEach(function(elem){
            //     elem.id = this.id_prefix + elem.id
            // }.bind(this))
            content = this.setSpecialId(content)
            this.appendChild(content)

            this.init()
        }.bind(this))

    }

    /**
     * 初始化下拉框
     */
    init(){
        // initSelect("#" + this.id_prefix + 'modelname', [])
        // initSelect("#" + this.id_prefix + 'aliasname', [])
        this.initSelect('modelname', [])
        this.initSelect('aliasname', [])
    }

    /**
     * 设置下拉框可编辑
     */
    setEditable(){
        let elems = this.querySelectorAll("div.field")
        Array.from(elems).forEach(function(elem){
            elem.classList.remove("disabled")
        })
    }

    /**
     * 是下拉框不可编辑
     */
    removeEditable(){
        let elems = this.querySelectorAll("div.field")
        Array.from(elems).forEach(function(elem){
            elem.classList.add("disabled")
        })
    }

    getValue(key){
        //let $form = $('.ui.form')
        let $form = $(this).children(".ui.form")
        let value = $form.form('get value', key)
        return value
    }

    getModelName(){
        return this.getValue("modelname")
    }
    getAliasName(){
        return this.getValue("aliasname")
    }

    setModelName(data){
        this.setValue("modelname", data)
    }
    setAliasName(data){
        this.setValue("aliasname", data)
    }

    /**
     * 设置模型的名称
     * @param data:有哪些模型可以选择
     */
    initModel(data){
        let modelId = this.getRealId('modelname')
        initSelect(modelId, data)
    }

}

window.customElements.define("model-viewer", ModelViewer)

//初始化导航栏
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

/**
 * 初始化模型列表
 */
function loadModelList(){
    fetch(serverurl + "/model/listconfig").then(function(response){
        return response.json()
    }).then(function(json_data){
        return json_data["data"]["list"]
    }).then(function(data){
        model_list = data

        let name = "pagination_model"
        let callback = function(event){
            let model_viewer = document.querySelector('#model_viewer')
            if(model_viewer.classList.contains('myHide')){
                model_viewer.classList.remove('myHide')
            }
            let current_tr = event.target.closest('tr')
            let model_id = current_tr.getAttribute('id')
            let viewer1 = document.querySelector('#viewer1')
            //先restore一下
            viewer1.restoreDefaults()
            for(let i = 0;i<model_list.length;i++){
                let model_info = model_list[i]
                if(model_info["id"] == model_id){
                    viewer1.setValues(model_info)
                    break
                }
            }

        }
        let content = model_list
        let theads = ['名称', '模型']
        let tr_generator = function(index, item){
            let tr = document.createElement('tr')
            tr.setAttribute('id', item['id'])

            let name_td = document.createElement('td')
            if(item['aliasname'] != null){
                name_td.innerHTML = item['aliasname']
            }else{
                name_td.innerHTML = '未命名'
            }

            let model_td = document.createElement('td')
            model_td.innerHTML = item['modelname']

            tr.appendChild(name_td)
            tr.appendChild(model_td)
            return tr
        }
        createPaginationTable(name, content, callback, theads, tr_generator)

    })
}

/**
 * 设置模型查看器的值
 * @param id: 模型配置id
 * @param data: 值
 */
function setViewerContent(id, data){
    let viewer = document.querySelector(id)
    viewer.setValues(data)
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

/**
 * 修改模型的配置
 */
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

/**
 * 丢弃模型的配置修改
 * @param elem
 */
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

/**
 * 获取当前选中的列表元素内部html
 * @returns {string}
 */
function getCurrentSelectedList(){
    let selected_li = document.querySelector("li.elem_selected")
    return selected_li.innerHTML
}

/**
 * 打开添加模型模态框
 */
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
                //data = convertLocal2Web(data)

                fetch(serverurl + "/model/addconfig", {
                    method: 'POST',
                    headers : new Headers({
                        'Content-Type': 'application/json'
                    }),
                    body : JSON.stringify(data)
                }).then(function(response){
                    if(response.ok){
                        console.log("提交数据成功")
                        modelCache.init()
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
