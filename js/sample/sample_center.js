/**
 * 突然发现这些数据既然能保存，还有相关函数，
 * 还经常需要转换为map格式方便用key来进行查询，不如用个类包起来得了

 */

/**
 * 要相信本地缓存是正确的，不然除了普通的请求要做，出错时还要考虑请求，
 * 程序就会变得很复杂，因此，不考虑意外的情况，否则没完没了，
 * 这种事情以后再来考虑
 */

/**
 * 不行，还是不能相信本地缓存，本地缓存宣告失败，留以后的自己添加本地缓存吧，现在
 * 的自己还是力有未逮。
 */

class DatasetCache {
    constructor() {
        //网络原生的数据集信息
        this.samplegroups = []
        getSamplegroup().then(function(json_data){
            this.samplegroups = json_data['data']['samplegroups']
        }.bind(this))
    }

    init(){
        return getSamplegroup().then(function(json_data){
            this.samplegroups = json_data['data']['samplegroups']
        }.bind(this))
    }

    queryIndexById(id){
        for(let i = 0;i<this.samplegroups.length;i++){
            if(this.samplegroups[i]['id'] == id){
                return i
            }
        }
        return -1
    }

    empty(){
        if(this.samplegroups.length == 0){
            return true
        }else{
            return false
        }
    }

    getSampleIds(dataset_id){
        if(!this.empty()){
            let index = this.queryIndexById(dataset_id)
            if(index == -1){
                return []
            }else{
                return this.samplegroups[index]['sampleconfigids']
            }
        }
    }
}

class SampleCache{
    constructor() {
        this.sampleconfigs = []
        getSampleconfig().then(function(json_data){
            this.sampleconfigs = json_data['data']['sampleconfigs']
        }.bind(this))
    }

    queryIndexById(id){
        for(let i = 0;i<this.sampleconfigs.length;i++){
            if(this.samplegroups[i]['id'] == id){
                return i
            }
        }
        return -1
    }

    empty(){
        if(this.sampleconfigs.length == 0){
            return true
        }else{
            return false
        }
    }

}

let datasetCache = new DatasetCache()
let sampleCache = new SampleCache()

//数据集的缓存信息
let samplegroups = []
//数据集id和样本id列表的map映射()
let samplegroupid_map_sampleid = {}
//样本列表：json传回来的原生信息
let sampleconfigs = []
//样本map:key为样本id，value为样本信息，为转换后的sampleconfigs，为了方便查询()
let sampleconfigs_map = {}


//初始化nav_bar
fetch('nav_bar.html').then(function(response){
    return response.text()
}).then(function(text){
    const doc = new DOMParser().parseFromString(text, 'text/html')
    let temp_slide_center = doc.querySelector('#sample_center_nav')
    temp_slide_center.classList.add('active')
    let body = document.querySelector('body')
    body.insertBefore(doc.querySelector('ul'), body.firstChild)
    loadDataSetList()

    //初始化各个模态框
    //1.添加样本模态框
    let slide_query = document.querySelector("div#addSampleDiv slide-query")
    let anno_query = document.querySelector("div#addSampleDiv anno-query")
    slide_query.init()
    anno_query.init()

})

function loadDataSetList(){
    getSamplegroup().then(function(json_data){
        let samplegroups = json_data['data']['samplegroups']
        let name = "pagination_dataset"
        let theads = ['名称', 'id', '样本数量', '创建时间']
        let callback = function(event){
            document.querySelector('#dataset_list').classList.add('myHide')
            document.querySelector('#sample_div').classList.remove('myHide')
            refreshSampleDiv()
        };
        let tr_generator = function(index, item){
            let tr = document.createElement('tr')
            tr.setAttribute('id', item['id'])

            let td1 = document.createElement('td')
            if(item['aliasname'] != null){
                td1.innerHTML = item['aliasname']
            }else{
                td1.innerHTML = '未命名'
            }
            let td2 = document.createElement('td')
            td2.innerHTML = item['id']
            let td3 = document.createElement('td')
            td3.innerHTML = item['sampleconfigids'].length
            let td4 = document.createElement('td')
            td4.innerHTML = item['create_time']

            //个人认为加上训练集/测试集的数据数量会更好

            tr.appendChild(td1)
            tr.appendChild(td2)
            tr.appendChild(td3)
            tr.appendChild(td4)
            return tr
        }
        createPaginationTable(name, datasetCache.samplegroups, callback, theads, tr_generator)
    })
}

