//设置服务器
//const serverurl = "http://huaiguangcsh.f3322.net:2004"

const zhangxueying_url = "http://localhost:8081"

async function getSlideCenter(url){
    try {
        const res = await ( await fetch(url) ).text();
        return res
    } catch(e) { console.log(e); }
}

/**
 * 切片缩略图和推理区域的查看类
 */
class SlideViewer extends HTMLElement{
    constructor() {
        super();
        this.canvas_annos = []
        this.openseadragon_viewer = []
        this.init_flag = false
        getSlideCenter('slide_center.html').then(function(data){
            const doc = new DOMParser().parseFromString(data, 'text/html')
            let templateElem = doc.querySelector("#slideViewerTemplate")
            //let templateElem = document.querySelector("#slideViewerTemplate")
            let content = templateElem.content.cloneNode(true)
            this.appendChild(content)
        }.bind(this))
    }

    /**
     * 初始化缩略图、推荐区域、推荐 区域标注
     * @param mid
     * @param sid
     */
    init(mid, sid){
        this.clean()
        this.initThumbnail(mid, sid)
        this.initOpenseadragon(mid, sid)
    }

    /**
     * 将查看器其恢复到一开始的状态
     */
    clean(){
        this.init_flag = false
        this.anno_list = []
        this.canvas_annos = []
        this.destoryOpenseadragon()
        let recommend = this.querySelector('div.recommend')
        recommend.innerHTML = ''
        this.querySelector("img.thumbnail").setAttribute('src', '')
    }

    /**
     * 初始化切片缩略图
     * @param mid
     * @param sid
     */
    initThumbnail(mid, sid){
        this.querySelector('img.thumbnail').setAttribute('src', zhangxueying_url + '/modelRecommend/getRecomimg/' + mid + '/' + sid + '/thumbnail.jpg')
        let thumbnail = this.querySelector('img.thumbnail')
        thumbnail.onload = function(){
            let temp_elem = this.querySelector('img.thumbnail')
            let viewer = new Viewer(temp_elem)
        }.bind(this)
    }

    /**
     * 为推荐图像交付openseadragon管理，即可进行标注
     * @param mid
     * @param sid
     */
    initOpenseadragon(mid, sid){
        let recommend = this.querySelector('div.recommend')
        for(let i = 0;i<10;i++){
            let container = document.createElement("div")
            if(i == 5){
                container.style = "clear:left;"
            }
            let ceil = document.createElement('div')
            ceil.classList.add('ceil')
            ceil.setAttribute('id', 'openseadragon' + i)

            let status_container = document.createElement('div')
            status_container.classList.add('status')
            let status = document.createElement('img')
            status.classList.add('status')
            status_container.append(status)
            container.append(ceil, status_container)
            recommend.append(container)
        }
        //初始化recommend后，开始为每一个openseadragon div初始化
        for(let i = 0;i<10;i++){
            let id = 'openseadragon' + i
            let viewer = OpenSeadragon({
                id : id,
                prefixUrl: 'openseadragon/images/',
                tileSources: {
                    type: 'image',
                    url: zhangxueying_url + '/modelRecommend/getRecomimg/' + mid + '/' + sid + '/' + i.toString() + '.jpg'
                }
            })
            this.openseadragon_viewer.push(viewer)
            this.openseadragonViewerAnnoCallback(viewer, i)
        }
        this.initAnnos(mid, sid)
    }

    /**
     * 删除所有推荐图像上的openseadragon
     */
    destoryOpenseadragon(){
        for(let i = 0;i<this.openseadragon_viewer.length;i++){
            this.openseadragon_viewer[i].destroy()
        }
        this.openseadragon_viewer = []
    }

    /**
     * 初始化openseadragon图片上的标注
     * @param mid
     * @param sid
     */
    initAnnos(mid, sid){
        let data = {'mid':mid, 'sid':sid}
        getRecommednAnno(data).then(function(json_data){
            if(json_data['code'] != 200){
                return
            }
            let anno_list = json_data['data']['Result']
            this.anno_list = anno_list
            let status_imgs = this.querySelectorAll('img.status')
            for(let i = 0;i<anno_list.length;i++){
                if(anno_list[i]['aid']!=null){
                    status_imgs[i].src = 'images/checked.svg'
                }else{
                    status_imgs[i].src='images/cancel.svg'
                }
            }
            //为this.canvas_annos添加标注
            for(let i = 0;i<this.canvas_annos.length;i++){
                let local_json = webAnno2LocalAnno(anno_list[i])
                if(local_json['id']){
                    local_json['id'] = '#' + i
                }
                this.canvas_annos[i].addAnnotation(local_json)
                let annos = this.canvas_annos[i].getAnnotations()
                for(let j = 0;j<annos.length;j++){
                    let anno = annos[j]
                    changeAnnoColor(anno)
                }
            }

            //为所有标注更改颜色

        }.bind(this))
    }

