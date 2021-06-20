// const serverurl = "http://huaiguangcsh.f3322.net:2004"
// const serverurl = "http://59.172.144.41:2004"

const serverurl = "http://medicalimage.f3322.net:2004"

function replaceClass(elem, pre, pos){
    elem.classList.remove(pre)
    elem.classList.add(pos)
}

/**
 * 获取html元素的所有邻居
 * @param e：html元素
 * @returns {*[]}：所有邻居元素
 */
function getAllSiblings(e) {
    // for collecting siblings
    let siblings = [];
    // if no parent, return no sibling
    if(!e.parentNode) {
        return siblings;
    }
    // first child of the parent node
    let sibling  = e.parentNode.firstChild;

    // collecting siblings
    while (sibling) {
        if (sibling.nodeType === 1 && sibling !== e) {
            siblings.push(sibling);
        }
        sibling = sibling.nextSibling;
    }
    return siblings;
}

function setSiblingsDisabled(elem){
    siblings = getAllSiblings(elem)
    Array.from(siblings).forEach(function(sibling){
        if(elem.tagName == sibling.tagName){
            sibling.classList.add("disabled")
        }
    })
}

function setNavByEvent(event){
    return setNav(event.target)
}

/**
 * 只设置导航栏为当前元素，其他不操作
 * @param elem
 */
function setNav(elem){
    let siblings = getAllSiblings(elem)
    Array.from(siblings).forEach(function(sibling){
        let a_elem = sibling.querySelector("a.active")
        if(a_elem!=null){
            //a_elem.classList.replace("active", "disabled")
            a_elem.classList.remove('active')
        }
    })
    let current_a_elem = elem.querySelector("a");
    if(current_a_elem == null)
        return false
    current_a_elem.classList.add("active")
    return true
}

function navFuncByElem(elem){
    let siblings = getAllSiblings(elem)
    Array.from(siblings).forEach(function(sibling){
        let a_elem = sibling.querySelector("a.active")
        if(a_elem!=null){
            a_elem.classList.replace("active", "disabled")
            changeDisplayStateByAid(a_elem.id)//这里就可以使用MutationObserver监听
        }
    })
    //将当前li设置为选中
    let current_a_elem = elem.querySelector("a.disabled");
    if(current_a_elem == null)
        return false
    current_a_elem.classList.replace("disabled", "active")

    //获取当前的li id
    let current_a_id = current_a_elem.id
    changeDisplayStateByAid(current_a_id)
    return true
}

/**
 * 将点击的导航变成选中状态，其他的变成disabled状态
 * @param event
 * @returns {boolean}
 */
function navFunc(event){
    return navFuncByElem(event.target)
}

function clickCallBack_Log(elem){
    console.log(elem.target.innerHTML)
}


function changeTableRowSelected(event){
    //let parent_elem = event.target.parentElement
    let parent_elem = event.target.closest('tbody')
    let selected_elems = parent_elem.querySelectorAll('tr.elem_selected')
    Array.from(selected_elems).forEach(function(selected_elem){
        selected_elem.classList.remove("elem_selected")
    })
    //event.target.classList.add("elem_selected")
    event.target.closest('tr').classList.add('elem_selected')
    return event
}

