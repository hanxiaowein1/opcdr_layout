window.customElements.define("slide-viewer", SlideViewer)

//初始化nav_bar
fetch('nav_bar.html').then(function(response){
    return response.text()
}).then(function(text){
    const doc = new DOMParser().parseFromString(text, 'text/html')
    let temp_slide_center = doc.querySelector('#slide_center_nav')
    temp_slide_center.classList.add('active')
    let body = document.querySelector('body')
    body.insertBefore(doc.querySelector('ul'), body.firstChild)
    loadSlideCenter()
})

function loadSlideCenter(){
    setNav(document.querySelector("#all_slide_li"))
    setSiblingsDisabled(all_slide_block)
    //导航栏设置为“所有切片”
    all_slide_block.classList.remove("disabled")
    loadAllSlideList()

    //将slide_viewer清空
    let all_slide_viewer = all_slide_block.querySelector("slide-viewer")
    all_slide_viewer.setAttribute('image', "")

    // let all_slide_viewer = document.querySelector("#all_slide_viewer")
    // let img = all_slide_viewer.querySelector(":scope > ul > img")
    // img.src = ""
}

function loadAllSlideList(){
    let name = "pagination_all_slide"

    let callback = function(elem){
        //点击该callback，展示第几张图像
        let value = elem.target.innerHTML.split("_")[0]
        const all_slide_viewer = all_slide_block.querySelector("slide-viewer")
        let img = all_slide_viewer.querySelector("img.thumbnail")
        let imgid = value % 4 + 1
        img.src = "images/" + imgid + ".jpg"
        img.setAttribute("data-original", img.src)
        let viewer = new Viewer(all_slide_viewer.querySelector(":scope ul.thumbnail_ul"),{
            url: 'data-original'
        })

        //展示slide-viewer
        let slide_viewer = all_slide_block.querySelector("slide-viewer")
        slide_viewer.initImg()
        slide_viewer.createCanvas()
    }
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

    // if(!navFunc(event))
    //     return
    setNav(event.target)
    //将其他的兄弟节点设置为disabled
    setSiblingsDisabled(all_slide_block)
    all_slide_block.classList.remove("disabled")
    loadAllSlideList()
}

function loadComputeSlideList(){
    let name = "pagination_compute_slide"
    let callback = clickCallBack_Log
    var content = function(){
        var result = [];
        for(var i = 1; i < 196; i++){
            result.push(i + "_computed_slidename");
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
    //如果当前的元素和传进来的函数相同，那么就不做任何操作
    setNav(event.target)
    //将其他的兄弟节点设置为disabled
    setSiblingsDisabled(compute_slide_block)
    compute_slide_block.classList.remove("disabled")
    loadComputeSlideList()
}


//默认加载
let all_slide_li = document.querySelector("#all_slide_li")
all_slide_li.addEventListener('click', loadAllSlideListByClick)

let compute_slide_li = document.querySelector("#compute_slide_li")
compute_slide_li.addEventListener('click', loadComputeSlideListByClick)