    /**
     * 初始化openseadragon上的annotorious插件
     * @param viewer
     * @param i
     */
    openseadragonViewerAnnoCallback(viewer, i){
        //let status = this.querySelector('img.status:nth-of-type(' + i + ')')
        let new_num = i + 1
        let status = this.querySelector('div.recommend div:nth-of-type(' + new_num + ') img.status')
        let anno = OpenSeadragon.Annotorious(viewer,{
            widgets:[
                {widget: 'TAG', vocabulary:['HSIL', 'LSIL', 'Ascus', 'Normal']}
            ]
        })
        anno.setDrawingTool('rect')
        anno.on('updateAnnotation', function(annotation, previous){
            console.log('update annotation')
            changeAnnoColor(annotation)
            this.updateAnnoCallback(annotation, i, status)
        }.bind(this))
        anno.on("cancelSelected", function(selection){
            console.log("cancel selected")
            changeAnnoColor(selection)
        })
        this.canvas_annos.push(anno)
    }

    /**
     * 原始的初始化缩略图和10个推荐区域，现已废弃
     * @param mid
     * @param sid
     */
    initImg(mid, sid){
        let recommend = this.querySelector('div.recommend')
        this.querySelector('img.thumbnail').setAttribute('src', zhangxueying_url + '/modelRecommend/getRecomimg/' + mid + '/' + sid + '/thumbnail.jpg')
        if(!this.init_flag){
            let thumbnail = this.querySelector('img.thumbnail')
            thumbnail.onload = function(){
                let temp_elem = this.querySelector('img.thumbnail')
                //输出图像的原始宽高
                //console.log("natural:", temp_elem.naturalWidth, temp_elem.naturalHeight)
                let viewer = new Viewer(temp_elem)
            }.bind(this)

            for(let i = 0;i < 10;i++){
                let container = document.createElement('div')
                if(i == 5){
                    container.style = "clear:left;"
                }
                let status_container = document.createElement('div')
                status_container.classList.add('status')
                let status = document.createElement('img')
                status.classList.add("status")
                status_container.append(status)
                // status.src = 'images/cross.png'
                status.src = 'images/cancel.svg'
                let ceil = document.createElement('img')
                //ceil.src = "images/ceil/" + i + ".jpg"
                ceil.src = zhangxueying_url + '/modelRecommend/getRecomimg/' + mid + '/' + sid + '/' + i.toString() + '.jpg'
                ceil.classList.add('ceil')
                ceil.setAttribute('mid', mid)
                ceil.setAttribute('sid', sid)
                ceil.setAttribute('number', i)
                container.append(ceil, status_container)
                recommend.append(container)
            }
            this.init_flag = true
        }
        else{
            let status_imgs = this.querySelectorAll('img.status')
            let ceils = this.querySelectorAll('img.ceil')
            for(let i=0;i<ceils.length;i++){
                let ceil = ceils[i]
                //ceil.src = "images/ceil/" + i + ".jpg"
                ceil.src = zhangxueying_url + '/modelRecommend/getRecomimg/' + mid + '/' + sid + '/' + i.toString() + '.jpg'
                // status_imgs[i].src='images/cross.png'
                status_imgs[i].src = 'images/cancel.svg'
            }
        }

    }