function loadSampleList(){
    document.querySelector('div#sample_shower1').classList.add('myHide')
    let slide_viewer = document.querySelector("div#sample_div slide-query")
    let anno_viewer = document.querySelector("div#sample_div anno-query")
    slide_viewer.init()
    anno_viewer.init()
    //查询选中的数据集id
    let dataset_id = document.querySelector('div#dataset_list tr.elem_selected').getAttribute('id')
    let data = {'samplegroupid' : dataset_id}

    getSamplegroupbyid(data).then(function(json_data){
        let sampleconfigids = json_data['data']['samplegroup']['sampleconfigids']
        //然后根据样本id查询样本
        let sample_list = []
        let initialize_sample_list = function(sampleconfigids, i){
            if(i == sampleconfigids.length){
                let name = 'pagination_sample'
                //展示样本
                let callback = function(event){
                    let sample_shower1 = document.querySelector('div#sample_shower1')
                    if(sample_shower1.classList.contains('myHide')){
                        sample_shower1.classList.remove('myHide')
                    }
                    let current_click_elem = event.target
                    let tr = current_click_elem.closest('tr')
                    let sample_id = tr.getAttribute('id')
                    let data = {"sampleconfigId" : sample_id}
                    //根据样本id查询样本信息
                    getSampleconfigById(data).then(function(json_data){
                        let sampleconfig = json_data['data']['sampleconfig']

                        let slide_query = document.querySelector('#slide_query1')
                        let anno_query = document.querySelector('#anno_query1')
                        let sample_info = document.querySelector('div#sample_shower1 sample-info')
                        slide_query.restoreDefaults()
                        slide_query.setValues(sampleconfig)
                        anno_query.restoreDefaults()
                        anno_query.setValues(sampleconfig)
                        sample_info.setValues(sampleconfig)
                    })

                    console.log('展示样本')
                }
                let content = sample_list
                let theads = ['样本名称', '训练/测试']
                let tr_generator = function(index, item){
                    let tr = document.createElement('tr')
                    tr.setAttribute('id', item['id'])
                    let td = document.createElement('td')
                    //td.innerHTML = item['id']
                    if(item['aliasname'] != null){
                        td.innerHTML = item['aliasname']
                    }else{
                        td.innerHTML = '未命名'
                    }
                    let slide_category_td = document.createElement('td')
                    slide_category_td.innerHTML = item['slide_category']
                    tr.appendChild(td)
                    tr.appendChild(slide_category_td)
                    return tr
                }
                createPaginationTable(name, content, callback, theads, tr_generator)
                return
            }
            let data = {'sampleconfigId' : sampleconfigids[i]}
            getSampleconfigById(data).then(function(ret_json){
                sample_list.push(ret_json['data']['sampleconfig'])
                initialize_sample_list(sampleconfigids, i + 1)
            })
        }
        initialize_sample_list(sampleconfigids, 0)
    })
}

function refreshSampleDiv(){
    refreshHtmlById('sample_center.html', '#sample_div', loadSampleList)
}

//添加数据集
function addDataSet(elem){
    // let addDataSetElem = document.querySelector("div#addDataSetDiv ui form")
    $("#addDataSetDiv").modal({
        onApprove : function(){
            let $form = $('div#addDataSetDiv .ui.form')
            let values = $form.form('get values')
            for(let key in values){
                let attrName = key
                let attrValue = values[key]
                if(attrValue == '' || attrValue.length == 0){
                    console.log("存在值为空!增加新模型失败")
                    return
                }else{
                    let data = values
                    addSamplegroup(data).then(function(response){
                        if(response.ok){
                            console.log("提交数据成功")
                            response.json().then(function(json_data){
                                datasetCache.init()
                            })
                        }else{
                            alert("提交数据失败")
                        }
                        refreshHtmlById("sample_center.html", "#dataset_list", function(){
                            //刷新数据集列表
                            loadDataSetList()
                        })
                    })
                }
            }
        }
    }).modal('show')
}

