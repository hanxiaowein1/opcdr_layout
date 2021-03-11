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
    loadModelList()

    initSlideSelect()
})

function refreshComputeSlideDiv(){
    refreshHtmlById(
        'slide_center.html',
        '#compute_slide_block',
        loadComputeSlideList)
}

function loadComputeSlideList(){
    //查询选中的模型id
    let train_id = document.querySelector('div.compute_slide_component li.elem_selected').innerHTML
    let post_data = {'mid':train_id}
    fetch(zhangxueying_url + '/modelRecommend/getSlidefromModel', {
        method : 'POST',
        headers : new Headers({
            'Content-Type' : 'application/json'
        }),
        body : JSON.stringify(post_data)
    }).then(function(response){
        return response.json()
    }).then(function(json_data){
        //key为sid，value为key + value的一个map
        let slide_map = json_data['data']['slide_list']
        //创建需要显示的slide_list
        let slide_list = []
        for(let sid in slide_map){
            let temp_data = {}
            temp_data['sid'] = sid
            temp_data['name'] = slide_map[sid]['slidename']
            temp_data['status'] = slide_map[sid]['status']
            slide_list.push(temp_data)
        }

        //根据slide_list初始化前端的切片列表控件
        let name = "pagination_compute_slide"
        let content = slide_list

        let callback = function(elem){
            //当前点击的列表元素
            let current_li = elem.target
            //如果当前列表并没有计算完毕，那么就什么也不做
            if(current_li.getAttribute('status') == 'F'){
                return
            }else{
                //显示slide-viewer
                let slide_viewer = compute_slide_block.querySelector("slide-viewer")
                slide_viewer.initImg(train_id, current_li.getAttribute('sid'))
                slide_viewer.createCanvas()
            }

        }
        let li_generator = function(index, item){
            let li = document.createElement('li')
            li.setAttribute('sid', item['sid'])
            li.setAttribute('name', item['name'])
            li.setAttribute('status', item['status'])
            let img = document.createElement('img')
            img.setAttribute('height', 15)
            img.setAttribute('width', 15)
            if(item['status'] == 'F') {
                img.setAttribute('src', 'images/cross.png')
            }else {
                img.setAttribute('src', 'images/tick.jpg')
            }
            li.appendChild(img)
            li.innerHTML+=item['name']
            return li

        }
        createPagination(name, content, callback, li_generator)
    })

    // let name = "pagination_compute_slide"
    // let callback = function(elem){
    //
    //     //点击该callback，展示第几张图像
    //     let value = elem.target.innerHTML.split("_")[0]
    //     const compute_slide_viewer = compute_slide_block.querySelector("#compute_slide_viewer")
    //     let img = compute_slide_viewer.querySelector("img.thumbnail")
    //     img.src = "images/ceil/thumbnail.jpg"
    //     img.setAttribute("data-original", img.src)
    //     let viewer = new Viewer(compute_slide_viewer.querySelector(":scope ul.thumbnail_ul"),{
    //         url: 'data-original'
    //     })
    //
    //     //展示slide-viewer
    //     let slide_viewer = compute_slide_block.querySelector("slide-viewer")
    //     slide_viewer.initImg()
    //     slide_viewer.createCanvas()
    // }
    // var content = function(){
    //     var result = [];
    //     for(var i = 1; i < 196; i++){
    //         //result.push("<img height=\"15\" width=\"15\" src=\" images/cross.png\">" + i + "_computed_slidename    ");
    //         result.push(i + "_computed_slidename")
    //     }
    //     return result;
    // }();
    // //let li_class = 'compute_slide_elem'
    // let li_generator = function(index, item){
    //     let li = document.createElement('li')
    //     let img = document.createElement('img')
    //     img.setAttribute('height', 15)
    //     img.setAttribute('width', 15)
    //     img.setAttribute('src', 'images/cross.png')
    //     li.appendChild(img)
    //     li.innerHTML+=item
    //     return li
    // }
    // createPagination(name, content, callback, li_generator)
}

function checkSelectEmpty(id){
    if($(id).dropdown('get value').length == 0){
        return true
    }
    return false
}

function refreshComputeShower(){
    loadComputeSlideList()
    let slide_viewer = document.querySelector("#compute_slide_viewer")
    slide_viewer.clean()
}

let train_list = []
let complete_train_list = []
//记录前向的切片
let forward_list = []
/**
 * 检查训练的模型是否完成
 * @param id
 */
async function checkTrainComplete(id)
{
    let epochnumber = 0
    for(let i = 0;i<train_list.length;i++) {
        if(train_list["id"] == id) {
            epochnumber = parseInt(train_list[i]["epochnumber"])
        }
    }

    let data = {"id":id}
    //因为fetch不好同步，在这里使用XMLHttpRequest来进行同步请求
    const response = await fetch(serverurl + "/script/result", {
        method: 'POST',
        headers : new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(data)
    })
    const result = await response.json()
    if(result['data']['result']['val_loss'].length == epochnumber){
        return true
    }
    return false
}

