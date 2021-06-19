
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