function createPaginationTable(name, content, click_callback, theads, tr_generator){
    let container = $('#' + name)
    let sources = content

    let options = {
        dataSource: sources,
        pageSize: 10,
        locator:'items',
        showGoInput: true,
        showPageNumbers: false,
        showNavigator: true,
        showGoButton: true,
        callback:function(response, pagination){
            let dataHtml = document.createElement('table')
            dataHtml.classList.add('ui')
            dataHtml.classList.add('single')
            dataHtml.classList.add('line')
            dataHtml.classList.add('table')

            let thead = document.createElement('thead')
            let tr = document.createElement('tr')
            for(let i = 0;i<theads.length;i++){
                let th = document.createElement('th')
                th.innerHTML = theads[i]
                tr.appendChild(th)
            }
            thead.appendChild(tr)
            dataHtml.appendChild(thead)

            let tbody = document.createElement('tbody')
            $.each(response, function(index, item){
                let tr = tr_generator(index, item)
                if(index % 2 ==0){
                    tr.classList.add('pagination_tr_style1')
                }else{
                    tr.classList.add('pagination_tr_style2')
                }
                tbody.appendChild(tr)
            })
            dataHtml.appendChild(tbody)
            container.prev().html(dataHtml.outerHTML)

            let normal_container = container.get(0)
            let table_rows = normal_container.parentElement.querySelectorAll('div.data-container tbody tr')
            Array.from(table_rows).forEach(function(row){
                row.addEventListener('click', click_callback)
                row.addEventListener('click', changeTableRowSelected)
            })
        }
    }

    container.addHook('beforeInit', function(){
        window.console && console.log('beforeInit...');
    });
    container.pagination(options);
    container.addHook('beforePageOnClick', function(){
        window.console && console.log('beforePageOnClick...');
    });
    return container;
}

function changeListSelected(event){
    let parent_ul_elem = event.target.parentElement
    //将上一次的选中的list颜色修改为正常
    let selected_sample_elems = parent_ul_elem.querySelectorAll("li.elem_selected")
    Array.from(selected_sample_elems).forEach(function(selected_sample_elem){
        //selected_sample_elem.className = "sample_elem"
        selected_sample_elem.classList.remove("elem_selected")
    })
    event.target.classList.add("elem_selected")
    return event
}

//li_generator:li元素生成函数，从外部传入，这样li就能够更加的个性化
function createPagination(name, content, click_callback, li_generator){
    let container = $('#' + name)
    let sources = content
    let options = {
        dataSource: sources,
        pageSize: 30,
        locator:'items',
        showGoInput: true,
        showPageNumbers: false,
        showNavigator: true,
        showGoButton: true,
        callback:function(response, pagination){
            let dataHtml = document.createElement("ul")
            $.each(response, function(index, item){
                let li = li_generator(index, item)
                if(index % 2 == 0){
                    li.classList.add("pagination_li_style1")
                }else{
                    li.classList.add("pagination_li_style2")
                }
                //li.classList.add("")
                console.log(index)
                dataHtml.appendChild(li)
            })

            // let dataHtml = '<ul>'
            // $.each(response, function(index, item){
            //     dataHtml += '<li>' + item +'</li>';
            // });
            // dataHtml += '</ul>';
            //container.prev().html(dataHtml);
            container.prev().html(dataHtml.outerHTML)
            let normal_container = container.get(0)
            let li_elems = normal_container.parentElement.querySelectorAll('div.data-container li')
            Array.from(li_elems).forEach(function(li_elem){
                li_elem.addEventListener('click', changeListSelected)
                li_elem.addEventListener('click', click_callback)
            })
        }
    }
    container.addHook('beforeInit', function(){
        window.console && console.log('beforeInit...');
    });
    container.pagination(options);
    container.addHook('beforePageOnClick', function(){
        window.console && console.log('beforePageOnClick...');
    });
    return container;
}

function web2local(web_json){
    let local_json = {};
    local_json["@context"] = "http://www.w3.org/ns/anno.jsonld";
    local_json["id"] = "#a88b22d0-6106-4872-9435-c78b5e89fede";
    local_json["type"] = "Annotation";

    let body = new Array();
    let body_content = {};
    body_content["type"]="TextualBody";
    body_content["purpose"]="tagging";
    body_content["value"]=web_json["type"];
    body.push(body_content);
    local_json["body"] = body;

    let target = {}
    let selector = new Array();
    let selector_content = {};
    if(web_json["shape"] == "rect"){
        selector_content["type"] = "FragmentSelector";
        selector_content["conformsTo"] = "http://www.w3.org/TR/media-frags/";
        selector_content["value"] = "xywh=pixel:" + web_json["points"];
    }
    selector.push(selector_content);
    target["selector"] = selector;
    local_json["target"] = target;
    return local_json
    //console.log(local_json);
}

