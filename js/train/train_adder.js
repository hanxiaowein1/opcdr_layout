/**
 * 添加训练的表单集合类
 */
class TrainAdder extends SelectBase{
    constructor() {
        super();
        console.log("TrainAdder construct")
        fetchGetText('template.html').then(function(text){
            const doc = new DOMParser().parseFromString(text, 'text/html')
            let template = doc.querySelector("#trainAdder")
            let content = template.content.cloneNode(true)

            this.id_prefix = this.getAttribute('id')

            content = this.setSpecialId(content)

            this.appendChild(content)
            //this.init()
        }.bind(this))
    }

    init(){

        //初始化其他的下拉框
        this.initSelect("spatial_augmentation", [])
        this.initSelect("stylish_augmentation", [])
        this.initSelect("optimizer", [])
        this.initSelect("lr_scheduler", [])

        let fetchArray = []
        fetchArray.push()
        //初始化数据集下拉框
        let fetch1 = getSamplegroup().then(function(json_data){
            let datasetIDNameMap = []
            for(const element of json_data['data']['samplegroups']){
                let tempData = {}
                tempData[element['id']] = element['aliasname']
                datasetIDNameMap.push(tempData)
            }
            //初始化下拉框
            this.initSelect('sample_select', datasetIDNameMap)
        }.bind(this))

        //初始化模型下拉框
        let fetch2 = listconfig().then(function(json_data){
            let modelconfigIDNameMap = []
            for(const element of json_data['data']['list']){
                let tempData = {}
                tempData[element['id']] = element['aliasname']
                modelconfigIDNameMap.push(tempData)
            }
            this.initSelect('model_select', modelconfigIDNameMap)
        }.bind(this))

        //初始化训练批次下拉框
        let fetch3 = getTrainConfigs().then(function(json_data){
            if(json_data['success'] == true){
                let data = json_data['data']['items']
                let trainSelectorData = []
                Array.from(data).forEach(function(elem){
                    let tempData = {}
                    tempData[elem['id']] = elem['aliasname']
                    trainSelectorData.push(tempData)
                })
                this.initSelect('pretrainedtrainconfigid', trainSelectorData)
            }else{
                alert("get train configs failed")
            }
        }.bind(this))

        fetchArray.push(fetch1)
        fetchArray.push(fetch2)
        fetchArray.push(fetch3)

        return fetchArray

    }

    /**
     * 将本地表单的数据转换为web上所需要的数据
     * @param data
     */
    convertLocal2Web(data){
        data['normalization'] = []
        data['normalization'].push(data['normalization_left'])
        data['normalization'].push(data['normalization_right'])

        //还需要将样本的每轮训练数量由字符串转为列表
        let data_per_epoch = []
        let data_per_epoch_str = data['dataperepoch'].split(',')
        Array.from(data_per_epoch_str).forEach(function(elem){
            data_per_epoch.push(parseInt(elem))
        })
        data['dataperepoch'] = data_per_epoch

        delete data['normalization_left']
        delete data['normalization_right']
        return data
    }

    /**
     * 将web传回来的数据转换为本地表单的数据
     * @param data
     */
    convertWeb2Local(data){
        let temp_data = data
        if('normalization' in temp_data){
            temp_data['normalization_left'] = data['normalization'][0]
            temp_data['normalization_right'] = data['normalization'][1]
            let tempDataPerEpochStr = ''
            for(let i = 0;i<data['dataperepoch'].length;i++){
                tempDataPerEpochStr = tempDataPerEpochStr + data['dataperepoch'][i] + ','
            }
            tempDataPerEpochStr = tempDataPerEpochStr.substring(0, tempDataPerEpochStr.length - 1)
            temp_data['dataperepoch'] = tempDataPerEpochStr
            delete temp_data['normalization']
            return temp_data
        }
        else{
            return data
        }
    }
}

window.customElements.define("train-adder", TrainAdder)