function return2DataSetList(elem){
    document.querySelector("#sample_div").classList.add("myHide")
    document.querySelector("#dataset_list").classList.remove("myHide")
    refreshHtmlByIdWithPromise('sample_center.html', '#dataset_list').then(loadDataSetList)
}

function addSample(elem){
    $("#addSampleDiv").modal({
        onApprove : function(){
            //这里面有两个东西，一个是slide_query，一个是anno_query
            let slide_query = document.querySelector("div#addSampleDiv slide-query")
            let anno_query = document.querySelector("div#addSampleDiv anno-query")
            let slide_values = slide_query.getValues()
            let anno_values = anno_query.getValues()

            // let $form = $('div#queryResultDiv .ui.form')
            // let values = $form.form('get values')
            let sample_info = document.querySelector('#queryResultDiv sample-info')
            let values = sample_info.getValues()

            if(slide_query.existEmpty() || anno_query.existEmpty() || checkUiFormValueExistEmpty(values)){
                console.log("存在框为空！添加模型失败")
            }else{
                let data = Object.assign(slide_values, anno_values, values)
                addSampleconfig(data).then(function(response){
                    if(response.ok){
                        console.log("在样本表中添加样本成功")
                        //然后将这个样本添加到该数据集中
                        response.json().then(function(json_data){
                            let sample_id = []
                            let dataset_id = document.querySelector('div#dataset_list tr.elem_selected').getAttribute('id')
                            sample_id.push(json_data['data']['id'])
                            let data = {}
                            data['id'] = dataset_id
                            data['sampleconfigids'] = sample_id
                            addSampleconfigInSamplegroup(data).then(function(response){
                                if(response.ok){
                                    console.log('在数据集中添加样本成功')
                                    //刷新样本列表
                                    refreshSampleDiv()
                                }else{
                                    alert('在数据集中添加样本失败')
                                }
                            })
                        })
                    }else{
                        alert("添加样本失败")
                    }
                })
            }

        }
    }).modal('show')
}

function queryAnnoCount(elem){
    let slide_query = document.querySelector("div#addSampleDiv slide-query")
    let anno_query = document.querySelector("div#addSampleDiv anno-query")
    let slide_values = slide_query.getValues()
    let anno_values = anno_query.getValues()

    if(checkUiFormValueExistEmpty(slide_values) || checkUiFormValueExistEmpty(anno_values)){
        console.log("查询存在空！")
        return
    }

    let data = Object.assign(slide_values, anno_values)
    queryAnnoNumber(data).then(function(json_data){
        let anno_number = json_data['data']['number']
        // let $form = $('div#queryResultDiv .ui.form')
        // $form.form('set value', 'anno_number', anno_number)
        let sample_info = document.querySelector('div#queryResultDiv sample-info')
        sample_info.setValue('anno_number', anno_number)
    })
}

function querySlideCount(){
    let slide_query = document.querySelector("div#addSampleDiv slide-query")
    let slide_values = slide_query.getValues()
    if(checkUiFormValueExistEmpty(slide_values)){
        console.log("切片选择栏目存在空！")
        return
    }

    let data = slide_values
    querySlideNumber(data).then(function(json_data){
        let slide_number = json_data['data']['number']
        // let $form = $('div#queryResultDiv .ui.form')
        // $form.form('set value', 'slide_number', slide_number)
        let sample_info = document.querySelector('div#queryResultDiv sample-info')
        sample_info.setValue('slide_number', slide_number)
    })
}

function checkUiFormValueExistEmpty(values){
    for(let key in values) {
        let attrName = key
        let attrValue = values[key]
        if (attrValue == '' || attrValue.length == 0) {
            return true
        }
    }
    return false
}