    /**
     * 原始的annotorious标注工具，由于annotorious不支持放大缩小和全屏标注，现已被annotorious-openseadragon取代
     * @param mid
     * @param sid
     */
    createCanvas(mid, sid){
        let data = {'mid':mid, 'sid':sid}
        getRecommednAnno(data).then(function(json_data){
            if(json_data['code'] != 200){
                //在这里进行处理出错的情况
                let status_imgs = this.querySelectorAll('img.status')
                let ceils = this.querySelectorAll('img.ceil')
                for(let i=0;i< ceils.length; i++){
                    status_imgs[i].src='images/cancel.svg'

                    let canvas_anno = createCanvas(ceils[i], status_imgs[i], null, function(){})
                    this.canvas_annos.push(canvas_anno)
                }
                return
            }
            let anno_list = json_data['data']['Result']
            this.anno_list = anno_list
            let status_imgs = this.querySelectorAll('img.status')
            for(let i = 0;i<anno_list.length;i++){
                if(anno_list[i]['aid']!=null){
                    status_imgs[i].src = 'images/checked.svg'
                }else{
                    status_imgs[i].src='images/cancel.svg'
                }
            }


            if(this.canvas_annos.length != 0){
                for(let i = 0;i<this.canvas_annos.length;i++){
                    let canvas_anno = this.canvas_annos[i]
                    canvas_anno.removeAnnotation('#0')

                    //同时还要修改status

                    // let local_str = '{ \n' +
                    //     '    "@context": "http://www.w3.org/ns/anno.jsonld",\n' +
                    //     '    "id": "#0",\n' +
                    //     '    "type": "Annotation",\n' +
                    //     '    "body": [{\n' +
                    //     '      "type": "TextualBody",\n' +
                    //     '      "value": "It\'s Hallstatt in Upper Austria"\n' +
                    //     '    }, {\n' +
                    //     '      "type": "TextualBody",\n' +
                    //     '      "purpose": "tagging",\n' +
                    //     '      "value": "Hallstatt"\n' +
                    //     '    }, {\n' +
                    //     '      "type": "TextualBody",\n' +
                    //     '      "purpose": "tagging",\n' +
                    //     '      "value": "Upper Austria"\n' +
                    //     '    }],\n' +
                    //     '    "target": {\n' +
                    //     '      "selector": [{\n' +
                    //     '        "type": "FragmentSelector",\n' +
                    //     '        "conformsTo": "http://www.w3.org/TR/media-frags/",\n' +
                    //     '        "value": "xywh=pixel:1,1,500,500"\n' +
                    //     '      }]\n' +
                    //     '    }\n' +
                    //     '  }'

                    // let local_json = JSON.parse(local_str)
                    // anno.addAnnotation(local_json)

                    let local_json = webAnno2LocalAnno(anno_list[i])
                    canvas_anno.addAnnotation(local_json)
                }
            }
            else{
                let ceils = this.querySelectorAll('img.ceil')
                for(let i=0;i< ceils.length; i++){
                    let ceil = ceils[i]

                      //let local_str = webAnno2LocalAnno(anno_list[i])
                    //let local_json = JSON.parse(local_str)
                    let local_json = webAnno2LocalAnno(anno_list[i])
                    let canvas_anno = createCanvas(ceils[i], status_imgs[i], local_json, this.updateAnnoCallback)

                    this.canvas_annos.push(canvas_anno)
                }
            }
        }.bind(this))

    }

    /**
     * 更新推荐图像标注的回调函数，向服务器提交更新的标注
     * @param annotation
     * @param number
     * @param status: 状态图标，即推荐图像下方的红色叉号和绿色勾号
     */
    updateAnnoCallback(annotation, number, status){
        let update_function = function(annotation, number, status){
            let web_json = localAnno2WebAnno(annotation)
            //为web_json里面赋值
            let anno = this.anno_list[parseInt(number)]
            let sid = anno['sid']
            let mid = anno['mid']
            web_json['id'] = anno['id']
            web_json['aid'] = anno['aid']
            web_json['sid'] = anno['sid']
            web_json['mid'] = anno['mid']
            //x y w h
            let local_cir_rect_str = web_json['cir_rect'].split(',')
            let local_cir_rect = []
            Array.from(local_cir_rect_str).forEach(function(elem){
                local_cir_rect.push(parseInt(elem))
            })
            //x y
            let top_left_str = anno['top_left'].split(',')
            let top_left = []
            Array.from(top_left_str).forEach(function(elem){
                top_left.push(parseInt(elem))
            })
            let center_point = {}
            center_point['x'] = top_left[0] + local_cir_rect[0] + local_cir_rect[2] / 2
            center_point['y'] = top_left[1] + local_cir_rect[1] + local_cir_rect[3] / 2
            let web_cir_rect = [local_cir_rect[0] + top_left[0], local_cir_rect[1] + top_left[1], local_cir_rect[2], local_cir_rect[3]]
            let web_cir_rect_str = ''
            Array.from(web_cir_rect).forEach(function(elem){
                web_cir_rect_str = web_cir_rect_str + elem.toString() + ','
            })
            web_cir_rect_str = web_cir_rect_str.substring(0, web_cir_rect_str.length - 1)
            web_json['cir_rect'] = web_cir_rect_str
            web_json['top_left'] = anno['top_left']
            web_json['type'] = anno['type']
            web_json['center_point'] = center_point['x'].toString() + ',' + center_point['y'].toString()
            // let post_data = {number:web_json}
            let post_data = {}
            post_data[number] = web_json
            updateRecommendAnnotations(post_data).then(function(json_data){
                if(json_data['code'] == 200){
                    if(status!=null){
                        status.src='images/checked.svg'
                    }
                }else{
                    console.log('update mid=', mid, 'sid=', sid, 'number=', number, ' failed')
                }
            })
        }.bind(this)
        update_function(annotation, number, status)
    }
}

