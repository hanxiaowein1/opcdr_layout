fetch('nav_bar.html').then(function(response){
    return response.text()
}).then(function(text){
    const doc = new DOMParser().parseFromString(text, 'text/html')
    let temp_train_center = doc.querySelector("#train_center_nav")
    temp_train_center.classList.add('active')
    let body = document.querySelector('body')
    body.insertBefore(doc.querySelector('ul'), body.firstChild)
    loadTrainList()
    initSelect("#sample_select", [{
        '1':"sample1"
    },{
        "2":"sample2"
    }])
    initSelect("#model_select", [])
    $("#sample_detail").accordion()
    $("#model_detail").accordion()
    $("#train_detail").accordion()
})

let train_list = []

function loadTrainList(){
    fetch(serverurl + "/train/getconfigs").then(function(response){
        return response.json()
    }).then(function(json_data){
        return json_data["data"]["items"]
    }).then(function(data){
        train_list = data

        let name = "pagination_train"
        let callback = displayTrainDetail
        let content = train_list
        let li_generator = function(index, item){
            let li = document.createElement('li')
            li.innerText = item["id"]
            return li
        }
        createPagination(name, content, callback, li_generator)
    })
}

function initSampleAndModel(){
    //TODO:向服务器查询模型名和样本批次
}

//elem:点击的列表时间
function createDiagram(elem){
    let target = elem.target
    // let data = [{
    //     x: 0,
    //     y: 0
    // }];
    // 图表配置
    let options = {
        chart: {
            type: 'spline',                          //指定图表的类型，默认是折线图（line）
            events: {
                load:function(){
                    let series = this.series;
                    let chart = this;
                    let refrehChart = function () {
                        let data = {"id":target.innerHTML}
                        fetch(serverurl + "/script/result",{
                            method:'POST',
                            headers : new Headers({
                                'Content-Type': 'application/json'
                            }),
                            body: JSON.stringify(data)
                        }).then(function(response){
                            return response.json()
                        }).then(function(ret_json){
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
                            // //现在只画一条准确曲线
                            // let binary_accuracy = ret_json["data"]["result"]["val_loss"]
                            // let set_data = []
                            // for(let i = 0;i<binary_accuracy.length;i++){
                            //     let temp_data = {}
                            //     temp_data["x"] = i
                            //     temp_data["y"] = parseFloat(binary_accuracy[i])
                            //     set_data.push(temp_data)
                            // }
                            // series[0].setData(set_data)
                        })
                    }
                    refrehChart()
                    setInterval(refrehChart, 100000);
                }
            }
        },
        title: {
            text: 'train info'                 // 标题
        },
        xAxis: {
            title:{
                text:'batch'
            },
            minTickInterval: 1
        },
        yAxis: {
            title: {
                text: ''                // y 轴标题
            },
            max: 1
        },
        series: [{
            name: 'val_loss',
            data:[]
        },{
            name: 'val_binary_accuracy',
            data: []
        },{
            name: 'loss',
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
}

function displayTrainDetail(elem){
    console.log(elem.innerHTML)
    refreshHtmlById('train_center.html', '#train-diagram', function(){
        initSampleAndModel()
        $("#sample_detail").accordion()
        $("#model_detail").accordion()
        $("#train_detail").accordion()
        createDiagram(elem)
    })
}

function showAddTrainDiv(elem){
    $("#add_train_div").modal({
        onApprove : function(){
            //TODO:向服务器提交请求
            console.log("提交训练任务")
            refreshHtmlById("train_center.html", "#train_shower", function(){
                loadTrainList()
            })
        }
    }).modal('show')
}

function addTrain(elem){
    //TODO:向服务器提交训练请求
    document.querySelector("#add_train_div").classList.add("myHide")
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