function localAnno2WebAnno(local_json)
{
    let web_json = {}
    let selector_content = local_json["target"]["selector"]
    if(Array.isArray(selector_content)){
        web_json['cir_rect'] = selector_content[0]["value"].split(":")[1]
    }
    else{
        web_json['cir_rect'] = selector_content["value"].split(":")[1]
    }
    web_json["anno_class"] = local_json["body"][0]["value"]
    return web_json
}

/**
 * 将网上的一个标注转换为annotorious支持的格式
 * @param web_json: {"anno_class":"HSIL", "cir_rect":"x,y,w,h", "center_point":"x,y", "top_left":"x,y", "type":"Rect"}
 */
function webAnno2LocalAnno(web_json)
{
    let local_json = {}
    local_json["@context"] = "http://www.w3.org/ns/anno.jsonld";
    local_json["id"] = "#0";
    local_json["type"] = "Annotation";

    let body = new Array();
    let body_content = {};
    body_content["type"]="TextualBody";
    body_content["purpose"]="tagging";
    body_content["value"]=web_json["anno_class"];
    body.push(body_content);
    local_json["body"] = body;

    let target = {}
    let selector = new Array();
    let selector_content = {};
    if(web_json["type"] == "Rect"){
        selector_content["type"] = "FragmentSelector";
        selector_content["conformsTo"] = "http://www.w3.org/TR/media-frags/";
        if(web_json["cir_rect"] == null){
            //如果是第一次，那么就为空，那么我就直接在左上角畫框
            let center_point = {}
            center_point['x'] = parseInt(web_json['center_point'].split(',')[0])
            center_point['y'] = parseInt(web_json['center_point'].split(',')[1])
            let top_left = {}
            top_left['x'] = parseInt(web_json['top_left'].split(',')[0])
            top_left['y'] = parseInt(web_json['top_left'].split(',')[1])
            let x = 50
            let y = 50
            let w = ((center_point['x'] - top_left['x']) - x)
            let h = ((center_point['y'] - top_left['y']) - y)
            selector_content['value'] = "xywh=pixel:"
                + x.toString() + ','
                + y.toString() + ','
                + w.toString() + ','
                + h.toString()
        }else{
            //如果不是第一次
            let top_left = {}
            top_left['x'] = parseInt(web_json['top_left'].split(',')[0])
            top_left['y'] = parseInt(web_json['top_left'].split(',')[1])

            let x = parseInt(web_json['cir_rect'].split(',')[0]) - top_left['x']
            let y = parseInt(web_json['cir_rect'].split(',')[1]) - top_left['y']
            let w = parseInt(web_json['cir_rect'].split(',')[2])
            let h = parseInt(web_json['cir_rect'].split(',')[3])

            selector_content['value'] = "xywh=pixel:"
                + x.toString() + ','
                + y.toString() + ','
                + w.toString() + ','
                + h.toString()
        }
    }
    selector.push(selector_content);
    target["selector"] = selector;
    local_json["target"] = target;
    return local_json
}

function web2local_version(web_json){
    let local_json = {};
    local_json["@context"] = "http://www.w3.org/ns/anno.jsonld";
    local_json["id"] = "#a88b22d0-6106-4872-9435-c78b5e89fede";
    local_json["type"] = "Annotation";

    let body = new Array();
    let body_content = {};
    body_content["type"]="TextualBody";
    body_content["purpose"]="tagging";
    body_content["value"]=web_json["type"];
    body.push(body_content);
    local_json["body"] = body;

    let target = {}
    let selector = new Array();
    let selector_content = {};
    if(web_json["shape"] == "rect"){
        selector_content["type"] = "FragmentSelector";
        selector_content["conformsTo"] = "http://www.w3.org/TR/media-frags/";
        selector_content["value"] = "xywh=pixel:" + web_json["points"];
    }
    selector.push(selector_content);
    target["selector"] = selector;
    local_json["target"] = target;
    return local_json
    //console.log(local_json);
}