//查询训练完的模型
async function loadModelList(){
    fetch(serverurl + "/train/getconfigs").then(function(response){
        return response.json()
    }).then(function (json_data){
        return json_data["data"]["items"]
    }).then(function(data){
        let train_list = data

        let initialize_complete_train_list = function(train_list, i){
            if(i == train_list.length){
                let name = "pagination_train"
                let callback = function(event){
                    let model = event.target.innerHTML
                    console.log(model)
                    document.querySelector("#train_list").classList.add("myHide")
                    //显示计算切片列表和slide-viewer
                    document.querySelector("#compute_slide_block").classList.remove("myHide")
                    //TODO:向服务器查询切片的列表和更新slide-viewer
                    refreshComputeSlideDiv()
                }
                let content = complete_train_list
                let li_generator = function(index, item){
                    let li = document.createElement('li')
                    li.innerText = item['id']
                    return li
                }
                createPagination(name, content, callback, li_generator)
                return
            }
            let data = {"id" : train_list[i]['id']}
            fetch(serverurl + "/script/result", {
                method: 'POST',
                headers : new Headers({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(data)
            }).then(function(response){
                return response.json()
            }).then(function(ret_json){
                if(ret_json['data']['result']['val_loss'].length == parseInt(train_list[i]['epochnumber'])){
                    complete_train_list.push(train_list[i])
                }
                initialize_complete_train_list(train_list, i + 1)
            })
        }
        initialize_complete_train_list(train_list, 0)
    })
}

function return2ModelList(elem){
    //elem.closest("div").classList.add("myHide")
    document.querySelector("#compute_slide_block").classList.add("myHide")
    document.querySelector("#train_list").classList.remove("myHide")
}

function addSlide(elem){
    $("#add_slide_div").modal({
        onApprove : function (){
            //TODO:向服务器提交数据
            //获取当前选中的模型id
            let train_id = document.querySelector('div.compute_slide_component li.elem_selected').innerHTML
            //获取当前选中的切片列表
            let name = document.querySelector('#slide_select').getAttribute('name')
            let $form = $('#refreshSlideSelectDiv').children('.ui.form')
            let slide_list = $form.form('get value', name)
            let post_data = {}
            post_data['mid'] = [train_id]
            post_data['slide_list'] = slide_list
            //post_data[train_id] = slide_list
            fetch(zhangxueying_url + '/modelRecommend/addModelRecommend', {
                method : 'POST',
                headers : new Headers({
                    'Content-Type' : 'application/json'
                }),
                body : JSON.stringify(post_data)
            }).then(function(response){
                return response.json()
            }).then(function(json_data){
                if(json_data["code"] == 200){
                    console.log("add slide to model succeed")
                }else{
                    console.log("add slide to model failed")
                }
                refreshHtmlById("slide_center.html", "#compute_slide_block", function(){
                    loadComputeSlideList()
                })
            })
        }
    }).modal("show")
}

let slide_info = {}

//初始化选择切片的控件
function initSlideSelect()
{
    let slide_query = document.querySelector("slide-query")
    slide_query.init()
}

function querySlide(){
    //refreshHtmlById('slide_center.html', '#refreshSlideSelectDiv', initSlideSelect)
    // let $form = $("#query_slide_div").children('.ui.form')
    // let value = $form.form('get value', 'slide_group')
    // console.log(value)

    let slide_query = document.querySelector('slide-query')
    let data = slide_query.getValues()

    fetch(serverurl + '/slide/querySlideList', {
        method : 'POST',
        headers : new Headers({
            'Content-Type' : 'application/json'
        }),
        body : JSON.stringify(data)
    }).then(function(response){
        return response.json()
    }).then(function(json_data){
        let passin_function = function(){
            let train_id = document.querySelector('div.compute_slide_component li.elem_selected').innerHTML
            let post_data = {'mid':train_id}
            let slide_list = json_data['data']['slideList']

            fetch(zhangxueying_url + '/modelRecommend/getSlidefromModel', {
                method : 'POST',
                headers : new Headers({
                    'Content-Type' : 'application/json'
                }),
                body : JSON.stringify(post_data)
            }).then(function(response){
                return response.json()
            }).then(function(json_data){
                //let exists_slide_list = json_data['data']['slide_list']
                let exists_slide_list = []
                let slide_list_data_for_select = []

                //在这里将slide_list过滤一遍
                for(let i = 0;i<slide_list.length;i++){
                    let temp_data = {}
                    if(exists_slide_list.includes(slide_list[i][1])){
                        continue
                    }else{
                        temp_data[slide_list[i][0]] = slide_list[i][1]
                        slide_list_data_for_select.push(temp_data)
                    }
                }
                initSelect("#slide_select", slide_list_data_for_select)
            })
        }
        refreshHtmlById('slide_center.html', '#refreshSlideSelectDiv', passin_function)
    })
}
