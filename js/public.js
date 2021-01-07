function replaceClass(elem, pre, pos){
    elem.classList.remove(pre)
    elem.classList.add(pos)
}

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

function changeListSelected(event){
    let parent_ul_elem = event.target.parentElement
    //将上一次的选中的list颜色修改为正常
    let selected_sample_elems = parent_ul_elem.querySelectorAll("li.elem_selected")
    Array.from(selected_sample_elems).forEach(function(selected_sample_elem){
        //selected_sample_elem.className = "sample_elem"
        selected_sample_elem.classList.remove("elem_selected")
    })
    event.target.className = "elem_selected"
    return event
}

function createPagination(name, content, click_callback){
    let container = $('#' + name)
    let sources = content
    let options = {
        dataSource: sources,
        pageSize: 30,
        locator:'items',
        showGoInput: true,
        showGoButton: true,
        callback:function(response, pagination){
            let dataHtml = '<ul>'
            $.each(response, function(index, item){
                dataHtml += '<li>' + item +'</li>';
            });
            dataHtml += '</ul>';
            container.prev().html(dataHtml);
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

function createCanvas(elem, status){
    let anno = Annotorious.init({
        image:elem,
        locale:'auto',
        widget:[
            'COMMENT',
            {widget: 'TAG', vocabulary:['HSIL']}
        ]
    })
    anno.setAuthInfo({
        id: 'http://www.example.com/rainer',
        displayName: 'rainer'
    });

    anno.on('updateAnnotation', function(annotation, previous){
        console.log('update annotation')
        //将同层级的图像改为逗号
        if(status!=null){
            status.src='images/tick.jpg'
        }
    })
    anno.setDrawingTool('rect');
    let local_str = '{ \n' +
        '    "@context": "http://www.w3.org/ns/anno.jsonld",\n' +
        '    "id": "#0",\n' +
        '    "type": "Annotation",\n' +
        '    "body": [{\n' +
        '      "type": "TextualBody",\n' +
        '      "value": "It\'s Hallstatt in Upper Austria"\n' +
        '    }, {\n' +
        '      "type": "TextualBody",\n' +
        '      "purpose": "tagging",\n' +
        '      "value": "Hallstatt"\n' +
        '    }, {\n' +
        '      "type": "TextualBody",\n' +
        '      "purpose": "tagging",\n' +
        '      "value": "Upper Austria"\n' +
        '    }],\n' +
        '    "target": {\n' +
        '      "selector": [{\n' +
        '        "type": "FragmentSelector",\n' +
        '        "conformsTo": "http://www.w3.org/TR/media-frags/",\n' +
        '        "value": "xywh=pixel:1,1,500,500"\n' +
        '      }]\n' +
        '    }\n' +
        '  }'

    let local_json = JSON.parse(local_str)
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