function changeAnnoColor(anno){
    let id = anno['id']

    let elem = document.querySelector("g[data-id=" + "\"" + id + "\"" + "]")
    if(anno['body'][0]['value']){
        elem.classList.add(anno['body'][0]['value'])
    }
    // if(anno['body'][1]['value'] == "HSIL"){
    //     elem.classList.add("HSIL")
    // }
    // if(anno['body'][1]['value'] == "LSIL"){
    //     elem.classList.add("LSIL")
    // }
}

function createCanvas(elem, status, local_json, update_function){
    let anno = Annotorious.init({
        image:elem,
        locale:'auto',
        widgets:[
            // 'COMMENT',
            {widget: 'TAG', vocabulary:['HSIL', 'LSIL', 'Ascus', 'Normal']}
        ]
    })
    anno.setAuthInfo({
        id: 'http://www.example.com/rainer',
        displayName: 'rainer'
    });

    anno.on("createAnnotation", function(annotation){
        console.log('crate annotation')
    })

    anno.on('updateAnnotation', function(annotation, previous){
        changeAnnoColor(annotation)
        console.log('update annotation')

        //将同层级的图像改为逗号
        // if(status!=null){
        //     // status.src='images/tick.jpg'
        //     status.src = 'images/checked.svg'
        // }
        update_function(annotation, elem, status)

    })
    anno.setDrawingTool('rect');

    if(local_json == null){
        let local_str = ' { \n' +
            '    "@context": "http://www.w3.org/ns/anno.jsonld",\n' +
            '    "id": "#0",\n' +
            '    "type": "Annotation",\n' +
            '    "body": [{\n' +
            '      "type": "TextualBody",\n' +
            '      "value": "Ceil"\n' +
            '    }, {\n' +
            '      "type": "TextualBody",\n' +
            '      "purpose": "tagging",\n' +
            '      "value": "HSIL"\n' +
            '    }],\n' +
            '    "target": {\n' +
            '      "selector": [{\n' +
            '        "type": "FragmentSelector",\n' +
            '        "conformsTo": "http://www.w3.org/TR/media-frags/",\n' +
            '        "value": "xywh=pixel:2,2,450,450"\n' +
            '      }]\n' +
            '    }\n' +
            '  }'
        local_json = JSON.parse(local_str)
    }

    // let local_json = JSON.parse(local_str)

    anno.addAnnotation(local_json)

    return anno
    // let web_json = {"shape":"rect", "type":"HSIL", "points":"1,1,50,50"};
    // let local_json = web2local_version(web_json);
    // anno.addAnnotation(local_json);
    //console.log('test')
}

function initSelect(id, data){
    let pici_select = document.querySelector(id)
    for(let i=0;i<data.length;i++){
        let current = data[i]
        let key = Object.keys(current)[0]
        let value = current[key]
        let option = document.createElement("option")
        option.value = key
        option.innerText = value
        pici_select.appendChild(option)
        // let elem = "<option value=\"" + key + "\">" + value + "</option>"
        // pici_select.appendChild(elem)
    }
    $(id).dropdown()
}

function refreshHtmlByIdWithPromise(html, id){
    return fetch(html).then(function(response){
        return response.text()
    }).then(function(text){
        const doc = new DOMParser().parseFromString(text, 'text/html')
        let src = doc.querySelector(id)
        let dst = document.querySelector(id)
        dst.innerHTML = src.innerHTML
    })
}

/**
 * 通过id来重置该id的内部html
 * @param html:html的名称
 * @param id:要刷新的html的id
 * @param yourFunction:你想要执行的函数
 */
function refreshHtmlById(html, id, yourFunction){
    fetch(html).then(function(response){
        return response.text()
    }).then(function(text){
        const doc = new DOMParser().parseFromString(text, 'text/html')
        let src = doc.querySelector(id)
        let dst = document.querySelector(id)
        dst.innerHTML = src.innerHTML
        yourFunction()
    })
}

/**
 * 通过id来重置该id的外部html
 * @param html
 * @param id
 * @param yourFunction
 */
function refreshOuterHtmlById(html, id, yourFunction){
    fetch(html).then(function(response){
        return response.text()
    }).then(function(text){
        const doc = new DOMParser().parseFromString(text, 'text/html')
        let src = doc.querySelector(id)
        let dst = document.querySelector(id)
        dst.outerHTML = src.outerHTML
        yourFunction()
    })
}


