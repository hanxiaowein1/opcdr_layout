/**
 * 数据集的缓存类
 */
class DatasetCache {
    constructor() {
        //网络原生的数据集信息
        this.samplegroups = []
        this.init()
    }

    init(){
        return getSamplegroup().then(function(json_data){
            this.samplegroups = json_data['data']['samplegroups']
            this.idContentMap = {}
            for(let i = 0;i<this.samplegroups.length;i++){
                this.idContentMap[this.samplegroups[i]['id']] = this.samplegroups[i]
            }
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

    /**
     * 根据数据集id，查询其内部的所有样本id
     * @param dataset_id
     * @returns {*[]|*}
     */
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

    /**
     * 根据数据集ID和样本缓存，来得到该数据集的训练样本数量和测试样本数量
     * @param datasetID
     * @param sampleCache
     * @returns {{test: number, train: number}}
     */
    getTrainTestSampleNumber(datasetID, sampleCache){
        let number = {'train':0, 'test':0}
        if(sampleCache.empty()){
            return number
        }else{
            let sample_list = this.idContentMap[datasetID]['sampleconfigids']
            for(const element of sample_list){
                let sample_content = sampleCache.idContentMap[element]
                let slide_category = sample_content['slide_category']
                if(slide_category.includes('train')){
                    number['train'] = number['train'] + 1
                }
                if(slide_category.includes('test')){
                    number['test'] = number['test'] + 1
                }
            }
            return number
        }
    }

    getTrainTestNumber(datasetID, sampleCache){
        let number = {'train':0, 'test':0}
        if(sampleCache.empty()){
            return number
        }else{
            let sample_list = this.idContentMap[datasetID]['sampleconfigids']
            for(const element of sample_list){
                let sample_content = sampleCache.idContentMap[element]
                number[sample_content['slide_category']]+=parseInt(sample_content['select_anno_number'])
            }
        }
        return number
    }


}

/**
 * 样本的缓存类
 */
class SampleCache{
    constructor() {
        this.sampleconfigs = []

        this.init()
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

    init(){
        getSampleconfig().then(function(json_data){
            this.sampleconfigs = json_data['data']['sampleconfigs']
            //初始化样本id与内容的map以方便查询
            this.idContentMap = {}
            for(let i = 0;i<this.sampleconfigs.length;i++){
                this.idContentMap[this.sampleconfigs[i]['id']] = this.sampleconfigs[i]
            }
        }.bind(this))
    }
}

let datasetCache = new DatasetCache()
let sampleCache = new SampleCache()