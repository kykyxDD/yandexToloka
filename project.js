exports.Task = extend(TolokaHandlebarsTask, function (options) {
  TolokaHandlebarsTask.call(this, options);
}, {
  getCoor: function(e) {
    var posx = 0;
    var posy = 0;
    if (e.pageX || e.pageY) {
      posx = e.pageX;
      posy = e.pageY;
    } else if (e.clientX || e.clientY) {
      posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return {
      x : posx,
      y : posy
    };
  },
  getDiffCoor: function(coor) {
    if(!this.basicCoor) return {x: 0, y:0}

    return {
      x: Math.floor(coor.x - this.basicCoor.x),
      y: Math.floor(coor.y - this.basicCoor.y)
    }
  },
  setTranform(obj){
    // console.log('setTranform')
    if(!this.elem__task__contImg) return
    var elem = this.elem__task__contImg
    elem.style.transform = ` scale(${obj.s}) translate(${obj.x}px, ${obj.y}px)`;
    if(obj.s >= 2) {
    	elem.classList.add('little_scale')
    } else if(elem.classList.contains('little_scale')) {
      elem.classList.remove('little_scale')
    }
  },
  plusBtn: function(e){
    this.transform.s = Math.max( this.transform.s - 0.1, this.min_scale)
    this.setTranform(this.transform)
	},
	minusBtn: function(e){
    this.transform.s = Math.max( this.transform.s + 0.1, this.min_scale)
    this.setTranform(this.transform)
	},
  getCoorTranform: function(coor){
    return {
      x: Math.floor(this.transform.x + coor.x/this.transform.s),
      y: Math.floor(this.transform.y + coor.y/this.transform.s),
      s: this.transform.s
    }
  },
  mouseLeave: function(e){
  	if(!this.basicCoor) return
    this.mouseUp(e);
  },
	mouseUp: function(e){
  	this.elem__task__contImg.classList.remove('task__move');
    var new_coor, get_coor 

    if(e){
      var coor = this.getCoor(e)
      new_coor = this.getDiffCoor(coor)
    } else {
      new_coor = this.getDiffCoor(this.basicCoor)
    }
    get_coor = this.getCoorTranform(new_coor)
    this.transform.x = get_coor.x
    this.transform.y = get_coor.y
    this.transform = this.setTransformOffset(this.transform)
    this.setTranform(this.transform)
    this.basicCoor = null
  },
	mouseDown: function(e){
    var coor = this.getCoor(e)
    this.basicCoor = coor
  },
	mouseMove: function(e){
  	if(!this.basicCoor) return
    this.elem__task__contImg.classList.add('task__move')

    var coor = this.getCoor(e)
    var new_coor = this.getDiffCoor(coor)

    var transform_mouse = this.getCoorTranform(new_coor)
    var check = this.setTransformOffset(transform_mouse)
    this.setTranform(check)
  },
  onWheel: function(ev) {
    var coor = this.getCoor(ev)            

    // var deltaY = ev.deltaY < 0 ? -1 : ev.deltaY > 1 ? 1 : 0
    var s = 0.1*(ev.wheelDelta/Math.abs(ev.wheelDelta))
    var t_s = Math.max( this.transform.s + s, this.min_scale)

    this.setTransformScaleBasedOnWindowPoint(t_s, coor);
    ev.preventDefault();
    ev.stopPropagation();
    return false;

  },
  setTransformScaleBasedOnWindowPoint: function(scale, p) {
    var posUnderMouse0 = this.fromWindowToCanvas(p);
    this.transform.s = scale
    this.setTranform(this.transform)
    var posUnderMouse1 = this.fromWindowToCanvas(p);
    var delta = posUnderMouse0.subPoint(posUnderMouse1);
    var t_delta = this.transform.subPoint(delta)

    this.transform = this.setTransformOffset(t_delta)

    this.setTranform(this.transform)
  },
  
  fromWindowToCanvas: function(pos) {
    const rect = this.elem__task__contImg.getBoundingClientRect();
    const t = this.transform

    var result = new Point(
      Math.floor((pos.x - rect.left) / t.s - t.x),
      Math.floor((pos.y - rect.top) / t.s - t.y)
    );

    return result;
  },
  setTransformOffset: function(p) {

    var elem = this.elem__task__contImg
    var elem_w = elem.clientWidth;
    var elem_h = elem.clientHeight;
    var t = this.transform

    var x = (elem_w * t.s - elem_w) / t.s
    var y = (elem_h * t.s - elem_h) / t.s

    var minX1 = -x/2; // 0;          
    var minX2 =  x/2;

    var minX = Math.min(minX1, minX2);
    var maxX = Math.max(minX1, minX2);

    var minY1 = -y/2; 
    var minY2 =  y/2; 

    var minY = Math.min(minY1, minY2);
    var maxY = Math.max(minY1, minY2);

    return new Point(
      clamp(p.x, minX, maxX),
      clamp(p.y, minY, maxY),
      p.s
    )
  },
  clickContImage: function(e){
    console.log('clickContImage')
    if(this.selectBox && !e.target.classList.contains('box')) {
      this.selectBox.elem.classList.remove('selected')
      this.unselectClasses()
    }
  },
  unselectClasses: function(){
    this.selectIdClasses = false
    this.fun_listClasses.uncheckedInput()
  },
  popupMessageNotClasses: function(){
  	this.fun_listClasses.notSelectClass()
  },
  clickBox: function(box){
    if(this.basicCoor) {
      this.mouseUp()
    }
    if(this.selectBox) {
      this.selectBox.elem.classList.remove('selected')      
    }
    //console.log(box)
    this.selectBox = box
    this.setBoxResult(box, this.selectIdClasses)
    this.fun_listClasses.updateClasses(box.elem)
  },
  setBoxResult: function(selectBox, valSelect) {
    selectBox.elem.classList.add('done')
    selectBox.elem.setAttribute('value', valSelect)
    this.setResult(selectBox, valSelect)
  },
  setResult: function(obj, val){
    console.log('setResult')

    var res = obj
    this.result[obj.id] = val
    //res['class'] = val
    this.setSolutionOutputValue('result', this.result)
    //console.log('set _solution', this._solution.output_values.result)
    this.updateNumReadyBoxes()

  },
  updateNumReadyBoxes: function(){
    var ready_boxes = this.numReadyBoxes()
    var all_boxes = this.data_json.length;

    this.elemReadyBoxes.innerHTML = `${ready_boxes} / ${all_boxes}`
    if(ready_boxes == all_boxes){
      this.btnShowOtherBoxes.style.display = 'none'
      //this.contShowDoneBoxes.style.display = 'none'
    } else {
      this.btnShowOtherBoxes.style.display = 'block'
      //this.contShowDoneBoxes.style.display = 'block'
    }
    var num_unique = this.getUniqueClassesCount()
    this.funMarker.updateColorBox(num_unique)
  },
  numReadyBoxes: function(){
    var ready = 0;
    var json = this.data_json
    var result = this._solution.output_values.result
    
    if(!result) return ready
    
    for(var i = 0; i < json.length; i++){
      if(result[json[i].id]){
        ready++
      }
    }
    return ready
  },
  getUniqueClassesCount: function(){
    var ready = 0;

    var result = this._solution.output_values.result
    var arr_unique_classes = [];
    
    if(!result) return ready
    
    for(var key in result){
      if(arr_unique_classes.indexOf(result[key]) == -1) {
      	arr_unique_classes.push(result[key])
      }
    }
    return arr_unique_classes.length
  
  },
  removeResult: function(obj){

    if(this.result[obj.id]) {
    	delete this.result[obj.id];
    }

    this.setSolutionOutputValue('result', this.result)
	},
  
  requestJson: function(json){
    var parents = this.getDOMElement()
    var elem = parents.querySelector(".task__cont-img");
    var params_json = json
    if(typeof params_json == 'string'){
    	if(params_json.indexOf("`") >= 0) {
        params_json = params_json.replace(/`/ig, '"')
      }
      params_json = checkBoxes(JSON.parse(params_json))
    }
    
    var result = this._solution.output_values.result
    if(result) {
    	params_json = this.addResultToJson(params_json, result)
    }
    this.data_json = params_json
    this.data_jsonToObject = this.getJsonToObject(params_json)
    this.data_objClasses = this.getJsonToObject(listClasses)
  	var params = {
    	json: params_json,
      parent: elem,
      funTask: this
    }
    var self = this
    this.funMarker = new Marker(params)

    this.btnShowOtherBoxes.addEventListener('click',  function(){
      self.transform.x = 0
      self.transform.y = 0
      self.transform.s = 1
      self.setTranform(self.transform)
      self.funMarker.showOther()                                     })
    this.updateNumReadyBoxes()
  },
  addResultToJson: function (json, result) {
    for(var i = 0; i < json.length; i++){
      if(!result[json[i].id]) continue
      json[i].classId = result[json[i].id]
    }
    
    return json
  },
  getJsonToObject: function(json){
    var obj = {};
    json.forEach(function(info){
    	obj[info.id] = info
    });
    return obj
  },
  searchClass: function(e){
    var value = e.target.value
    this.fun_listClasses.filterClass(value.toLocaleLowerCase())
  },
  onShowDoneBoxes: function() {
    var class_name = 'hide_done_boxes'
    if(!this.btnShowDoneBoxes.checked){
    	this.funMarker.cont_box.classList.add(class_name)
    } else {
      this.funMarker.cont_box.classList.remove(class_name)
    }
  },
  createAllEvents: function(){
    var parents = this.getDOMElement()
    var contImg = this.elem__task__contImg = parents.querySelector(".task__cont-img")
    
    //contImg.addEventListener('click', this.clickContImage.bind(this))
    
    contImg.addEventListener('mousedown', this.mouseDown.bind(this))
    contImg.addEventListener('mousemove', this.mouseMove.bind(this))
    contImg.addEventListener('mouseup', this.mouseUp.bind(this))
    contImg.addEventListener('mouseleave', this.mouseLeave.bind(this))
    
    
    this.btnShowDoneBoxes.addEventListener('input', this.onShowDoneBoxes.bind(this))
    
    var inputSearchClass = parents.querySelector('#searchClass');

    //loadData()
    var contListClasses = parents.querySelector('.cont-list-classes')

    var name_event = 'checkClassTask'+this._solution.task_id
    var params = {
    	parent: contListClasses,
      name_event: name_event,
      task_id: this._solution.task_id
    }
    var disable = this.isJobVerification
    this.fun_listClasses = new loadClasses(params, disable)
    if(this.fun_listClasses && this.fun_listClasses.select){

      var self = this
      var select = this.fun_listClasses.select
      select.addEventListener(name_event, function(e){
        self.changeBoxClasses(e)
      })
      inputSearchClass.addEventListener('input', this.searchClass.bind(this))
    }
    parents.querySelector("#minusBtn").addEventListener('click', this.plusBtn.bind(this))
    parents.querySelector("#plusBtn").addEventListener('click', this.minusBtn.bind(this))
    addEventListElement(contImg, this.onWheel.bind(this))
    
    this.onShowDoneBoxes()

  },
  destroyAllEvents: function(){
    var parents = this.getDOMElement()
    var contImg = this.elem__task__contImg
    
  	if(contImg){
      //contImg.removeEventListener('click', this.clickContImage.bind(this))
      contImg.removeEventListener('mouseup', this.mouseUp.bind(this))
      contImg.removeEventListener('mousedown', this.mouseDown.bind(this))
      contImg.removeEventListener('mousemove', this.mouseMove.bind(this))
      removeEventListElement(contImg, this.onWheel.bind(this))
    }


		if(this.fun_listClasses && this.fun_listClasses.select){
      var select = this.fun_listClasses.select
    	
    }
    
    parents.querySelector("#minusBtn").removeEventListener('click', this.plusBtn.bind(this))
    parents.querySelector("#plusBtn").removeEventListener('click', this.minusBtn.bind(this))
    
  },
  
  changeBoxClasses: function(e){

    var valSelect = e.detail.idClasses
    
    this.selectIdClasses = valSelect != '-1' ? valSelect : false;
    this.elem__task__contImg.classList.add('cursor-fill')

    /*if(this.selectBox) {
      if(valSelect != '-1') {
        this.selectBox.elem.classList.add('done')
        this.selectBox.elem.setAttribute('value', valSelect)
        this.setResult(this.selectBox, valSelect)
      } else {
        this.selectBox.elem.classList.remove('done')
        this.selectBox.elem.removeAttribute('value')
        this.removeResult(this.selectBox)
      }
    }*/
  },
  onRender: function() {
    // DOM-элемент задания сформирован (доступен через #getDOMElement()) 
    this.result = {}
    this.selectIdClasses = false
    this.selectBox = null
    this.transform = new Point(0,0,1);
    this.min_scale = 0.3
    this.basicCoor = null;
    
    this.isJobVerification = this._solution.output_values.result

    var data = this.getTemplateData()
    this.data = data
    var parents = this.getDOMElement()
    var elem = parents.querySelector(".task__cont-img")
    this.elemReadyBoxes = parents.querySelector('.ready-boxes');
    this.btnShowOtherBoxes = parents.querySelector('.show_other')
    this.contShowDoneBoxes = parents.querySelector('.show_done_marker')
    this.btnShowDoneBoxes = this.contShowDoneBoxes.querySelector('input')
    
    if(this.isJobVerification) {
    	parents.classList.add('verification_result')
    }


    if(!data.json) {
    	data.json = defaultJson
    }

    if(elem && data.json){
      this.requestJson(data.json)
    }
    
    this.createAllEvents()
  },
  
  onDestroy: function() {
    console.log('onDestroy')
    this.destroyAllEvents()
    // Задание завершено, можно освобождать (если были использованы) глобальные ресурсы
    //alert('onDestroy')
  }
});

function extend(ParentClass, constructorFunction, prototypeHash) {
  constructorFunction = constructorFunction || function () {};
  prototypeHash = prototypeHash || {};
  if (ParentClass) {
    constructorFunction.prototype = Object.create(ParentClass.prototype);
  }
  for (var i in prototypeHash) {
    constructorFunction.prototype[i] = prototypeHash[i];
  }
  return constructorFunction;
}

function PopupBox(par) {

  var elem_popup = par.querySelector('.task__popupBox')
  var elem_popupImg = par.querySelector('.task__popupBox__img')
  var elem_popupName = par.querySelector('.task__popupBox__name')
  var elem_popupId = par.querySelector('.task__popupBox__id')
  this.elem = elem_popup
  this.setInfo = function (obj) {
    if(obj.img){
    	elem_popupImg.style.backgroundImage = `url(${obj.img})`
      elem_popupImg.classList.remove('hide')
    } else {
      elem_popupImg.classList.add('hide')
    }
    elem_popupName.innerHTML = obj.name
    elem_popupId.innerHTML = obj.id
  }
  
  this.show = function () {
    elem_popup.classList.add('show')
  }
  this.hide = function () {
    elem_popup.classList.remove('show')
  }
  this.setPos = function (pos) {
    elem_popup.style.left = pos.x+'px'
    elem_popup.style.top = pos.y+'px'
    
    this.setClassName(pos.class)
    
  },
  this.setClassName = function (class_name) {    
    elem_popup.classList.remove('left')
    elem_popup.classList.remove('right')

    elem_popup.classList.remove('top')
    elem_popup.classList.remove('bottom')
    
    elem_popup.classList.add(class_name)
  }
}

function Marker (params) {
  var json = params.json;
  var parent = params.parent
  var funTask = params.funTask
  this.funTask = funTask
  this.isUniqueClassesCount = true
  
  this.funClrDBClasses = new Classes(listClasses)
  
  this.markersOpacity = 0.2
	
  this.popupBox = new PopupBox(parent.parentNode)
  
	parent.style.position = 'relative';
  this.cont_box = parent
  this.cont_box.classList.add('cont-box');
  
  for(var i = 0; i < json.length; i++){
    this.createBox(json[i])
  }
  this.json = json
  
}
Marker.prototype = {
  showOther: function() {
    this.cont_box.classList.add('blick_other_elem');
    setTimeout(this.hideBlinkElem.bind(this), 1000)    
    
    /*for(var i = 0; i < this.json.length; i++){
      var value = this.json[i].elem.getAttribute('value')
      if(!value) {
      	this.blinkElem(this.json[i].elem)
      }
    }*/
  },
  blinkElem: function(elem){
    elem.classList.add('blink')
    setTimeout(this.hideBlinkElem.bind(this, elem), 1000)    
  },
	hideBlinkElem: function(){
    //elem.classList.remove('blink')
    this.cont_box.classList.remove('blick_other_elem');
  },
  clickBox: function(obj, box){
    if(this.funTask.selectIdClasses){
    	this.funTask.clickBox(obj)
      this.mouseoverBox(obj, box)
    } else {
      this.funTask.popupMessageNotClasses()
    }
    //box.classList.add('selected')
  },
  createBox: function(data) {
    var elem = this.itemBox(data)
    data.elem = elem
    this.cont_box.appendChild(elem)

    //if(this.funTask.isJobVerification) return

    elem.addEventListener('click', this.clickBox.bind(this, data, elem) )
    elem.addEventListener('mouseover', this.mouseoverBox.bind(this, data, elem) )
    elem.addEventListener('mouseout', this.mouseoutBox.bind(this, data, elem) )
    
  },
  mouseoverBox: function (obj, box) { 
    var record = {
      name: "Не выбран класс для этого элемента",
      id: '',
      img: false
    };
    if(box.classList.contains('done') ){
      var check_class = box.getAttribute('value')
      record = this.funTask.data_objClasses[check_class]
    }
    this.popupBox.setInfo(record)
    this.popupBox.show()
    var pos = this.getPosPopupBox(obj, box)
    this.popupBox.setPos(pos)
  },
  getPosPopupBox: function (obj, elem) {
  	//var xyxy = marker.toXyXy(this.canvas.imageSize);
    var funTask = this.funTask
    var img = funTask.elem__task__contImg
    var tooltipRect = this.popupBox.elem.getBoundingClientRect();
    var canvasRect = img.parentNode.getBoundingClientRect();

    var t = funTask.transform
    var p_0 = {
			x: (img.offsetWidth*obj.boxes.x_min)*t.s,
			y: (img.offsetHeight*obj.boxes.y_min)*t.s
    }
    var p_1 = {
			x: (img.offsetWidth*obj.boxes.x_max)*t.s,
			y: (img.offsetHeight*obj.boxes.y_max)*t.s
    }
    var real_w = Math.floor(p_1.x - p_0.x)
    var real_h = Math.floor(p_1.y - p_0.y)

    var size_img = img.getBoundingClientRect()

    var img_x = (size_img.width/t.s - size_img.width)/2 + t.x*t.s
    var img_y = (size_img.height/t.s - size_img.height)/2 + t.y*t.s


    var topLeft = {
      x: img_x + p_0.x,
      y: img_y + p_0.y
    }
    var bottomRight = {
      x: img_x + p_1.x,
      y: img_y + p_1.y
    }

    var x = topLeft.x + real_w;
    var y = topLeft.y + real_h/2 - tooltipRect.height/2;
    var class_name = 'right'
    var class_x = false
    
    if( x + tooltipRect.width > canvasRect.width ) {
      x = topLeft.x - tooltipRect.width
      class_name = 'left'
      if(x < 0) {
      	x = topLeft.x + real_w/2 - tooltipRect.width/2
        class_x = true
      }
    }
    
    if(class_x) {
      y = bottomRight.y
      class_name = 'bottom'
    } 

    if(y + tooltipRect.height > canvasRect.height){
    	y = topLeft.y - tooltipRect.height
      class_name = 'top'
    }    
    
    
    var left = clamp(x , 0, canvasRect.width - tooltipRect.width)
    var top = clamp(y, 0, canvasRect.height - tooltipRect.height)
    
    //console.log(top, left)

    return {
    	x: Math.floor(left),
      y: Math.floor(top),
      class: class_name
    }
  },
	mouseoutBox: function (obj, box) { 
    //if(box.classList.contains('done') ){
    	//console.log('mouseoutBox')
      this.popupBox.hide()
    //}
  },
  itemBox: function (data) {
    var elem = document.createElement('div');
    elem.className = 'box'
    elem.style.width = Math.floor((data.boxes.x_max - data.boxes.x_min)*100) + '%';
    elem.style.height = Math.floor((data.boxes.y_max - data.boxes.y_min)*100) + '%';
    elem.style.left = Math.floor( data.boxes.x_min*100 ) + '%';
    elem.style.top  = Math.floor( data.boxes.y_min*100 ) + '%';
    
    if(data.classId) {
    	elem.classList.add('done');
      elem.setAttribute('value', data.classId)
    }
    
    return elem
  },
  updateColorBox: function(num_ready_boxes) {
    for(var i = 0; i <  this.json.length; i++){
    	
      var str_class_id = this.json[i].classId ? this.json[i].classId : this.json[i].elem.getAttribute('value')
      
      if(!str_class_id) continue
      
      var class_id = ''
      if(str_class_id.indexOf('_') >= 0) {
        class_id = +(str_class_id.split('_')[0])
      } else { 
        class_id = +str_class_id 
      }
      
      var clr = this.getDefaultColor()
      
			if(this.isUniqueClassesCount) {
        clr = this.getHue(class_id, num_ready_boxes)
      } else {
        clr = this.funClrDBClasses.getHue(str_class_id)
      }

      this.json[i].elem.style.backgroundColor = clr.bg
      this.json[i].elem.style.borderColor = clr.border
    }
  },
  getDefaultColor: function(){
    return {
    	border: 'rgba(255, 0, 255, 1)',
			bg: 'rgba(255, 0, 255,'+this.markersOpacity+')'
    }
  },
  getHue: function (id ,hueFactor) {
	
    var hue = (id % hueFactor) / hueFactor;
    var clr_border, clr_bg

    if (id > 1) {
      clr_border = rgbaStrHueCircle(hue, 1.0);
      clr_bg = rgbaStrHueCircle(hue, this.markersOpacity);
    } else {
      clr_border = 'rgba(255, 0, 255, 1)';
      clr_bg = 'rgba(255, 0, 255,'+this.markersOpacity+')';
    }
    return {
    	border: clr_border,
			bg: clr_bg
    }
  }
}

function Classes(classes) {
  this.length = classes.length
  this.hslDelta = (210 / classes.length) || 0 // 210 is blue

  this.object = classes.reduce(function (ob, el, i) {
    el.index = i
    ob[el.id] = el
    return ob
  }, {})

  this.getClass = function (id) {
    return this.object[id] || { unknown: true }
  }

  this.createColor = function(id) {
    const cls = this.getClass(id)
    if (!cls || cls.unknown) {
      return 0
    }
    return (cls.index / this.length) || 0
  }
  this.getHue = function(id) {
    var get_deg = this.createColor(id);
		var clr_border = rgbaStrHueCircle(get_deg, 1.0);
		var clr_bg = rgbaStrHueCircle(get_deg, 0.2);
		
    return {
    	border: clr_border,
			bg: clr_bg
    }
        
  }
}

function checkBoxes(json){
  var boxes = json

  if (!boxes.length) [] 

  let j, percent, leftCoord, rightCoord
  let cursor = (boxes.length - 1)
  while (cursor > 0) {
    leftCoord = boxes[cursor]

    if (!leftCoord.isCovered) {
      for (j = 0; j < cursor; j++) {
        rightCoord = boxes[j]

        if (!rightCoord.isCovered) {
          percent = rectIntersectRatio(leftCoord.boxes, rightCoord.boxes)

          if (percent > 0.5) {
            boxes.hasGroups = true
            rightCoord.isCovered = true
          }
        }
      }
    }
    cursor--
  }
  return boxes
}
function rectIntersectRatio (firstBox, secondBox) {
  let firstLeft, firstTop, firstRight, firstBottom
  let secondLeft, secondTop, secondRight, secondBottom
  let maxLeft, maxTop, maxRight, maxBottom
  let dx, dy, sq1, sq2

  firstLeft = firstBox.x_min
  firstTop = firstBox.y_min
  firstRight = firstBox.x_max
  firstBottom = firstBox.y_max

  secondLeft = secondBox.x_min
  secondTop = secondBox.y_min
  secondRight = secondBox.x_max
  secondBottom = secondBox.y_max

  if (secondLeft < firstLeft && secondRight < firstLeft) {
  return 0
  }
  if (secondLeft > firstRight && secondRight > firstRight) {
  return 0
  }
  if (secondTop < firstTop && secondBottom < firstTop) {
  return 0
  }
  if (secondTop > firstBottom && secondBottom > firstBottom) {
  return 0
  }

  // We have intersection here.
  maxLeft = Math.max(firstLeft, secondLeft)
  maxTop = Math.max(firstTop, secondTop)

  maxRight = Math.min(firstRight, secondRight)
  maxBottom = Math.min(firstBottom, secondBottom)

  dx = maxRight - maxLeft
  dy = maxBottom - maxTop

  sq1 = dx * dy
  sq2 = (secondRight - secondLeft) * (secondBottom - secondTop)

  return sq1 / sq2

}

function loadClasses(params, input_disabled) {
  	var parents = params.parent
    this.parents = parents
  	this.input_disabled = input_disabled

  	var self = this

    var cont_list_classes = document.createElement('div');
    cont_list_classes.className = 'list-classes'
    parents.append(cont_list_classes)
  
  	
  	var select = document.createElement('div')
    cont_list_classes.appendChild(select)
  	select.options = []
  	this.select = select;
  	this.name_event = params.name_event
  	this.task_id = params.task_id
  	//console.log(this.name_event)

    listClasses.forEach(function(obj, index){
      self.createOpt(obj, index)
    });
  	
}
loadClasses.prototype = {
  createOpt: function(record, i){
    var opt = document.createElement('div');
    opt.className = 'item-class'
    var input = document.createElement('input');
    opt.appendChild(input);
    var id_elem = record.id + '_task' + this.task_id
    input.type = 'radio';
    input.name = 'list-classes'
    input.id = id_elem
    if(this.input_disabled){
    	input.disabled = true
    }
    input.setAttribute('class_id', record.id)
    var label = document.createElement('label');
    label.setAttribute('for',id_elem)
    opt.appendChild(label)
    var text_id = document.createElement('div');
    text_id.className = 'text_id'
    text_id.innerHTML = `#${i+1} ${record.id}`
    label.appendChild(text_id)

    var cont_info = document.createElement('div');
    cont_info.className = 'cont-info'
    label.appendChild(cont_info)

    var img = document.createElement('div');
    img.className = 'img'
    img.style.backgroundImage = `url(${record.img}`;
    cont_info.appendChild(img)
    var text = document.createElement('div');
    text.className = 'name'
    text.innerHTML = record.name;
    cont_info.appendChild(text)
    this.select.options[i] = {
      value: record.id,
      elem: input,
      obj: record
    }

    this.select.appendChild(opt)

    input.addEventListener('input', this.inputOpt.bind(this))
  },
  
  notSelectClass: function(){
    if(this.timeout_message) {
    	clearTimeout(this.timeout_message)
    }
    var self = this;
    this.parents.classList.add('message-no-class')
    
  	this.timeout_message = setTimeout(function(){
			self.parents.classList.remove('message-no-class')
    }, 3000)
  },
  inputOpt: function(e){
    var id = e.target.getAttribute('class_id')

    var showMessageEvent = new CustomEvent(this.name_event, {detail: {
      idClasses: id
    }});
    this.select.dispatchEvent(showMessageEvent);
  },
  checkText: function(text, value){
    return text.includes(value)
  },
	filterClass: function (value) {
    var self = this;
  	this.select.options.forEach(function(opt){
      var _id = opt.obj.id.toLocaleLowerCase()
      var _name = opt.obj.name.toLocaleLowerCase()
      var _id_translit = cyrillicToTranslit(opt.obj.id.toLocaleLowerCase())
      var _name_translit = cyrillicToTranslit(opt.obj.name.toLocaleLowerCase())
      console.log('translit', _name, _name_translit)
      if( self.checkText(_id, value) || 
         self.checkText(_name, value) || 
         self.checkText(_id_translit, value) || 
         self.checkText(_name_translit, value) ) {
        opt.elem.parentNode.style.display = 'block'
      } else {
      	opt.elem.parentNode.style.display = 'none'
      }
    })
  },

  updateClasses: function(box){
    var val = box.getAttribute('value')
    if(val) {
      var item_input = null
      for(var i = 0; i < this.select.options.length; i++){
        if(this.select.options[i].value == val){
          item_input = this.select.options[i].elem
          this.select.options[i].elem.checked = true
        }
      }
      if(item_input) {
        
      	var h = this.select.offsetHeight;
        
        var getClientRect = item_input.parentNode.getBoundingClientRect()
        if(getClientRect.top  < 0) {
          var top = item_input.parentNode.offsetTop - this.parents.clientHeight/2
          this.parents.scrollTop = Math.max(0, top)
        } else if( getClientRect.top > this.parents.clientHeight ){
          var top =  item_input.parentNode.offsetTop - this.parents.clientHeight/2
          var cont = item_input.parentNode.parentNode
          var max_top = cont.clientHeight - this.parents.clientHeight
          this.parents.scrollTop = Math.min( max_top, top )
        }
      }
    } else {
      this.uncheckedInput()
    }
  },
  uncheckedInput: function(){
    var input_checked = this.select.querySelector('input:checked')
    if(input_checked){
      input_checked.checked = false
    }
  },
  offset: function(el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
	}

}

function Point(x, y, s) {
  this.x = x ? x : 0;
  this.y = y ? y : 0;
  this.s = s ? s : 1;
}
Point.prototype = {
  subPoint: function (p) {
    return new Point(this.x - p.x, this.y - p.y, this.s);
  }
};

function addEventListElement (elem, onWheel) {
  if (elem.addEventListener) {
    if ('onwheel' in document) {
      elem.addEventListener("wheel", onWheel);
    } else if ('onmousewheel' in document) {
      elem.addEventListener("mousewheel", onWheel);
    } else {
      elem.addEventListener("MozMousePixelScroll", onWheel);
    }
  } else {
    elem.attachEvent("onmousewheel", onWheel);
  }
}
function removeEventListElement(elem, onWheel){
  if (elem.removeEventListener) {
    if ('onwheel' in document) {
      elem.removeEventListener("wheel", onWheel);
    } else if ('onmousewheel' in document) {
      elem.removeEventListener("mousewheel", onWheel);
    } else {
      elem.removeEventListener("MozMousePixelScroll", onWheel);
    }
  } else {
    elem.detachEvent("onmousewheel", onWheel);
  }
}
function clamp(number, lower, upper) {
  number = +number
  lower = +lower
  upper = +upper
  lower = lower === lower ? lower : 0
  upper = upper === upper ? upper : 0
  if (number === number) {
    number = number <= upper ? number : upper
    number = number >= lower ? number : lower
  }
  return number
}

function rgbaStrHueCircle (part, a) {
  var r = HSL2RGB(part * 360, 1, 0.5);
  return 'rgba(' + r[0] + ',' + r[1] + ',' + r[2] + ',' + a + ')';
}
var HSL2RGB = function(H, S, L) {
    H /= 360;

    var q = L < 0.5 ? L * (1 + S) : L + S - L * S;
    var p = 2 * L - q;

    return [H + 1/3, H, H - 1/3].map(function(color) {
        if(color < 0) {
            color++;
        }
        if(color > 1) {
            color--;
        }
        if(color < 1/6) {
            color = p + (q - p) * 6 * color;
        } else if(color < 0.5) {
            color = q;
        } else if(color < 2/3) {
            color = p + (q - p) * 6 * (2/3 - color);
        } else {
            color = p;
        }
        return Math.round(color * 255);
    });
};


function cyrillicToTranslit(str, spaceReplacement) {
  const _associations = {
    "а": "a",
    "б": "b",
    "в": "v",
    "ґ": "g",
    "г": "g",
    "д": "d",
    "е": "e",
    "ё": "e",
    "є": "ye",
    "ж": "zh",
    "з": "z",
    "и": "i",
    "і": "i",
    "ї": "yi",
    "й": "i",
    "к": "k",
    "л": "l",
    "м": "m",
    "н": "n",
    "о": "o",
    "п": "p",
    "р": "r",
    "с": "s",
    "т": "t",
    "у": "u",
    "ф": "f",
    "х": "h",
    "ц": "c",
    "ч": "ch",
    "ш": "sh",
    "щ": "sh'",
    "ъ": "",
    "ы": "i",
    "ь": "",
    "э": "e",
    "ю": "yu",
    "я": "ya"
  };

    if (!str) {
      return "";
    }

    var new_str = "";
    for (var i = 0; i < str.length; i++) {
      var strLowerCase = str[i].toLowerCase();
      if (strLowerCase === " " && spaceReplacement) {
        new_str += spaceReplacement;
        continue;
      }
      var new_letter = _associations[strLowerCase];
      if ("undefined" === typeof new_letter) {
        new_str += strLowerCase;
      }
      else {
        new_str += new_letter;
      }
    }
    return new_str;
};

        
var listClasses = [{"id":"40084077","name":"КИНДЕР ШОКОЛАД Макси 0,021кг :36/288","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/40084077.jpg"},{"id":"40084701","name":"Киндер-шоколад 100гр:10/40","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/40084701.jpg"},{"id":"54490086","name":"COCA-COLA газ нап 0,25л с/б (Кока-кола):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/54490086.jpg"},{"id":"54491472","name":"COCA-COLA Газ.нап. 0,5л ПЭТ(Кока-кола):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/54491472.jpg"},{"id":"80052463","name":"Kinder Delice Пирожное бисквитное 39г м/пак(Ferrero):20","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/80052463.jpg"},{"id":"80052760","name":"КИНДЕР Батон. Буэно 43г (Феррреро):30","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/80052760.jpg"},{"id":"80177609","name":"КИНДЕР шоколад Т4 50г (Ферреро) :20/160","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/80177609.jpg"},{"id":"4600494521966","name":"7Up Газ нап 1,75л ПЭТ(ПепсиКо):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600494521966.jpg"},{"id":"4600494314162","name":"7Up Газ нап 0,6л ПЭТ(Пепси):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600494314162.jpg"},{"id":"4607025393146","name":"ИМУНЕЛЕ НЕО Напиток к/м мультифрукт 1,2% 100г ПЭТ(ВБД):6/24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025393146.jpg"},{"id":"4607025393160","name":"ИМУНЕЛЕ НЕО Напиток к/м черника 1,2% 100г ПЭТ(ВБД):6/24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025393160.jpg"},{"id":"4607025393177","name":"ИМУНЕЛЕ НЕО Напиток к/м земляника 1,2% 100г ПЭТ(ВБД):6/24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025393177.jpg"},{"id":"4690228009297","name":"ИМУНЕЛЕ НЕО Напиток к/м лесн ягод 1,2% 100г ПЭТ(ВБД):6/24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228009297.jpg"},{"id":"4690228021664","name":"ИМУНЕЛЕ Напиток к/м с соком дет Тутти-фрут100г(ВБД):6/24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228021664.jpg"},{"id":"4690228024573","name":"ИМУНЕЛЕ нап кис/мол детс Мал-пломбир 1,5% 100гПЭТ(ВБД):6/24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228024573.jpg"},{"id":"4690228027734","name":"ИМУНЕЛЕ Напиток к/м с соком детск Ябл-банан100г(ВБД)пэт:6/24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228027734.jpg"},{"id":"4607025395119","name":"ИМУНЕЛЕ НЕО Напиток к/м черника 1,2% 100г ПЭТ(ВБД): упаковка 6шт","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025395119.jpg"},{"id":"4607025395126","name":"ИМУНЕЛЕ НЕО Напиток к/м земляника 1,2% 100г ПЭТ(ВБД): упаковка 6шт","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025395126.jpg"},{"id":"4690228021688","name":"ИМУНЕЛЕ Напиток к/м с соком дет Тутти-фрут100г(ВБД): упаковка 6шт","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228021688.jpg"},{"id":"4690228024580","name":"ИМУНЕЛЕ нап кис/мол детс Мал-пломбир 1,5% 100гПЭТ(ВБД): упаковка 6шт","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228024580.jpg"},{"id":"4690228027758","name":"ИМУНЕЛЕ Напиток к/м с соком детск Ябл-банан100г(ВБД)пэт: упаковка 6шт","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228027758.jpg"},{"id":"4690228027130","name":"ДОМИК В ДЕРЕВНЕ Молоко паст отборное 1,4л ПЭТ(ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228027130.jpg"},{"id":"4690228027154","name":"ДОМИК В ДЕРЕВНЕ Молоко 2,5 паст отборное 1,4л ПЭТ(ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228027154.jpg"},{"id":"4607025390848","name":"АГУША Йогурт адап/дет. клуб/банан 2,7% 0,2кг( ОАО ЗДМП):4/12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025390848.jpg"},{"id":"4690228026355","name":"Агуша Я САМ! Йогурт яблоко-банан 2,2% 200г п/б(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025390855.jpg"},{"id":"4690228026355_akcia","name":"Агуша Я САМ! Йогурт яблоко-банан 2,2% 200г п/б(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025390855_akcia.jpg"},{"id":"4607025391753","name":"АГУША Йогурт адап/дет яблоко/груша 2,7% 0,2кг(ОАО ЗДМП):4/12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025391753.jpg"},{"id":"4690228026393","name":"Агуша Я САМ! Йогурт клубника-земляника 2,2% 200г п/б(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228026393.jpg"},{"id":"4690228026393_akcia","name":"Агуша Я САМ! Йогурт клубника-земляника 2,2% 200г п/б(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228026393_akcia.jpg"},{"id":"4690228026690","name":"Чудо Детки Йогурт пит яб-банан 2,2% 200г пл/бут(ВБД):4/12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228026690.jpg"},{"id":"4690228026713","name":"Чудо Детки Йогурт пит клубника 2,2% 200г пл/б (ВБД):4/12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228026713.jpg"},{"id":"4690228028397","name":"Агуша Биолакт обогащенный 3,2% 200г п/б(ВБД):4/12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228028397.jpg"},{"id":"4690228028960","name":"АГУША ЗАСЫПАЙ-КА Йог пит ябл/мелис 2,7% дет 200г п/б(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228028960.jpg"},{"id":"4690228032165","name":"АГУША Ряженка 3,2% 200г п/бут (ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228032165.jpg"},{"id":"4690228032189","name":"АГУША Ряженка клубника 2,9%200г п/бут (ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228032189.jpg"},{"id":"4690228032257","name":"ЧУДО ДЕТКИ Йогурт клуб/бан 2,2%200г п/бут(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228032257.jpg"},{"id":"4690228026768","name":"Чудо Детки Йогурт пит яб-банан 2,2% 200г пл/бут(ВБД): упаковка 4шт","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228026768.jpg"},{"id":"4690228026775","name":"ЧУДО ДЕТКИ Йогурт клубника 2,2%200г п/бут(ВБД) упаковка 4шт","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228026775.jpg"},{"id":"4690228032288","name":"ЧУДО ДЕТКИ Йогурт клуб/бан 2,2%200г п/бут(ВБД) упаковка 4шт","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228032288.jpg"},{"id":"4690228032547","name":"АГУША ряженка детская  2,9 100г (Вимм-Билль-Данн) упаковка 4шт","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228032547.jpg"},{"id":"4690228029783","name":"BIO-MAX Био-йогурт пит малина-смородин 2,7% 270г пэт(ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228029783.jpg"},{"id":"4690228029820","name":"BIO-MAX Био-йогурт пит Мюсли-Злаки 2,8% 270г пэт(ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228029820.jpg"},{"id":"4690228029844","name":"BIO-MAX Био-йогурт питьевой чернослив 2,7% 270г пэт(ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228029844.jpg"},{"id":"4690228029868","name":"BIO-MAX Био-йогурт пит Персик-Курага 2,7% 270г пэт(ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228029868.jpg"},{"id":"4690228029882","name":"BIO-MAX Био-йогурт пит Яблоко-Злаки 2,7% 270г пэт(ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228029882.jpg"},{"id":"4690228029905","name":"BIO-MAX Био-йогурт питьевой клубника 2,7% 270г пэт(ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228029905.jpg"},{"id":"4690228031168","name":"ЧУДО Йогурт питьевой Черника-Малина 2,4%270г пл/бут(ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228031168.jpg"},{"id":"4690228031229","name":"ЧУДО Йогурт пит Дыня-Манго-Персик 2,4%270г пл/бут (ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228031229.jpg"},{"id":"4690228031250","name":"ЧУДО Йогурт питьевой Клубн-Землян 2,4% 270г пл/бут(ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228031250.jpg"},{"id":"4690228031281","name":"ЧУДО Йогурт пит Вишня-Черешня 2,4% 270г пл/бут (ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228031281.jpg"},{"id":"4690228031342","name":"ЧУДО Йогурт пит Киви-Апельс-Маракуйя 2,4% 270г пл/бут(ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228031342.jpg"},{"id":"4690228031373","name":"ЧУДО Йогурт питьевой Персик-Абрикос 2,4%270г пл/бут(ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228031373.jpg"},{"id":"4690228031403","name":"ЧУДО Йогурт питьев Северные ягоды 2,4%270г пл/бут (ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228031403.jpg"},{"id":"4690228011771","name":"ЧУДО Коктейль молочный Шоколад 270г ПЭТ (ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228011771.jpg"},{"id":"4690228011771_akciya","name":"ЧУДО Коктейль молочный Шоколад 270г ПЭТ (ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228011771_akciya.jpg"},{"id":"4690228011795","name":"ЧУДО Коктейль молочный паст ваниль 2% 270г ПЭТ (ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228011795.jpg"},{"id":"4690228011795_Etiketka_1","name":"ЧУДО Коктейль молочный паст ваниль 2% 270г ПЭТ (ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228011795_Etiketka_1.jpg"},{"id":"4690228011795_Etiketka_2","name":"ЧУДО Коктейль молочный паст ваниль 2% 270г ПЭТ (ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228011795_Etiketka_2.jpg"},{"id":"4600699507406","name":"Слобода йогурт питьевой паст клубничный 2% 290г п/б(ЭФКО):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600699507406.jpg"},{"id":"4600699507444","name":"СЛОБОДА Йогурт питьевой с черникой 2% 290г п/бут(ЭФКО):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600699507444.jpg"},{"id":"4600699507482","name":"Слобода йогурт питьевой паст персиковый 2% 290г п/б(ЭФКО):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600699507482.jpg"},{"id":"4690228015540","name":"БИОМАКС Кефирный легкий 1% 450г ПЭТ(ВБД) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228015540.jpg"},{"id":"4690228020452","name":"Чудо йогурт пит Персик-Абрикос 2,4% 690г пл/бут(ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228020452.jpg"},{"id":"4690228020476","name":"Чудо йогурт пит Клубника-Земляника 2,4% 690г пл/бут(ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228020476.jpg"},{"id":"4690228010323","name":"ДОМИК В ДЕРЕВНЕ Молоко паст 2,5% 930мл ПЭТ (ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228010323.jpg"},{"id":"4690228010347","name":"ДОМИК В ДЕРЕВНЕ Молоко паст 3.5-4.5% 930мл ПЭТ (ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228010347.jpg"},{"id":"4690228017902","name":"КУБАНСКАЯ БУРЕНКА Молоко отбор 3,5%-4,5% пэт 0,93л(ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228017902.jpg"},{"id":"4690228010071","name":"ВЕСЕЛЫЙ МОЛОЧНИК Молоко паст отборное 3,7% 930мл ПЭТ(ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228010071.jpg"},{"id":"4690228010095","name":"ВЕСЕЛЫЙ МОЛОЧНИК Молоко паст 2,5% 930мл ПЭТ (ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228010095.jpg"},{"id":"4690228015304","name":"ЧУДО Коктейль у/паст молочный шоколад 950г ПЭТ(ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228015304.jpg"},{"id":"4690228015304_Etiketka_1","name":"ЧУДО Коктейль у/паст молочный шоколад 950г ПЭТ(ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228015304_Etiketka_1.jpg"},{"id":"4690228015304_Etiketka_2","name":"ЧУДО Коктейль у/паст молочный шоколад 950г ПЭТ(ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228015304_Etiketka_2.jpg"},{"id":"4690228019166","name":"ЧУДО Коктейль мол стер Клубника ПЭТ 2% 950г(ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228019166.jpg"},{"id":"4690228019166_Etiketka_1","name":"ЧУДО Коктейль мол стер Клубника ПЭТ 2% 950г(ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228019166_Etiketka_1.jpg"},{"id":"4690228019166_Etiketka_2","name":"ЧУДО Коктейль мол стер Клубника ПЭТ 2% 950г(ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228019166_Etiketka_2.jpg"},{"id":"4011100977624","name":"БАУНТИ Молочный 55-58г (Марс) :32/192","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4011100977624.jpg"},{"id":"5000159381178","name":"БАУНТИ шоколадный батончик Трио 82,5г (Марс):24/144","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5000159381178.jpg"},{"id":"4600494509582","name":"Адреналин Раш Энерг.напиток 0,5л Ж/Б(Пепси):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600494509582.jpg"},{"id":"4600494519475","name":"АДРЕНАЛИН РАШ Нейчер напиток безалк 0,5л ж/б(ПепсиКо):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600494519475.jpg"},{"id":"4600494521218","name":"Адреналин Джуси Энерг.напиток 0,5л Ж/Б(Пепси):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600494521218.jpg"},{"id":"4600494521713","name":"Драйв Ми Напиток энергет газ 0,5л ж/б(ПепсиКо):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600494521713.jpg"},{"id":"4600494522789","name":"Адреналин Раш Ред Энерджи нап б/а тониз 0,5л ж/б (ПепсиКо):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600494522789.jpg"},{"id":"4601501027624","name":"HEINEKEN Пиво свет фильт паст 4,8%0,45л ж/б с кл(ОПХ):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601501027624.jpg"},{"id":"4601501089158","name":"AMSTEL Premium Pilsener Пиво св фил пас4,8%0,45л ж/б(ОПХ):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601501089158.jpg"},{"id":"4601501089561","name":"КОХОТА Пиво Крепкое светлое фильт паст 8,1% 0,45л ж/б(ОПХ):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601501089561.jpg"},{"id":"4601501227130","name":"GOSSER Пиво светлое фильт паст 4,7% 0,48л ж/б(ОПХ):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601501227130.jpg"},{"id":"4601501289084","name":"KRUSOVICE Пиво Svetle свет фильт паст 4,2% 0,45л ж/б(ОПХ):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601501289084.jpg"},{"id":"4601501289138","name":"GOSSER Пиво светлое фильт паст 4,7% 0,45л ж/б(ОПХ):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601501289138.jpg"},{"id":"4601501489378","name":"HEINEKEN Пив Нап б/а свет паст 0,5% 0,45л ж/б с кл(ОПХ):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601501489378.jpg"},{"id":"4605664000371","name":"ВЕЛКОПОПОВИЦКИЙ КОЗЕЛ светлый 0,5л ж/б","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4605664000371.jpg"},{"id":"4605664002740","name":"ВЕЛКОПОПОВИЦКИЙ КОЗЕЛ пив нап темн 0,5л ж/б(Москва-Эфес):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4605664002740.jpg"},{"id":"5060466510920","name":"BURN Энерг напиток яблоко/киви 0,33л ж/б (Кока-кола):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5060466510920.jpg"},{"id":"54490086_newyear","name":"COCA-COLA газ нап 0,25л с/б (Кока-кола):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/54490086_newyear.jpg"},{"id":"5449000054227","name":"COCA-COLA Газ.нап. 1л ПЭТ(Кока-Кола):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5449000054227.jpg"},{"id":"5449000054227_akciya","name":"COCA-COLA Газ.нап. 1л ПЭТ(Кока-Кола):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5449000054227_akciya.jpg"},{"id":"5449000000439","name":"COCA-COLA газ нап 1,5л ПЭТ (Кока-Кола):9","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5449000000439.jpg"},{"id":"5449000000439_akciya","name":"COCA-COLA газ нап 1,5л ПЭТ (Кока-Кола):9","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5449000000439_akciya.jpg"},{"id":"5449000133335","name":"COCA-COLA Zero напиток б/алк с/газ 1,5л ПЭТ(Кока-Кола):9","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5449000133335.jpg"},{"id":"5449000133335_akciya","name":"COCA-COLA Zero напиток б/алк с/газ 1,5л ПЭТ(Кока-Кола):9","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5449000133335_akciya.jpg"},{"id":"5449000000286","name":"COCA-COLA Газ.нап. 2л ПЭТ(Кока-Кола):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5449000000286.jpg"},{"id":"5449000000286_akciya","name":"COCA-COLA Газ.нап. 2л ПЭТ(Кока-Кола):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5449000000286_akciya.jpg"},{"id":"5449000131836","name":"COCA-COLA Zero напиток б/алк с/газ 0,5л ПЭТ(Кока-Кола):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5449000131836.jpg"},{"id":"7891024128992","name":"КОЛГЕЙТ З/паста Тройное Действие 100мл:12/48","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/7891024128992.jpg"},{"id":"7891024149102","name":"КОЛГЕЙТ З/п Макс. защ. от кар. Свежая Мята 100мл:12/48","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/7891024149102.jpg"},{"id":"7891024188279","name":"КОЛГЕЙТ З/паста Бережное отбеливание 100мл (Колгейт):12/48","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/7891024188279.jpg"},{"id":"7891024132470","name":"КОЛГЕЙТ З/п Лечебные травы 100мл (Колгейт):12/48","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/7891024132470.jpg"},{"id":"7891024132494","name":"КОЛГЕЙТ З/п Лечебные травы Отбеливающая100мл (Колгейт):12/48","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/7891024132494.jpg"},{"id":"7891024137840","name":"КОЛГЕЙТ З/паста Прополис Отбеливающая 100мл:12/48","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/7891024137840.jpg"},{"id":"4690228028847","name":"АГУША Пюре яблоко-банан-печенье с 6мес 90г гуала пак(ВБД):10","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228028847.jpg"},{"id":"4690228028861","name":"АГУША Пюре мультифрукт с 6 мес 90г гуала пак (ВБД):10","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228028861.jpg"},{"id":"4690228028885","name":"АГУША Пюре яблоко с 4 мес 90г гуала пак (ВБД):10","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228028885.jpg"},{"id":"4690228028908","name":"АГУША Пюре яблоко-персик с 6 мес 90г гуала пак (ВБД):10","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228028908.jpg"},{"id":"4690228028922","name":"АГУША Пюре банан с 6 мес 90г гуала пак (ВБД):10","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228028922.jpg"},{"id":"4690228028946","name":"АГУША Пюре груша с 4 мес 90г гуала пак (ВБД):10","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228028946.jpg"},{"id":"4602541004132","name":"АГУША Фруктовое пюре Яблоко 115г (Вимм-Билль-Данн)","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541004132.jpg"},{"id":"4602541004156","name":"АГУША Фруктовое пюре  Груша 115г (Вимм-Билль-Данн)","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541004156.jpg"},{"id":"4602541004170","name":"АГУША Фруктовое пюре Яблоко-банан 115г (Вимм-Билль-Данн) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541004170.jpg"},{"id":"4602541004217","name":"АГУША Фруктовое пюре Груша-яблоко 115г (Вимм-Билль-Данн) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541004217.jpg"},{"id":"4602541004330","name":"АГУША Фруктовое пюре Чблоко-персик 115г (Вимм-Билль-Данн)","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541004330.jpg"},{"id":"4690228023583","name":"АГУША Фруктовое пюре Фруктовое ассорти 115г (Вимм-Билль-Данн)","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228023583.jpg"},{"id":"4011100157361","name":"Pedigree Пауч/Говядина 100г( Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4011100157361.jpg"},{"id":"4607065001612","name":"Cesar корм д/соб говядина с овощами 100г пауч(Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065001612.jpg"},{"id":"4607065001636","name":"Cesar корм д/соб ягненок с овощами 100г пауч(Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065001636.jpg"},{"id":"4607065003791","name":"Perfect Fit корм д/котят с кур.85г (Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065003791.jpg"},{"id":"4607065003838","name":"Perfect Fit корм д/стерил кош с кур.85г (Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065003838.jpg"},{"id":"4607065003999","name":"Whiskas рагу д/кош говядина/ягненок 85г (Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065003999.jpg"},{"id":"4607065004019","name":"Whiskas рагу курица 85г (Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065004019.jpg"},{"id":"4607065004057","name":"Whiskas рагу д/кош кролик/индейка 85г (Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065004057.jpg"},{"id":"4607065004118","name":"Whiskas желе д/кош говяд/ягненок 85г (Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065004118.jpg"},{"id":"4607065372057","name":"Whiskas корм д/кош рагу лосось 85г (Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065372057.jpg"},{"id":"4607065372071","name":"Whiskas корм д/к рагу форель 85г (Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065372071.jpg"},{"id":"4607065372095","name":"Whiskas корм д/к рагу телятина 85г (Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065372095.jpg"},{"id":"4607065375829","name":"Whiskas Корм д/к крем-суп курица 85г пауч(Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065375829.jpg"},{"id":"4607065375966","name":"Kitekat Корм д/кош c говядиной в соусе 85г пауч(Марс):28","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065375966.jpg"},{"id":"4607065375980","name":"Kitekat Корм д/кошек желе говядина 85г пауч(Марс):28","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065375980.jpg"},{"id":"4607065376000","name":"Kitekat Корм д/кош с курицей в соусе 85г пауч(Марс):28","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065376000.jpg"},{"id":"4607065376048","name":"Kitekat Корм д/кош с рыбой в соусе 85г пауч(Марс):28","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065376048.jpg"},{"id":"4607065376062","name":"Kitekat Корм д/кошек с кроликом в соусе 85г пауч(Марс):28","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065376062.jpg"},{"id":"4607065376109","name":"Kitekat Корм д/кошек с индейкой в соусе 85г пауч(Марс):28","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065376109.jpg"},{"id":"4607065378424","name":"Perfect Fit Корм влаж для взр/кошек с говядиной85г(Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065378424.jpg"},{"id":"4607065379421","name":"Whiskas Корм д/кошек влаж с говядиной мини-филе 85г(Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065379421.jpg"},{"id":"5000159373111","name":"Whiskas корм д/котят курица 85г (Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5000159373111.jpg"},{"id":"5000159438674","name":"Sheba корм д/кош говядина/кролик 0,085кг(Марс) :24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5000159438674.jpg"},{"id":"5000159438698","name":"Sheba Из индейки и курицы 0,085кг (Марс) :24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5000159438698.jpg"},{"id":"5000159438711","name":"Sheba Из тунца и лосося 0,085кг (Марс) :24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5000159438711.jpg"},{"id":"5000159438735","name":"Sheba Из телятины и языка 0,085кг (Марс) :24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5000159438735.jpg"},{"id":"5000159438926","name":"Whiskas Паштет д/кош говядина/печень 85г (Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5000159438926.jpg"},{"id":"5000159438940","name":"Whiskas Паштет курица/индейка 85г (Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5000159438940.jpg"},{"id":"5000159445160","name":"Sheba корм д/кош курица/кролик 85г (Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5000159445160.jpg"},{"id":"5000159448437","name":"Whiskas корм д/кош 8 + рагу с ягненком 85г (Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5000159448437.jpg"},{"id":"5000159450904","name":"Pedigree корм для собак кролик/индейка 100г (Марс):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5000159450904.jpg"},{"id":"4011100091993","name":"МИЛКИ ВЕЙ 26г (Марс) :36/216","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4011100091993.jpg"},{"id":"4600494522024","name":"MIRINDA газ нап 1,75л ПЭТ(ПепсиКо):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600494522024.jpg"},{"id":"4600494505683","name":"MIRINDA газ нап 0,6л ПЭТ (ПепсиКо):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600494505683.jpg"},{"id":"4600494521881","name":"PEPSI Газ.нап. 1,75л ПЭТ(ПепсиКо):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600494521881.jpg"},{"id":"4600494522116","name":"PEPSI Лайт Газ.нап. 1,75л ПЭТ(ПепсиКо):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600494522116.jpg"},{"id":"4600494103063","name":"PEPSI Газ.нап. 2,25л ПЭТ(ПепсиКо):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600494103063.jpg"},{"id":"4600494000027","name":"ПЕПСИ-КОЛА Лайт Газ. напиток 0,6л :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600494000027.jpg"},{"id":"4600494313165","name":"PEPSI Газ.нап. 0,6л ПЭТ(Пепси):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600494313165.jpg"},{"id":"4600494601422","name":"PEPSI Напиток газ Wild Cherry б/а 0,6л ПЭТ(ПепсиКо):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600494601422.jpg"},{"id":"4602541000615","name":"АГУША Творог дет.класс.4,5% 0,1кг (ВБД) :6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541000615.jpg"},{"id":"4602541005740","name":"АГУША Творог фруктовый Яблоко/Банан 3.9% 100г (ВБД) :6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541005740.jpg"},{"id":"4602541005795","name":"АГУША Творог фрукт. Персик 3,9% ван. 100г (ВБД) :6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541005795.jpg"},{"id":"4690228022081","name":"АГУША Я САМ Тв фрукт мал/бан/печен 3.8% 100г пл/в (ВБД):2/6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228022081.jpg"},{"id":"4690228029004","name":"АГУША ЗАСЫПАЙ-КА Творог клуб-бан-мелис 3,8% 100г п/в(ВБД):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228029004.jpg"},{"id":"4690228006890","name":"ЧУДО Десерт Творожный 4.2% Клубника 100г(ВБД):16","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228006890.jpg"},{"id":"4690228006906","name":"ЧУДО Десерт Творожный 4.2% Вишня 100г(ВБД):16","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228006906.jpg"},{"id":"4690228006913","name":"ЧУДО Десерт Творожный 4.2% Персик-Груша 100г(ВБД):16","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228006913.jpg"},{"id":"4690228006920","name":"ЧУДО Десерт Творожный 4.2% Черника 100г(ВБД):16","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228006920.jpg"},{"id":"4690228006968","name":"ЧУДО Десерт Творожный 4% Клубника-Земляника 100г(ВБД):16","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228006968.jpg"},{"id":"4690228006975","name":"ЧУДО Десерт Творожный 4% Вишня-Черешня 100г(ВБД):16","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228006975.jpg"},{"id":"4690228008009","name":"ЧУДО Десерт Творожный 4.2% Персик-Маракуйя 100г(ВБД):16","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228008009.jpg"},{"id":"4690228008023","name":"ЧУДО Десерт Творожный 4.2% киви-банан 100г(ВБД):16","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228008023.jpg"},{"id":"4690228025464","name":"Чудо Десерт творожный взбитый Ананас 4,2% 100г п/в(ВБД):16","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228025464.jpg"},{"id":"4690228030437","name":"ЧУДО десерт твор паст Северн ягоды 4,2% 100г пл/ван(ВБД):16","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228030437.jpg"},{"id":"4690228033032","name":"ЧУДО Десерт Творожный 4.2% малина-ежевика 100г(ВБД):16","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228033032.jpg"},{"id":"4690229030451","name":"ЧУДО Десерт Творожный 4.2% экзотические фрукты 100г(ВБД):16","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690229030451.jpg"},{"id":"4600699507390_single","name":"Слобода йогурт вязкий паст клубничный 2,9% 125г п/в(ЭФКО):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600699507390_single.jpg"},{"id":"4600699507475_single","name":"Слобода йогурт вязкий паст персиковый 2,9% 125г п/в(ЭФКО):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600699507475_single.jpg"},{"id":"4600949123134_single","name":"БИО МАКС 5 ВИТАМИНОВ Йогурт натурал 3,2% лот. 125г (ВБД) :24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600949123134_single.jpg"},{"id":"4600949123288_single","name":"БИО МАКС 5 ВИТАМИНОВ Йогурт персик 2,5% лот. 125г (ВБД) :24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600949123288_single.jpg"},{"id":"4607025391111_single","name":"БИО МАКС 5 ВИТАМИНОВ Йогурт черника 2,5% лот. 125г (ВБД) :24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025391111_single.jpg"},{"id":"4690228029684_single","name":"БИО МАКС Биойог вязкий отруби злак 2,6% 125г лоток (ВБД):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228029684_single.jpg"},{"id":"4690228029707_single","name":"БИО МАКС Биойог вязкийклубника 2,6% 125г лоток (ВБД):24","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228029707_single.jpg"},{"id":"4607025392880","name":"ДОМИК В ДЕРЕВНЕ Сметана 20% 180г пл/ст(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025392880.jpg"},{"id":"4690228018183","name":"КУБАНСКАЯ БУРЕНКА Сметана 20% 180г пл/ст(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228018183.jpg"},{"id":"4690228030642","name":"ДОМИК В ДЕРЕВНЕ Творог мягкий 0,1% 200г п/ван (ВБД):8/16","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228030642.jpg"},{"id":"4690228027895","name":"ЧУДО Продукт творожный Вишня-Шокол 5,6% 290г пл/ст (ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228027895.jpg"},{"id":"4690228027970","name":"ЧУДО Йогурт вязкий вишня-черешня 2,5% 290г пл/ст (ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228027970.jpg"},{"id":"4690228027994","name":"ЧУДО Йогурт вязкий клубника-земляника 2,5% 290г пл/ст(ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228027994.jpg"},{"id":"4690228028014","name":"ЧУДО Йогурт вязкий персик-маракуйя 2,5% 290г пл/ст (ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228028014.jpg"},{"id":"4690228028038","name":"ЧУДО Йогурт вязкий Черника-Малина 2,5% 290г пл/ст (ВБД):8","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228028038.jpg"},{"id":"4690228026997","name":"КУБАНСКАЯ БУРЕНКА Сметана 20% 330г карт/ст(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228026997.jpg"},{"id":"4690228027079","name":"ДОМИК В ДЕРЕВНЕ Сметана 15% 330г пласт/ст(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228027079.jpg"},{"id":"4690228019548","name":"ВЕСЕЛЫЙ МОЛОЧНИК Сметана 15% 330г пл/ст(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228019548.jpg"},{"id":"4011100091108","name":"МАРС 50г (Марс) :36/288","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4011100091108.jpg"},{"id":"4607065001445","name":"Сникерс батончик Шоколадный 50,5г комб/пол/уп(Марс):48/288","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065001445.jpg"},{"id":"4607065001490","name":"МАРС Макс Промо Шок Батончик 81г(МАРС):24/168","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065001490.jpg"},{"id":"4607065730109","name":"SNICKERS Батончик белый 81г м/уп(Марс):32/160","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607065730109.jpg"},{"id":"5000159439480","name":"СНИКЕРС Лесной орех 81г (Марс) :32/160","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5000159439480.jpg"},{"id":"5000159455367","name":"СНИКЕРС Супер Шок батончик 95г(Марс):32/128","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5000159455367.jpg"},{"id":"4605246003516","name":"Greenfield Чай Голден Цейлон лист. 100г (Орими Трэйд) :14","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4605246003516.jpg"},{"id":"4601201017697","name":"Фруктовый сад Сок томатный с мяк 0,95л(Лебедянский) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201017697.jpg"},{"id":"4601201017727","name":"Фруктовый сад Нектар перс-ябл с мяк 0,95л (Лебедянский) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201017727.jpg"},{"id":"4601201017765","name":"Фруктовый сад Нектар мультифрукт с мяк0,95л(Лебедянский) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201017765.jpg"},{"id":"4601201017765_akcia","name":"Фруктовый сад Нектар мультифрукт с мяк0,95л(Лебедянский) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201017765_akcia.jpg"},{"id":"4601201017840","name":"Фруктовый сад яблоко виноград 0,95л(Лебедянский) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201017840.jpg"},{"id":"4601201017963","name":"Фруктовый сад Сок ананас 0,95л(Лебедянский) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201017963.jpg"},{"id":"4601201017994","name":"Фруктовый сад Нектар яблочный осв 0,95л(Лебедянский) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201017994.jpg"},{"id":"4601201018038","name":"Фруктовый сад Сок апельсиновый 0,95л(Лебедянский) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201018038.jpg"},{"id":"4601201018038_akcia","name":"Фруктовый сад Сок апельсиновый 0,95л(Лебедянский) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201018038_akcia.jpg"},{"id":"4601201018809","name":"Фруктовый сад Сок яблоко-ягоды 0,95л(Лебедянский) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201018809.jpg"},{"id":"4601201019196","name":"Фруктовый сад яблокоб вишня черноплодня рябина 0,95л(Лебедянский) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201019196.jpg"},{"id":"4601201020970","name":"Фруктовый сад Сок яблоко с мякотью 0,95л(Лебедянский) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201020970.jpg"},{"id":"4607012937421","name":"Чудо Коктейль молочный шоколад 2% 0,96г ТБА(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607012937421.jpg"},{"id":"4690228003998","name":"ДОМИК В ДЕРЕВНЕ Молоко стер 0,5 % 950г ТБА (ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228003998.jpg"},{"id":"4690228004018","name":"ДОМИК В ДЕРЕВНЕ Молоко стер 3,2 % 950г ТБА (ВБД) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228004018.jpg"},{"id":"4690228004056","name":"ДОМИК В ДЕРЕВНЕ Молоко стер 6 % 950г ТБА (ВБД) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228004056.jpg"},{"id":"4690228006845","name":"ЧУДО Коктейль молочный клубника 2% 960г ТБА(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228006845.jpg"},{"id":"4690228006852","name":"ЧУДО Кокт.молочный ваниль 2% 960г ТБА(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228006852.jpg"},{"id":"4690228006869","name":"ЧУДО Кокт.молочный банан-карамель 2% 960г ТБА(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228006869.jpg"},{"id":"4690228007842","name":"ДОМИК В ДЕРЕВНЕ Молоко стер. 2,5% ТБА 950гр (ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228007842.jpg"},{"id":"4600949010359","name":"ЛИАНОЗОВСКОЕ молоко \"М\" 3,2% стерил. 950г (ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600949010359.jpg"},{"id":"4607012930057","name":"КУБАНСКАЯ БУРЕНКА Молоко у/паст  973г ТБА (ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607012930057.jpg"},{"id":"4607012930064","name":"КУБАНСКАЯ БУРЕНКА Молоко у/паст  973г ТБА (ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607012930064.jpg"},{"id":"4607012930071","name":"КУБАНСКАЯ БУРЕНКА Молоко у/паст  973г ТБА (ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607012930071.jpg"},{"id":"4607012930088","name":"КУБАНСКАЯ БУРЕНКА Молоко у/паст  973г ТБА (ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607012930088.jpg"},{"id":"4607012930095","name":"КУБАНСКАЯ БУРЕНКА Молоко у/паст  6% 977г ТБА (ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607012930095.jpg"},{"id":"4690228006302","name":"33 коровы Молоко у/паст 2,5%","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228006302.jpg"},{"id":"4602541001674","name":"АГУША молоко стер.детское 3,2% 0,5л ТВА (ВБД) :15","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541001674.jpg"},{"id":"4602541001674_akciya","name":"АГУША молоко стер.детское 3,2% 0,5л ТВА (ВБД) :15","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541001674_akciya.jpg"},{"id":"4602541006259","name":"АГУША Компот Изюм Курага Яблоко 200мл(ВБД ):15","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541006259.jpg"},{"id":"4602541007287","name":"АГУША Морс Ягодный сбор 200мл(ВБД ):15","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541007287.jpg"},{"id":"4690228019104","name":"АГУША Компот Клубника Яблоко Черноплодная рябина 200мл(ВБД ):15","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228019104.jpg"},{"id":"4602541006211","name":"АГУША Компот процеженный Яблоко-курага-изюм 500мл","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541006211.jpg"},{"id":"4602541006228","name":"АГУША Морс Ягодный сбор 500мл","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541006228.jpg"},{"id":"4690228016714","name":"АГУША Компот процеженный Клубника-яблоко-черноплодная рябина 500мл","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228016714.jpg"},{"id":"4690228029287","name":"АГУША Сок Яблоко с мякотью для кормящих 500мл","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228029287.jpg"},{"id":"4690228029363","name":"АГУША Сок Яблоко с мякотью для беременных 500мл","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228029363.jpg"},{"id":"4690228029424","name":"АГУША Сок Яблоко-груша с мякотью для кормящих 500мл","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228029424.jpg"},{"id":"4607025399780","name":"МАЖИТЕЛЬ НЕО Мол-соков нап груша манго  950г п/пак(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025399780.jpg"},{"id":"4607025399797","name":"МАЖИТЕЛЬ NEO Мол-сок клубника 950г п/пак(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025399797.jpg"},{"id":"4607025399803","name":"МАЖИТЕЛЬ НЕО Мол-соков нап мульти-фруктовый 950г п/пак(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025399803.jpg"},{"id":"4607025399810","name":"МАЖИТЕЛЬ НЕО Мол-соков нап стер перс-мар 950г п/пак(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025399810.jpg"},{"id":"4690228020520","name":"МАЖИТЕЛЬ НЕО paty пинаколада  950г п/пак(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228020520.jpg"},{"id":"4601512004300","name":"J7 премиум лайм-личиб манго-гуава 0,97л (ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512004300.jpg"},{"id":"4601512005291","name":"J7 Сок Апельсиновый 0,97л (ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512005291.jpg"},{"id":"4601512005291_akcia","name":"J7 Сок Апельсиновый 0,97л (ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512005291_akcia.jpg"},{"id":"4601512005307","name":"J7 Сок Яблочный 0,97(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512005307.jpg"},{"id":"4601512005307_akcia","name":"J7 Сок Яблочный 0,97(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512005307_akcia.jpg"},{"id":"4601512005314","name":"J7 Персиковый нектар с мякотью 0,97л (ВБД) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512005314.jpg"},{"id":"4601512005314_akciya","name":"J7 Персиковый нектар с мякотью 0,97л (ВБД) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512005314_akciya.jpg"},{"id":"4601512005321","name":"J7 Мультифрукт 0,97л (ВБД) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512005321.jpg"},{"id":"4601512005345","name":"J7 Премиум Вишня 0,97л (ВБД) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512005345.jpg"},{"id":"4601512005369","name":"J7 Томат 0,97л (ВБД) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512005369.jpg"},{"id":"4601512005376","name":"J7 Премиум Гранат Арония 0,97л (ВБД) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512005376.jpg"},{"id":"4601512005406","name":"J7 Премиум Грейпфрут 0,97л (ВБД) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512005406.jpg"},{"id":"4601512005918","name":"J7 манго-маракуйя нектар с мякотью 0,97л (ВБД) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512005918.jpg"},{"id":"4601512005918_akciya","name":"J7 манго-маракуйя нектар с мякотью 0,97л (ВБД) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512005918_akciya.jpg"},{"id":"4601512005925","name":"J7 премиум Красный апельсин 0,97л (ВБД) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512005925.jpg"},{"id":"4607012930460","name":"КУБАНСКАЯ БУРЕНКА Кефир 2,5% 0,5л т/рекс(ВБД) :10","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607012930460.jpg"},{"id":"4607012935380","name":"ВЕСЕЛЫЙ МОЛОЧНИК прод к/м Снежок 2,5% 0,475кг т/рекс(ВБД):10","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607012935380.jpg"},{"id":"4690228025839","name":"КУБАНСКАЯ БУРЕНКА Продукт к/м Снежок2,5% 475г т/рекс(ВБД):10","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228025839.jpg"},{"id":"4690228019982","name":"ДОМИК В ДЕРЕВНЕ Сливки 10% 750г ТБА(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228019982.jpg"},{"id":"4607012935793","name":"КУБАНСКАЯ БУРЕНКА Ряженка отборная 4% 0,95кг т/рекс (ВБД):10","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607012935793.jpg"},{"id":"4607012930477","name":"КУБАНСКАЯ БУРЕНКА Кефир 2,5% 1л т/рекс(ВБД) :10","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607012930477.jpg"},{"id":"4607025398387","name":"ДОМИК В ДЕРЕВНЕ Кефир 1л 3,2% т/рекс(ВБД)","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025398387.jpg"},{"id":"4607025398394","name":"ДОМИК В ДЕРЕВНЕ Кефир 1% 1л т/рекс(ВБД) :12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025398394.jpg"},{"id":"4607025398448","name":"ДОМИК В ДЕРЕВНЕ Ряженка 1л 3,2% т/рекс(ВБД)","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025398448.jpg"},{"id":"4690228022920","name":"ДОМИК В ДЕРЕВНЕ Кефир 1л 2,5% т/рекс(ВБД)","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228022920.jpg"},{"id":"4607025396956","name":"ДОМИК В ДЕРЕВНЕ Сливки стерил 10% 480г т/рекс (ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025396956.jpg"},{"id":"4607025398424","name":"ДОМИК В ДЕРЕВНЕ кефир 3.2% 0.5л ТБА (ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025398424.jpg"},{"id":"4607025398462","name":"ДОМИК В ДЕРЕВНЕ Ряженка 3,2 % 0,515л ТБА(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607025398462.jpg"},{"id":"4607096004477","name":"ДОМИК В ДЕРЕВНЕ Сливки у/паст 20% 480г ТБА(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607096004477.jpg"},{"id":"4690228001116","name":"ДОМИК В ДЕРЕВНЕ Кефир 1% 0,515л ТБА(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228001116.jpg"},{"id":"4601201001412","name":"ФРУКТОВЫЙ САД Апельсин 0,2л :27","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201001412.jpg"},{"id":"4601201001429","name":"ФРУКТОВЫЙ САД Томат 0,2л :27","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201001429.jpg"},{"id":"4601201001436","name":"ФРУКТОВЫЙ САД Яблоко-персик 0,2л :27","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201001436.jpg"},{"id":"4601201001443","name":"ФРУКТОВЫЙ САД Нектар мультифрукт 0,2л :27","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201001443.jpg"},{"id":"4601201001474","name":"ФРУКТОВЫЙ Ананас 0,2л :27","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201001474.jpg"},{"id":"4601201005465","name":"ФРУКТОВЫЙ САД Яблоко-Виноград 0,2л :27","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201005465.jpg"},{"id":"4601201010865","name":"ФРУКТОВЫЙ САД Яблоко с мякотью 0,2л :27","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201010865.jpg"},{"id":"4601201012739","name":"Фруктовый Сад Нектар яблочный 0,2л т/п(Лебедянский):27","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201012739.jpg"},{"id":"4601201019172","name":"ФРУКТОВЫЙ САД Яблоко-Вишня-Черноплодная рябина 0,2л :27","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201019172.jpg"},{"id":"4601201021205","name":"ФРУКТОВЫЙ САД Яблоко-Ягоды 0,2л :27","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201021205.jpg"},{"id":"4602541000011","name":"АГУША Мол дет стер с витам ТБА 0,2л (ВБД) :18","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541000011.jpg"},{"id":"4602541000028","name":"АГУША Кефир детский с 8мес 3,2% 204г ТБА (ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541000028.jpg"},{"id":"4602541000059","name":"АГУША-2 смесь кисломолочная 3,4% с6 мес ТБА 204г(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541000059.jpg"},{"id":"4602541000530","name":"АГУША Сок Мультифр.мяк.ТВА 200мл (ОАО ЗДМП):18","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4602541000530.jpg"},{"id":"4607017211724","name":"J7 Яблоко осветлённое 200мл (ОАО ЗДМП):18","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607017211724.jpg"},{"id":"4607017211748","name":"J7 Premium апельсин 200мл (ОАО ЗДМП):18","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607017211748.jpg"},{"id":"4607017211786","name":"J7 Premium Вишня 200мл (ОАО ЗДМП):18","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607017211786.jpg"},{"id":"4607017211830","name":"J7 Томат 200мл (ОАО ЗДМП):18","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607017211830.jpg"},{"id":"4607017211991","name":"J7 мультифрукт 0,2л :27","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607017211991.jpg"},{"id":"4607096002985","name":"АГУША Сок Яблоко осв.ТВА 200мл (ОАО ЗДМП):18","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4607096002985.jpg"},{"id":"4690228024474","name":"АГУША Я САМ мол кокт стер малина 2,5%с 3-х 200мл ТБА(ВБД):18","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228024474.jpg"},{"id":"4690228025129","name":"АГУША Сок Груша осветлен.200мл т/п(ВБД):18","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228025129.jpg"},{"id":"4690228026577","name":"Чудо Детки Молочный коктейль шоколад 2,5% 200мл ТБА(ВБД):18","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228026577.jpg"},{"id":"4690228026911","name":"Чудо Детки Молочный коктейль клубника 3,2% 200мл ТБА(ВБД):18","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228026911.jpg"},{"id":"4690228029929","name":"АГУША ЗАСЫПАЙ-КА Каш мол рис/яб/груш 2,7% 200мл т/б(ВБД):18","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228029929.jpg"},{"id":"4690228029943","name":"АГУША ЗАСЫПАЙ-КА Каш мол греч 2,5% дет 200мл т/б(ВБД):18","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228029943.jpg"},{"id":"4600949140018","name":"ЧУДО Коктейль молочный жид.шоколад 3% 0,2л ТБА(ВБД):27","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4600949140018.jpg"},{"id":"4601201017642","name":"ФРУКТОВЫЙ САД нектар яблочный осветл. 1,93л (Лебедянский):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201017642.jpg"},{"id":"4601201017659","name":"ФРУКТОВЫЙ САД томатный. 1,93л (Лебедянский):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201017659.jpg"},{"id":"4601201017666","name":"ФРУКТОВЫЙ САД нектар перс-ябл. с мяк. 1,93л (Лебедянский):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201017666.jpg"},{"id":"4601201017734","name":"Фруктовый сад Нектар мультифрукт c мяк 1,93л (Лебедянский):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201017734.jpg"},{"id":"4601201017819","name":"ФРУКТОВЫЙ САД виноград. 1,93л (Лебедянский):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201017819.jpg"},{"id":"4601201017932","name":"ФРУКТОВЫЙ САД ананас. 1,93л (Лебедянский):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201017932.jpg"},{"id":"4601201018007","name":"Фруктовый сад Нектар апельсин с мяк.1,93л(Лебедянский ОАО):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201018007.jpg"},{"id":"4601201018816","name":"ФРУКТОВЫЙ САД яблоко ягоды. 1,93л (Лебедянский):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201018816.jpg"},{"id":"4601201019202","name":"ФРУКТОВЫЙ САД яблоко вишня черноплодная рябина. 1,93л (Лебедянский):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201019202.jpg"},{"id":"4601512006731","name":"ЛЮБИМЫЙ Напиток Земляничное лето 1,93л т/пак (Лебедянский):6","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512006731.jpg"},{"id":"4601512009015","name":"Любимый Гранат Сезон Напит яб-гран-ч ряб осв 0,95л(Лебед):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601512009015.jpg"},{"id":"4601201054692","name":"ФРУКТОВЫЙ САД Морс ягодный сбор 0,95л т/пак(Лебедянский):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201054692.jpg"},{"id":"4601201054715","name":"ФРУКТОВЫЙ САД Морс земляника и брусника 0,95л т/пак(Лебедянский):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201054715.jpg"},{"id":"4601201054739","name":"ФРУКТОВЫЙ САД Морс клюквенный 0,95л т/пак(Лебедянский):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4601201054739.jpg"},{"id":"4690228030161","name":"АГУША Молоко ул/пас 3,2% для дет от 3 лет 925мл ТБА(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228030161.jpg"},{"id":"4690228030161_akcia","name":"АГУША Молоко ул/пас 3,2% для дет от 3 лет 925мл ТБА(ВБД):12","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4690228030161_akcia.jpg"},{"id":"4011100977952","name":"ТВИКС 55-58г (Марс) :40/240","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/4011100977952.jpg"},{"id":"5000159390729","name":"ТВИКС Экстра 82г (Марс) :24/144","vol":null,"img":"https://render.neuromation.io:39201/LearningSet20171223/5000159390729.jpg"}]
;

var defaultJson = '[ { `boxes`: { `y_max`: 0.43573859333992004, `y_min`: 0.17384138703346252, `x_min`: 0.590455174446106, `x_max`: 0.9920573234558105 }, `score`: 0.9994022846221924, `class`: null, `id`: `id_4607025395126` }, { `boxes`: { `y_max`: 0.657992959022522, `y_min`: 0.1591847538948059, `x_min`: 0.08265014737844467, `x_max`: 0.608603298664093 }, `score`: 0.9928760528564453, `class`: null, `id`: `id_4607025395119` }, { `boxes`: { `y_max`: 0.652998685836792, `y_min`: 0.16339734196662903, `x_min`: 0.3406871259212494, `x_max`: 0.6216973066329956 }, `score`: 0.9921865463256836, `class`: null, `id`: `id_4607025395118` }, { `boxes`: { `y_max`: 0.4604473412036896, `y_min`: 0.3550420105457306, `x_min`: 0.0056419274769723415, `x_max`: 0.12470033019781113 }, `score`: 0.9506948590278625, `class`: null, `id`: `id_4690228008009` }, { `boxes`: { `y_max`: 0.6511346697807312, `y_min`: 0.41087606549263, `x_min`: 0.579713761806488, `x_max`: 0.8017364144325256 }, `score`: 0.8775952458381653, `class`: null, `id`: `id_4607025395125` }, { `boxes`: { `y_max`: 0.37099453806877136, `y_min`: 0.264351487159729, `x_min`: 0.0074686286970973015, `x_max`: 0.12417260557413101 }, `score`: 0.8371890783309937, `class`: null, `id`: `id_4690228008008` }, { `boxes`: { `y_max`: 0.5553781986236572, `y_min`: 0.43269017338752747, `x_min`: 0.006454081274569035, `x_max`: 0.13676553964614868 }, `score`: 0.7598559260368347, `class`: null, `id`: `id_4690228008007` }, { `boxes`: { `y_max`: 0.6360628604888916, `y_min`: 0.1485539972782135, `x_min`: 0.03606809675693512, `x_max`: 0.3915937840938568 }, `score`: 0.7266176342964172, `class`: null, `id`: `id_4607025395117` }, { `boxes`: { `y_max`: 0.6449515223503113, `y_min`: 0.523859441280365, `x_min`: 0.006965884938836098, `x_max`: 0.1371941715478897 }, `score`: 0.42781245708465576, `class`: null, `id`: `id_4690228008006` }, { `boxes`: { `y_max`: 0.6448094844818115, `y_min`: 0.5286871194839478, `x_min`: 0.0026720331516116858, `x_max`: 0.1289806365966797 }, `score`: 0.3881155550479889, `class`: null, `id`: `id_7891024137840` } ]'