function getFormatSelectData(data)
{
    let ret = []
    for(let i = 0;i<data.length;i++)
    {
        let temp_data = {}
        temp_data[data[i]] = data[i]
        ret.push(temp_data)
        //ret[i] = data[i]
    }
    return ret
}

function postJsonGetResponse(url, data){
    return fetch(url, {
        method: 'POST',
        headers : new Headers({
            'Content-Type': 'application/json'
        }),
        body : JSON.stringify(data)
    })
}

function postJsonGetJson(url, data){
    return postJsonGetResponse(url, data).then(function(response){
        return response.json()
    })
}

function postJsonGetText(url, data){
    return fetch(url, {
        method: 'POST',
        headers : new Headers({
            'Content-Type': 'application/json'
        }),
        body : JSON.stringify(data)
    }).then(function(response){
        return response.text()
    })
}

function fetchGetJson(url){
    return fetch(url).then(function(response){
        return response.json()
    })
}

function fetchGetText(url){
    return fetch(url).then(function(response){
        return response.text()
    })
}

/**
 * 获取对象的类型，例如Promise对象返回'promise'
 * @param obj
 * @returns {string}
 */
function typeOf(obj) {
    return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
}

function simpleTdGenerator(index, item){
    let td_list = []
    for(let key in item){
        let td = document.createElement('td')
        if(typeOf(item[key]) == 'array'){
            td.innerHTML = item[key].length
        }
        else {
            if(item[key] == null){
                td.innerHTML = '空'
            }else{
                td.innerHTML = item[key]
            }
        }
        td_list.push(td)
    }
    return td_list
}

class SelectBase extends HTMLElement{
    constructor() {
        super();
    }

    getRealId(id){
        // return '#' + this.id_prefix + id
        return '#' + this.getAttribute('id') + id
    }

    //单独设置id
    setSpecialId(content){
        let multiSelectors = content.querySelectorAll(".ui.dropdown")
        Array.from(multiSelectors).forEach(function(elem){
            elem.id = this.id_prefix + elem.id
        }.bind(this))
        return content
    }

    //为特有的id设置select
    initSelect(id, data){
        let realID = this.getRealId(id)
        initSelect(realID, data)
    }

    //其中key是name
    setValues(data){
        let $form = $(this).children(".ui.form")
        let keys = this.getKeys()
        for(let key in data){
            let value = data[key]
            if(keys.includes(key)){
                $form.form('set value', key, value)
            }
        }
    }

    getKeys(){
        let ret = []
        let select_elems = this.querySelectorAll('select')
        Array.from(select_elems).forEach(function(select_elem){
            ret.push(select_elem.getAttribute('name'))
        })
        let select_elems2 = this.querySelectorAll('input')
        Array.from(select_elems2).forEach(function(select_elem){
            ret.push(select_elem.getAttribute('name'))
        })
        return ret
    }

    setValue(key, value){
        let $form = $(this).children(".ui.form")
        $form.form('set value', key, value)
    }

    getValues(){
        let $form = $(this).children(".ui.form")
        let values = $form.form('get values')
        return values
    }

    /**
     * 检查表单是否有空
     * @returns {boolean}
     */
    existEmpty(){
        //let $form = $(".ui.form")
        let $form = $(this).children(".ui.form")
        let values = $form.form('get values')
        for(let key in values){
            let attrName = key
            let attrValue = values[key]
            if(attrValue == '' || attrValue.length == 0)
                return true
        }
        return false
    }

    restoreDefaults(){
        let ids = this.getIds()
        for(let i = 0;i<ids.length;i++){
            $('#' + ids[i]).dropdown('restore defaults')
        }
    }

    //
    getIds(){
        let ret = []
        let select_elems = this.querySelectorAll('select')
        Array.from(select_elems).forEach(function(select_elem){
            ret.push(select_elem.getAttribute('id'))
        })
        return ret
    }
}