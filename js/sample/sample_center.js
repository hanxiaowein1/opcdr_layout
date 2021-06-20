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

/**
 * 通过Promise.all，我看到了缓存的希望，因为以前需要用迭代来实现一次性大量的fetch请求，但是现在通过promise.all可以
 * 实现对多个fetch的等待，并且Promise.all([])空列表也是支持等待的，也就是说，当我在根据数据集id来查询sampleCache
 * 中的内容时，如果一个都不需要fetch，那么就可以使用Promise.all([])，如果发送了fetch请求，同样可以加到fetch列表中
 * 进行then操作。那么代码写起来就会变得很方便。
 * @type {*[]}
 */




//数据集的缓存信息
let samplegroups = []
//数据集id和样本id列表的map映射()
let samplegroupid_map_sampleid = {}
//样本列表：json传回来的原生信息
let sampleconfigs = []
//样本map:key为样本id，value为样本信息，为转换后的sampleconfigs，为了方便查询()
let sampleconfigs_map = {}

//初始化导航栏
fetch('nav_bar.html').then(function(response){
    return response.text()
}).then(function(text){
    const doc = new DOMParser().parseFromString(text, 'text/html')
    let temp_slide_center = doc.querySelector('#sample_center_nav')
    temp_slide_center.classList.add('active')
    let body = document.querySelector('body')
    body.insertBefore(doc.querySelector('ul'), body.firstChild)
    loadDataSetList()

    let slide_query = document.querySelector("div#addSampleDiv slide-query")
    let anno_query = document.querySelector("div#addSampleDiv anno-query")
    slide_query.init()
    anno_query.init()

})

/**
 * 初始化数据集列表
 */
function loadDataSetList(){
    getSamplegroup().then(function(json_data){
        let samplegroups = json_data['data']['samplegroups']
        let name = "pagination_dataset"
        //let theads = ['id', '名称', '样本数量', '训练数量', '测试数量', '创建时间']
        //let theads = ['id', '名称', '样本数量', '训练样本数量', '验证样本数量', '创建时间']
        let theads = ['名称', '训练样本数量', '验证样本数量']
        let callback = function(event){
            document.querySelector('#dataset_list').classList.add('myHide')
            document.querySelector('#sample_div').classList.remove('myHide')
            refreshSampleDiv()
        };
        let tr_generator = function(index, item){
            let tr = document.createElement('tr')
            tr.setAttribute('id', item['id'])

            let name_td = document.createElement('td')
            name_td.innerHTML = item['aliasname']
            tr.appendChild(name_td)

            let trainTestSampleNumber = datasetCache.getTrainTestSampleNumber(item['id'], sampleCache)

            //let td_list = simpleTdGenerator(index, item)
            let tdTrainSampleNumber = document.createElement('td')
            tdTrainSampleNumber.innerHTML = trainTestSampleNumber['train']
            tr.appendChild(tdTrainSampleNumber)
            let tdTestSampleNumber = document.createElement('td')
            tdTestSampleNumber.innerHTML = trainTestSampleNumber['test']
            tr.appendChild(tdTestSampleNumber)
            return tr
        }
        createPaginationTable(name, datasetCache.samplegroups, callback, theads, tr_generator)
    })
}

/**
 * 初始化样本列表
 */
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
        /**
         * 以前是通过fetch递归查询来实现循环的，但是效率太慢，要递归n次fetch，即串行了这么久
         * 但是现在有个promise_all，就可以等待所有的fetch了，很方便，
         * 而且递归的程序看起来也很诡异
         */
        let sample_list = []
        let fetch_array = []
        for(const elem of sampleconfigids){
            let data = {'sampleconfigId' : elem}
            fetch_array.push(getSampleconfigById(data))
        }

        Promise.all(fetch_array).then(function(rets){
            for(let elem of rets){
                sample_list.push(elem['data']['sampleconfig'])
            }

            //然后在初始化样本列表
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
            // let theads = ['样本名称', '训练/测试', '数量']
            let theads = ['样本名称', '训练/验证', '类别']
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
                if(item['slide_category'] == "test"){
                    slide_category_td.innerHTML = "val"
                }else{
                    slide_category_td.innerHTML = "train"
                }
                //slide_category_td.innerHTML = item['slide_category']

                let type_td = document.createElement('td')
                if(item['is_positive'].includes('Yes')){
                    type_td.innerHTML = "pos"
                }else{
                    type_td.innerHTML = "neg"
                }

                // let annoNumberTd = document.createElement('td')
                // annoNumberTd.innerHTML = item['anno_number']

                // let numberTd = document.createElement('td')
                // numberTd.innerHTML = item['select_anno_number']

                tr.appendChild(td)
                tr.appendChild(slide_category_td)
                tr.appendChild(type_td)
                //tr.appendChild(numberTd)
                return tr
            }
            createPaginationTable(name, content, callback, theads, tr_generator)

        })
    })
}

/**
 * 刷新sample容器
 */
function refreshSampleDiv(){
    refreshHtmlById('sample_center.html', '#sample_div', loadSampleList)
}

/**
 * 添加数据集
 * @param elem
 */
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

/**
 * 从样本列表返回数据集列表
 * @param elem
 */
function return2DataSetList(elem){
    document.querySelector("#sample_div").classList.add("myHide")
    document.querySelector("#dataset_list").classList.remove("myHide")
    refreshHtmlByIdWithPromise('sample_center.html', '#dataset_list').then(loadDataSetList)
}

/**
 * 添加样本
 * @param elem
 */
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
                                    sampleCache.init()
                                    datasetCache.init()
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

/**
 * 查询标注的数量
 * @param elem
 */
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

/**
 * 查询切片的数量
 */
function querySlideCount(){
    let slide_query = document.querySelector("div#addSampleDiv slide-query")
    if(slide_query.existEmpty()){
        console.log("切片选择栏目存在空！")
        return
    }

    let data = slide_query.getValues()
    querySlideNumber(data).then(function(json_data){
        let slide_number = json_data['data']['number']
        // let $form = $('div#queryResultDiv .ui.form')
        // $form.form('set value', 'slide_number', slide_number)
        let sample_info = document.querySelector('div#queryResultDiv sample-info')
        sample_info.setValue('slide_number', slide_number)
    })
}

/**
 * 检查表单的值是否存在空
 * @param values: 表单的key和value
 * @returns {boolean}: 如果存在空，则返回true，否则返回false
 */
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

/**
 * 添加现有样本
 * @param elem
 */
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
        let temp_data = {'samplegroupid':dataset_id}
        let temp_sample_data = []

        getSamplegroupbyid(temp_data).then(function(json_data){
            let sampleconfigids = json_data['data']['samplegroup']['sampleconfigids']
            if(sampleconfigids != null){
                //将sample_data中的id与sampleconfigids中的id进行对比
                for(let i = 0;i<sample_data.length;i++){
                    let sample_data_elem = sample_data[i]
                    let temp_sample_data_elem = {}
                    let size = 0
                    for(let key in sample_data_elem){
                        //如果在则为true
                        let flag = false
                        for(let i = 0;i<sampleconfigids.length;i++){
                            if(key == sampleconfigids[i]){
                                flag = true
                                break
                            }
                        }
                        if(!flag){
                            temp_sample_data_elem[key] = sample_data_elem[key]
                            size = size + 1
                        }
                    }
                    if(size != 0){
                        temp_sample_data.push(temp_sample_data_elem)
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
