function addTrainConfig(data){
    return postJsonGetResponse(serverurl + '/train/addconfig', data)
}

function getTrainConfigs(){
    return fetchGetJson(serverurl + '/train/getconfigs')
}

/**
 *
 * @param data:{'id':train_id}
 */
function getTrainResult(data){
    return postJsonGetJson(serverurl + "/script/result", data)
}

function execScript(data){
    return postJsonGetJson(serverurl + "/script/exec", data)
}