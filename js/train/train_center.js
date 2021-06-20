//初始化导航栏和页面
fetch('nav_bar.html').then(function(response){
    return response.text()
}).then(function(text){
    const doc = new DOMParser().parseFromString(text, 'text/html')
    let temp_train_center = doc.querySelector("#train_center_nav")
    temp_train_center.classList.add('active')
    let body = document.querySelector('body')
    body.insertBefore(doc.querySelector('ul'), body.firstChild)
    loadTrainList()

    let train_adder1 = document.querySelector('#train_adder1')
    train_adder1.init()

    let train_adder2 = document.querySelector('#train_adder2')
    train_adder2.init()

    $("#sample_detail").accordion()
    //$("#model_detail").accordion()
    $("#train_detail").accordion()
})

let train_list = []

/**
 * 初始化训练列表
 */
function loadTrainList(){
    getTrainConfigs().then(function(json_data){
        return json_data["data"]["items"]
    }).then(function(data){
        train_list = data
        //应该在得到train_list的时候就直接初始化里面的内容消息
        let fetch_list = []
        fetch_list.push(getSamplegroup())
        fetch_list.push(getAllModelConfig())
        Promise.all(fetch_list).then(function(values){
            let dataset_list = values[0]['data']['samplegroups']
            let modelconfig_list = values[1]['data']['list']

            for(let i = 0;i<train_list.length;i++){
                let dataset_id = train_list[i]['samplegroupid']
                for(let j = 0;j<dataset_list.length;j++){
                    if(dataset_list[j]['id'] == dataset_id){
                        train_list[i]['dataset_name'] = dataset_list[j]['aliasname']
                        break
                    }
                }
                let modelconfig_id = train_list[i]['modelconfigid']
                for(let j = 0;j<modelconfig_list.length;j++){
                    if(modelconfig_list[j]['id'] == modelconfig_id){
                        train_list[i]['modelconfig_name'] = modelconfig_list[j]['aliasname']
                        break
                    }
                }
            }



            let name = "pagination_train"
            let theads = ['状态', '名称', '数据集名称', '模型配置名称']
            let callback = displayTrainDetail
            let tr_generator = function(index, item){
                let tr = document.createElement('tr')
                tr.setAttribute('id', item['id'])

                let status_td = document.createElement('td')
                let status_img = document.createElement('img')
                if(item['status'] == '0'){
                    status_img.src = "images/pending.png"
                }else if(item['status'] == '1'){
                    status_img.src = "images/inprogress.png"
                }else{
                    status_img.src = "images/complete.png"
                }
                status_img.style = 'width:15px;height:15px'
                status_td.appendChild(status_img)
                tr.appendChild(status_td)

                let name_td = document.createElement('td')
                name_td.innerText = item['aliasname']
                tr.appendChild(name_td)

                let dataset_td = document.createElement('td')
                dataset_td.innerText = item['dataset_name']
                //dataset_td.innerText = '测试数据集'
                tr.appendChild(dataset_td)

                let modelconfig_td = document.createElement('td')
                modelconfig_td.innerText = item['modelconfig_name']
                //modelconfig_td.innerText = '测试参数'
                tr.appendChild(modelconfig_td)

                return tr
            }

            createPaginationTable(name, train_list, callback, theads, tr_generator)

        })

    })
}

function initSampleAndModel(){
    //TODO:向服务器查询模型名和样本批次
}

/**
 * 创建训练曲线图
 * @param elem
 */