//添加现有样本
function addExistSample(elem){
    $('#addExistSampleDiv').modal({
        onApprove : function(){
            //提交样本
            let $form = $('div#addExistSampleDiv .ui.form')
            let values = $form.form('get values')
            if(checkUiFormValueExistEmpty(values)){
                console.log('values exists null, add exist sample failed')
                return
            }else{
                let dataset_id = document.querySelector('div#dataset_list tr.elem_selected').getAttribute('id')
                let temp_data = {'id':dataset_id}
                let data = Object.assign(temp_data, values)
                addSampleconfigInSamplegroup(data).then(function(response){
                    if(response.ok){
                        console.log("向数据集中添加样本成功")
                        //然后变更samplegroups和samplegroupid_map_sampleid里的信息
                        datasetCache.init()
                        //然后刷新
                        refreshHtmlByIdWithPromise('sample_center.html', '#sample_list').then(function(){
                            loadSampleList()
                        })
                    }else{
                        alert("向数据集中添加样本失败")
                    }
                })
            }
        }
    }).modal('show')

    getSampleconfig().then(function(json_data){
        let sample_data = []
        json_data = json_data['data']['sampleconfigs']
        for(let i = 0;i<json_data.length;i++){
            let temp_data = {}
            if(json_data[i]['aliasname'] == null){
                continue
            }
            temp_data[json_data[i]['id']] = json_data[i]['aliasname']
            sample_data.push(temp_data)
        }
        //在这里应该去掉数据集中已经包含的样本，让用户无法进行选择
        let dataset_id = document.querySelector('div#dataset_list tr.elem_selected').getAttribute('id')
        let temp_data = {'id':dataset_id}
        let temp_sample_data = {}

        getSamplegroupbyid(temp_data).then(function(json_data){
            let sampleconfigids = json_data['data']['samplegroup']['sampleconfigids']
            if(sampleconfigids != null){
                //将sample_data中的id与sampleconfigids中的id进行对比
                for(let key in sample_data){
                    //如果在则为true
                    let flag = false
                    for(let i = 0;i<sampleconfigids.length;i++){
                        if(key == sampleconfigids[i]){
                            flag = true
                            break
                        }
                    }
                    if(!flag){
                        temp_sample_data[key] = sample_data[key]
                    }
                }
                sample_data = temp_sample_data
            }
            //初始化样本列表
            refreshHtmlByIdWithPromise('sample_center.html', 'div#addExistSampleDiv div.content').then(function(){
                initSelect('#sample_select', sample_data)
            })

        })
    })
}

/**
 * 在数据集中添加现有的样本id列表
 * @param data
 * @returns {Promise<Response>}
 */
function addSampleconfigInSamplegroup(data){
    return postJsonGetResponse(serverurl + '/annotation/addSampleconfigInSamplegroup', data)
}

/**
 * 获取当前所有的样本信息
 * @returns {Promise<unknown>}
 */
function getSampleconfig(){
    return fetchGetJson(serverurl + '/annotation/getSampleconfig')
}

/**
 * 通过数据集id查询数据集下的所有样本id
 * @param dataset_id
 * @returns {Promise<unknown>}
 */
function getSamplegroupbyid(data){
    //let data = {'samplegroupid' : dataset_id}
    return postJsonGetJson(serverurl + '/annotation/getSamplegroupbyid', data)
}

/**
 * 这个是用来添加样本的，但是这个样本并不属于任何数据集
 * @param data
 */
function addSampleconfig(data){
    return postJsonGetResponse(serverurl + '/annotation/addSampleconfig', data)
}

/**
 * 查询所有数据集信息
 * @returns {Promise<unknown>}
 */
function getSamplegroup(){
    return fetchGetJson(serverurl + '/annotation/getSamplegroup')
}

/**
 * 根据数据集id查询其中包含的样本id列表
 * @param data
 * @returns {Promise<unknown>}
 */
function getSamplegroupbyid(data){
    return postJsonGetJson(serverurl + '/annotation/getSamplegroupbyid', data)
}

/**
 * 根据样本id查询样本配置
 * @param data
 * @returns {Promise<unknown>}
 */
function getSampleconfigById(data){
    return postJsonGetJson(serverurl + '/annotation/getSampleconfigById', data)
}

/**
 * 添加数据集
 * @param data
 * @returns {Promise<unknown>}
 */
function addSamplegroup(data){
    return postJsonGetResponse(serverurl + '/annotation/addSamplegroup', data)
}

/**
 * 查询标注的数量
 * @param data
 * @returns {Promise<unknown>}
 */
function queryAnnoNumber(data){
    return postJsonGetJson(serverurl + '/annotation/queryNumber', data)
}

/**
 * 查询切片的数量
 * @param data
 * @returns {Promise<unknown>}
 */
function querySlideNumber(data){
    return postJsonGetJson(serverurl + '/slide/queryNumber', data)
}