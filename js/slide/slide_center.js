window.customElements.define("slide-viewer", SlideViewer)
const all_slide_block = document.querySelector("#all_slide_block")
const compute_slide_block = document.querySelector("#compute_slide_block")

//初始化nav_bar
fetch('nav_bar.html').then(function(response){
    return response.text()
}).then(function(text){
    const doc = new DOMParser().parseFromString(text, 'text/html')
    let temp_slide_center = doc.querySelector('#slide_center_nav')
    temp_slide_center.classList.add('active')
    let body = document.querySelector('body')
    body.insertBefore(doc.querySelector('ul'), body.firstChild)
    loadAllSlideList()
    initPiciSelect()
    initTypeSelect()
})

function refreshAllSlideDiv(){
    fetch('slide_center.html').then(function(response){
        return response.text()
    }).then(function(text){
        const doc = new DOMParser().parseFromString(text, 'text/html')
        let original_all_slide_block = doc.querySelector('#all_slide_block')
        let now_all_slide_block = document.querySelector('#all_slide_block')
        now_all_slide_block.innerHTML = original_all_slide_block.innerHTML
        loadAllSlideList()
        initPiciSelect()
        initTypeSelect()
    })
}

function refreshComputeSlideDiv(){

    fetch('slide_center.html').then(function(response){
        return response.text()
    }).then(function(text){
        const doc = new DOMParser().parseFromString(text, 'text/html')
        let original_compute_slide_block = doc.querySelector('#compute_slide_block')
        let now_compute_slide_block = document.querySelector('#compute_slide_block')
        now_compute_slide_block.innerHTML = original_compute_slide_block.innerHTML
        loadComputeSlideList()
    })
}

function loadAllSlideList(){
    let name = "pagination_all_slide"
    let callback = clickCallBack_Log
    var content = function(){
        var result = [];
        for(var i = 1; i < 196; i++){
            result.push(i + "_slidename");
        }
        return result;
    }();
    let li_class = 'all_slide_elem'
    createPagination(name, content, callback, li_class)
}

/**
 * 加载所有切片
 * @param elem
 */
function loadAllSlideListByClick(event){
    loadAllSlideList()
}

function loadComputeSlideList(){
    let name = "pagination_compute_slide"
    let callback = function(elem){

        //点击该callback，展示第几张图像
        let value = elem.target.innerHTML.split("_")[0]
        const compute_slide_viewer = compute_slide_block.querySelector("#compute_slide_viewer")
        let img = compute_slide_viewer.querySelector("img.thumbnail")
        let imgid = value % 4 + 1
        img.src = "images/" + imgid + ".jpg"
        img.setAttribute("data-original", img.src)
        let viewer = new Viewer(compute_slide_viewer.querySelector(":scope ul.thumbnail_ul"),{
            url: 'data-original'
        })

        //展示slide-viewer
        let slide_viewer = compute_slide_block.querySelector("slide-viewer")
        slide_viewer.initImg()
        slide_viewer.createCanvas()
    }
    var content = function(){
        var result = [];
        for(var i = 1; i < 196; i++){
            result.push(i + "_computed_slidename    " + "<img height=\"20\" width=\"20\" src=\" images/cross.png\">");
        }
        return result;
    }();
    let li_class = 'compute_slide_elem'
    createPagination(name, content, callback, li_class)
}

/**
 * 加载所有计算切片
 * @param elem
 */
function loadComputeSlideListByClick(event){
    loadComputeSlideList()
}

//添加监听事件
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    e.target // newly activated tab
    e.relatedTarget // previous active tab

    if(e.target == document.querySelector("#all-slide-tab")){
        //重新加载全切片列表
        refreshAllSlideDiv()
    }
    if(e.target == document.querySelector("#compute-slide-tab")){
        //重新加载计算切片列表
        refreshComputeSlideDiv()
    }
})

function initPiciSelect(){
    let data=[{
        '3d1':'3d1的切片'
    },{
        '3d2':'3d2的切片'
    },{
        '3d3':'3d3的切片'
    },{
        '3d4':'3d4的切片'
    }]
   initSelect("#pici_select", data)
}

function initTypeSelect(){
    //TODO:从后台得到类别
    let data=[{
        'pos':'阳性'
    },{
        'neg':'阴性'
    }]
    initSelect("#type_select", data)
}

function initSlideSelect(){

}

function getSelectedData(){
    let dropdowns = document.querySelectorAll("div#all_slide_block select")
    Array.from(dropdowns).forEach(function(elem){
        let id = elem.id
        id = "#" + id
        let jquery_dropdown = $(id)
        console.log(jquery_dropdown.dropdown('get value'))
    })

    //TODO:向服务器查询数据，得到列表
    let data = [{
        '1':'1.sdpc'
    },{
        '2':'2.svs'
    },{
        '3':'3.sdpc'
    },{
        '4':'4.svs'
    }]

    let model = [{
        '1':'model1.pb'
    },{
        '2':'model2.pb'
    }]

    fetch('slide_center.html').then(function(response){
        return response.text()
    }).then(function(text){
        //先刷新select
        const doc = new DOMParser().parseFromString(text, 'text/html')
        let temp = doc.querySelector("div#all_slide_block div.slide_selector")
        let current = document.querySelector("div#all_slide_block div.slide_selector")
        current.innerHTML = temp.innerHTML
        initSelect("#slide_select", data)
        initSelect("#model_select", model)
        let elem = document.querySelector("div#all_slide_block div.slide_selector")
        if(elem!=null){
            elem.classList.remove('myHide')
        }
    })
}

function checkSelectEmpty(id){
    if($(id).dropdown('get value').length == 0){
        return true
    }
    return false
}

function addSlide(){
    //往服务器添加计算切片
    //检查选择是否为空
    if(checkSelectEmpty("#slide_select")){
        alert("请选择切片")
    }
    if(checkSelectEmpty("#model_select")){
        alert("请选择模型")
    }
}

