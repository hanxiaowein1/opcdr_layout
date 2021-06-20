/**
 * 模型配置缓存类
 */
class ModelCache{
    constructor() {
        this.modelList = []
        this.init()
    }
    init(){
        listconfig().then(function(json_data){
            this.modelList = json_data['data']['list']
            this.idContentMap = {}
            for(const element of this.modelList){
                this.idContentMap[element['id']] = element
            }
        }.bind(this))
    }
    empty(){
        if(this.modelList.length == 0){
            return true
        }else{
            return false
        }
    }
}

let modelCache = new ModelCache()