function createDiagram(elem){
    let target = elem.target.closest('tr')
    // 图表配置
    let options = {
        chart: {
            type: 'spline',                          //指定图表的类型，默认是折线图（line）
            events: {
                load:function(){
                    let series = this.series;
                    let chart = this;
                    let refrehChart = function(){
                        let data = {'id':target.getAttribute('id')}
                       // let data = {"id":target.innerHTML}
                        getTrainResult(data).then(function(ret_json){
                            Array.from(series).forEach(function(item){
                                let data = ret_json["data"]["result"][item.name]
                                let set_data = []
                                for(let i = 0;i<data.length;i++){
                                    let temp_data = {}
                                    temp_data["x"] = i
                                    temp_data["y"] = parseFloat(data[i])
                                    set_data.push(temp_data)
                                }
                                item.setData(set_data)
                            })
                        })
                    }
                    refrehChart()
                    setInterval(refrehChart, 100000);
                }
            }
        },
        legend:{
            itemStyle:{
                fontSize:"19px"
            }
        },
        title: {
            text: 'train loss'                 // 标题
        },
        xAxis: {
            title:{
                text:'batch',
                style:{
                    fontSize : "20px"
                }
            },
            labels : {
                style:{
                    fontSize: "18px"
                }
            },
            minTickInterval: 1
        },
        yAxis: {
            title: {
                text: '',                // y 轴标题
                style:{
                    fontSize : "20px"
                }
            },
            labels : {
                style:{
                    fontSize: "18px"
                }
            }
            //max: 1
        },
        series: [{
            name: 'val_loss',
            data:[]
        },{
            name: 'loss',
            data: []
        }],
        colors:['#ff0000', '#eeef00'],
        credits:{
            enabled: false
        }
    };

    let options2 =  {
        chart: {
            type: 'spline',                          //指定图表的类型，默认是折线图（line）
            events: {
                load:function(){
                    let series = this.series;
                    let chart = this;
                    let refrehChart = function(){
                        let data = {'id':target.getAttribute('id')}
                        // let data = {"id":target.innerHTML}
                        getTrainResult(data).then(function(ret_json){
                            Array.from(series).forEach(function(item){
                                let data = ret_json["data"]["result"][item.name]
                                let set_data = []
                                for(let i = 0;i<data.length;i++){
                                    let temp_data = {}
                                    temp_data["x"] = i
                                    temp_data["y"] = parseFloat(data[i])
                                    set_data.push(temp_data)
                                }
                                item.setData(set_data)
                            })
                        })
                    }
                    refrehChart()
                    setInterval(refrehChart, 100000);
                }
            }
        },
        legend:{
            itemStyle:{
                fontSize:"19px"
            }
        },
        title: {
            text: 'train accuracy',                 // 标题
        },
        xAxis: {
            title:{
                text:'batch',
                style:{
                    fontSize: "20px"
                }
            },
            labels:{
                style:{
                    fontSize:"18px"
                }
            },
            minTickInterval: 1
        },
        yAxis: {
            title: {
                text: ''                // y 轴标题
            },
            max: 1,
            labels : {
                style:{
                    fontSize:"18px"
                }
            }
        },
        series: [{
            name: 'val_binary_accuracy',
            data: []
        },{
            name:'binary_accuracy',
            data: []
        }],
        credits:{
            enabled: false
        }
    };


    // 图表初始化函数
    let chart = Highcharts.chart('diagram-container1', options);
    let chart2 = Highcharts.chart('diagram-container2', options2);
}

/**
 * 展示训练的详细信息
 * @param elem
 */
function displayTrainDetail(elem){
    console.log(elem.innerHTML)
    refreshHtmlById('train_center.html', '#train_detail', function(){
        createDiagram(elem)
    })

    initTrainInfoShow(elem)
}

/**
 * 展示训练的参数
 * @param elem
 */
function initTrainInfoShow(elem){
    let target = elem.target.closest('tr')
    let id = target.getAttribute('id')

    let trainAdder1 = document.querySelector("#train_adder1")

    for(let i = 0;i< train_list.length;i++){
        let element = train_list[i]
        if(element['id'] == id){
            trainAdder1.restoreDefaults()
            let data = trainAdder1.convertWeb2Local(element)
            trainAdder1.setValues(data)
            break
        }
    }
}

/**
 * 展示添加训练任务模态框
 * @param elem
 */
function showAddTrainDiv(elem){
    //初始化
    $("#add_train_div").modal({
        onApprove : function(){
            let train_adder = document.querySelector('div#add_train_div train-adder')
            // if(train_adder.existEmpty()){
            //     // alert('train adder exist empty')
            //     // return
            // }
            {
                let values = train_adder.getValues()
                values = train_adder.convertLocal2Web(values)
                //需要将normalization的数据拼接到一起


                //由于李旭的需要sampleconfigids，因此需要再次查询
                let data = {'samplegroupid': values['samplegroupid']}
                getSamplegroupbyid(data).then(function(json_data){
                    let sampleconfigids = json_data['data']['samplegroup']['sampleconfigids']
                    values['sampleconfigids'] = sampleconfigids
                    //接下来的三个数据都是伪数据
                    values['gpunumbers'] = [0]
                    values['txtpath'] = ''
                    values['modelpath'] = ''
                    values['uffpath'] = ''
                    values['status'] = '0'
                    let data = values
                    addTrainConfig(data).then(function(response){
                        if(response.ok){
                            console.log('添加训练任务成功')
                            //刷新训练列表
                            refreshHtmlById("train_center.html", "#train_shower", function(){
                                loadTrainList()
                            })
                        }else{
                            alert('添加训练任务失败')
                        }
                    })
                })
            }


        }
    }).modal('show')
}

/**
 * 添加训练任务
 * @param elem
 */
function addTrain(elem){
    //TODO:向服务器提交训练请求



    //document.querySelector("#add_train_div").classList.add("myHide")
    //刷新列表
    refreshHtmlById("train_center.html", "#train_list", function(){
        loadTrainList()
    })
    document.querySelector("#train_shower").classList.remove("myHide")
}

function cancel(elem){
    document.querySelector("#add_train_div").classList.add("myHide")
    document.querySelector("#train_shower").classList.remove("myHide")
}

/**
 * 开始训练任务
 * @param elem
 */
function startTrain(elem)
{
    //查找当前选中的训练列表
    let selected_tr = document.querySelector("#train_list tr.elem_selected")

    let id = selected_tr.getAttribute("id")
    let data = {'id': id}
    execScript(data).then(function(json_data){
        //刷新训练的列表
        refreshHtmlByIdWithPromise("train_center.html", "#train_shower").then(loadTrainList)
    })
}