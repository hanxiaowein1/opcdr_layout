function getSlidefromModel(data){
    return postJsonGetJson(zhangxueying_url + '/modelRecommend/getSlidefromModel', data)
}

function addModelRecommend(data){
    return postJsonGetJson(zhangxueying_url + '/modelRecommend/addModelRecommend', data)
}

function getSlidefromModel(data){
    return postJsonGetJson(zhangxueying_url + '/modelRecommend/getSlidefromModel', data)
}

function querySlideList(data){
    return postJsonGetJson(serverurl + '/slide/querySlideList', data)
}

function getRecommednAnno(data){
    return postJsonGetJson(zhangxueying_url + '/annoRecommend/getRecommednAnno', data)
}

function updateRecommendAnnotations(data){
    return postJsonGetJson(zhangxueying_url + '/annoRecommend/updateRecommendAnnotations', data)
}

function getSlidesFieldsCondition(data){
    return postJsonGetJson(serverurl + '/slide/getSlidesFieldsCondition', data)
}