class ModelViewer extends HTMLElement{
    constructor(){
        super()
        var templateElem = document.getElementById('modelViewerTemplate');
        var content = templateElem.content.cloneNode(true);

        this.id_prefix = this.getAttribute('id')
        //将内部的那些id都加上前缀
        content.querySelector('#modelName').id = this.id_prefix + content.querySelector('#modelName').id
        content.querySelector('#learnRate').id = this.id_prefix + content.querySelector('#learnRate').id
        content.querySelector('#batchsize').id = this.id_prefix + content.querySelector('#batchsize').id
        content.querySelector('#optimizer').id = this.id_prefix + content.querySelector('#optimizer').id

        this.appendChild(content);
    }

    /**
     * 检查表单是否有空
     */
    existEmpty(){
        let modelName = this.getModelName()
        let learnRate = this.getLearnRate()
        let batchSize = this.getBatchSize()
        let optimizer = this.getOptimizer()

        if(modelName.length == 0 || learnRate == '' || batchSize == '' || optimizer.length == 0){
            return true
        }
        return false
    }

    setEditable(){
        let elem = this.querySelector("div.model_detail")
        elem.classList.remove("disable")
    }

    removeEditable(){
        let elem = this.querySelector("div.model_detail")
        elem.classList.add("disable")
    }

    getRealId(id){
        return '#' + this.id_prefix + id
    }

    getModelName(){
        let modelId = this.getRealId('modelName')
        return $(modelId).dropdown('get value')
    }

    /**
     * 设置模型的名称
     * @param data:有哪些模型可以选择
     */
    initModel(data){
        let modelId = this.getRealId('modelName')
        initSelect(modelId, data)
        $(modelId).dropdown('set selected', '1')
    }

    getLearnRate(){
        let learnRateId = this.getRealId('learnRate')
        let learnRate = document.querySelector(learnRateId)
        return learnRate.getAttribute("placeholder")
    }

    setLearnRate(data){
        let learnRateId = this.getRealId('learnRate')
        let learnRate = document.querySelector(learnRateId)
        learnRate.setAttribute("placeholder", data)
    }

    getBatchSize(){
        let batchSizeId = this.getRealId('batchsize')
        let batchsize = document.querySelector(batchSizeId)
        return batchsize.getAttribute("placeholder")
    }

    setBatchSize(data){
        let batchSizeId = this.getRealId('batchsize')
        let batchsize = document.querySelector(batchSizeId)
        batchsize.setAttribute("placeholder", data)
    }

    getOptimizer(){
        let optimizerId = this.getRealId("optimizer")
        return $(optimizerId).dropdown('get value')
    }

    initOptimizer(data){
        let optimizerId = this.getRealId("optimizer")
        initSelect(optimizerId, data)
        $(optimizerId).dropdown('set selected', '1')
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
    //把addModel也加载了，只需要加载一次即可
    let viewer2 = document.querySelector("#viewer2")
    viewer2.initModel([])
    viewer2.setLearnRate('')
    viewer2.setBatchSize('')
    viewer2.initOptimizer([])
})

function loadModelList(){
    //TODO:从后台请求所有模型，以及其配置
    let name = "pagination_model"
    let callback = displayModelDetail
    var content = function(){
        var result = [];
        for(var i = 1; i < 10; i++){
            result.push(i + "_model")
        }
        return result
    }();

    let li_class = "model_elem"
    createPagination(name, content, callback, li_class)
}

function displayModelDetail(elem){

    let model_viewer_holder = document.querySelector("#model_viewer")
    model_viewer_holder.classList.remove("myHide")
    //TODO:从后台得到该模型的属性...
    let model = [{
        '1':'model1.pb'
    },{
        '2':'model2.pb'
    }]
    let optimize_option = [{
        '1':'adam'
    },{
        '2':'sgd'
    }]
    let viewer1 = model_viewer_holder.querySelector('model-viewer')
    viewer1.initModel(model)
    viewer1.setLearnRate('0.01')
    viewer1.setBatchSize('10')
    viewer1.initOptimizer(optimize_option)
    document.querySelector("#modifyDiv1").classList.remove("myHide")
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

    //将元素设置为禁止修改
    //document.querySelector("#model_detail").classList.add("disabled")
    document.querySelector("#viewer1").removeEditable()
    document.querySelector("#modifyDiv1").classList.remove("myHide")
}

function discardModify(elem){
    //直接返回，
    let parentDiv = elem.closest("div")
    parentDiv.classList.add("myHide")

    //Todo:将里面的栏目变成修改之前的状态
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
    document.querySelector("#addModel").classList.remove("myHide")
}

function submitModel(){
    //检查元素是否为空
    let viewer2 = document.querySelector("#viewer2")
    if(viewer2.existEmpty()){
        alert("所填值存在为空")
    } else{
        //TODO:向服务器提交数据，然后退出
        document.querySelector("#addModel").classList.add("myHide")
        //刷新列表
        loadModelList()
    }
}

function returnModel(){
    document.querySelector("#addModel").classList.add("myHide")
}