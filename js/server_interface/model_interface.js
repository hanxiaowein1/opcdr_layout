function listconfig(){
    return fetchGetJson(serverurl + "/model/listconfig")
}

function getModelConfigById(data){
    return postJsonGetJson(serverurl + '/model/getconfigbyid', data)
}

function getAllModelConfig(){
    return fetchGetJson(serverurl + "/model/listconfig")
}