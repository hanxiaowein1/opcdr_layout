window.customElements.define("slide-viewer", SlideViewer)
const all_slide_block = document.querySelector("#all_slide_block")
const compute_slide_block = document.querySelector("#compute_slide_block")


//初始化导航栏
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

//初始化计算切片的html容器
function refreshComputeSlideDiv(){
    refreshHtmlById(
        'slide_center.html',
        '#compute_slide_block',
        loadComputeSlideList)
}

/**
 * 初始化计算切片的列表
 */
function loadComputeSlideList(){
    //查询选中的模型id
    let selected_tr = document.querySelector('div.compute_slide_component tr.elem_selected').closest('tr')
    let train_id = selected_tr.getAttribute('id')
    let data = {'mid' : train_id}
    // let train_id = document.querySelector('div.compute_slide_component li.elem_selected').innerHTML
    // let data = {'mid':train_id}
    getSlidefromModel(data).then(function(json_data){
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

        let name = "pagination_compute_slide"
        let content = slide_list
        let theads = ['状态', '名称']
        let callback = function(event){
            let current_td = event.target
            let tr = current_td.closest('tr')
            if(tr.getAttribute('status') == "F"){
                return
            }else{
                let slide_viewer = compute_slide_block.querySelector('slide-viewer')
                slide_viewer.init(train_id, tr.getAttribute('sid'))
                // slide_viewer.initImg(train_id, tr.getAttribute('sid'))
                //
                // slide_viewer.createCanvas(train_id, tr.getAttribute('sid'))
            }
        }
        let tr_generator = function(index, item){
            let tr = document.createElement('tr')
            tr.setAttribute('sid', item['sid'])
            tr.setAttribute('name', item['name'])
            tr.setAttribute('status', item['status'])

            let img_td = document.createElement('td')
            let img = document.createElement('img')
            img.setAttribute('height', 15)
            img.setAttribute('width', 15)
            if(item['status'] == 'F') {
                img.setAttribute('src', 'images/pending.png')
            }else {
                img.setAttribute('src', 'images/complete.png')
            }
            img_td.appendChild(img)

            let name_td = document.createElement('td')
            name_td.innerText = item['name']

            tr.appendChild(img_td)
            tr.appendChild(name_td)
            return tr
        }
        createPaginationTable(name, content, callback, theads, tr_generator)

    })
}

/**
 * 检测表单选择是否为空
 * @param id: 表单id
 * @returns {boolean}: 如果为空，返回true；否则返回false
 */
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
 * 初始化以训练的模型列表
 */
function loadModelList(){
    getTrainConfigs().then(function (json_data){
        return json_data["data"]["items"]
    }).then(function(data){
        let train_list = data
        let complete_train_list = []

        //应该在得到train_list的时候就直接初始化里面的内容消息
        let fetch_list = []
        fetch_list.push(getSamplegroup())
        fetch_list.push(getAllModelConfig())
        Promise.all(fetch_list).then(function(values){
            let dataset_list = values[0]['data']['samplegroups']
            let modelconfig_list = values[1]['data']['list']

            for(let i = 0;i<train_list.length;i++){
                if(train_list[i]['status'] != '2'){
                    continue
                }
                let id = train_list[i]['id']
                for(let j = 0;j<dataset_list.length;j++){
                    if(dataset_list[j]['id'] == id){
                        train_list[i]['dataset_name'] = dataset_list[j]['aliasname']
                        break
                    }
                }
                for(let j = 0;j<modelconfig_list.length;j++){
                    if(modelconfig_list[j]['id'] == id){
                        train_list[i]['modelconfig_name'] = modelconfig_list[j]['aliasname']
                        break
                    }
                }
                complete_train_list.push(train_list[i])
            }

            train_list = complete_train_list

            let name = "pagination_train"
            let theads = ['名称', '数据集名称', '参数配置名称']
            let callback = function(event){
                document.querySelector('#train_list').classList.add('myHide')
                document.querySelector('#compute_slide_block').classList.remove('myHide')
                refreshComputeSlideDiv()
            }
            let tr_generator = function(index, item){
                let tr = document.createElement('tr')
                tr.setAttribute('id', item['id'])

                let name_td = document.createElement('td')
                name_td.innerText = item['aliasname']
                tr.appendChild(name_td)

                let fetch_list = []

                let dataset_td = document.createElement('td')
                //dataset_td.innerText = item['dataset_name']
                dataset_td.innerText = '测试数据集'
                tr.appendChild(dataset_td)

                let modelconfig_td = document.createElement('td')
                //modelconfig_td.innerText = item['modelconfig_name']
                modelconfig_td.innerText = '测试参数'
                tr.appendChild(modelconfig_td)

                return tr
            }

            createPaginationTable(name, train_list, callback, theads, tr_generator)

        })

    })
}

/**
 * 从切片列表返回到模型列表
 * @param elem
 */
function return2ModelList(elem){
    //elem.closest("div").classList.add("myHide")
    document.querySelector("#compute_slide_block").classList.add("myHide")
    document.querySelector("#train_list").classList.remove("myHide")
}

/**
 * 添加计算切片模态框
 * @param elem
 */
function addSlide(elem){
    $("#add_slide_div").modal({
        onApprove : function (){
            //TODO:向服务器提交数据
            //获取当前选中的模型id
            let selected_tr = document.querySelector('div.compute_slide_component tr.elem_selected').closest('tr')
            let train_id = selected_tr.getAttribute('id')
            //let train_id = document.querySelector('div.compute_slide_component li.elem_selected').innerHTML
            //获取当前选中的切片列表
            let name = document.querySelector('#slide_select').getAttribute('name')
            let $form = $('#refreshSlideSelectDiv').children('.ui.form')
            let slide_list = $form.form('get value', name)
            let post_data = {}
            post_data['mid'] = [train_id]
            post_data['slide_list'] = slide_list
            //post_data[train_id] = slide_list
            addModelRecommend(post_data).then(function(json_data){
                if(json_data["code"] == 200){
                    console.log("add slide to model succeed")
                }else{
                    console.log("add slide to model failed")
                }
                refreshHtmlByIdWithPromise('slide_center.html', '#compute_slide_block').then(loadComputeSlideList)
                // refreshHtmlById("slide_center.html", "#compute_slide_block", function(){
                //     loadComputeSlideList()
                // })
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

/**
 * 查询符合筛选条件的切片
 */
function querySlide(){
    //refreshHtmlById('slide_center.html', '#refreshSlideSelectDiv', initSlideSelect)
    // let $form = $("#query_slide_div").children('.ui.form')
    // let value = $form.form('get value', 'slide_group')
    // console.log(value)

    let slide_query = document.querySelector('slide-query')
    let data = slide_query.getValues()

    querySlideList(data).then(function(json_data){
        let passin_function = function(){
            //let train_id = document.querySelector('div.compute_slide_component li.elem_selected').innerHTML
            let selected_tr = document.querySelector('div.compute_slide_component tr.elem_selected').closest('tr')
            let train_id = selected_tr.getAttribute('id')
            let post_data = {'mid':train_id}
            let slide_list = json_data['data']['slideList']

            getSlidefromModel(post_data).then(function(json_data){
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
