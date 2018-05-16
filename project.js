exports.Task = extend(TolokaHandlebarsTask, function (options) {
    TolokaHandlebarsTask.call(this, options);
  }, {
    setResult: function(obj, val){
      console.log(obj, val)
      var res = obj
      //res['class'] = val
      this.setSolutionOutputValue('result.'+obj.id, val)
      console.log('_solution', this._solution)
      
    },
    getUrlJson: function(){
      var data = this.getTemplateData()
      return window.location.href.indexOf('/edit') >= 0 ? this.example_json : this.getProxyUrl(data.json)
    },
    loadJson: function(){
      
      var self = this
      
      //var url = this.getUrlJson()
      var url = "/api/v1/projects/10818"
  
      var xhr = new XMLHttpRequest();
  
      xhr.open('GET', url, true);
      xhr.setRequestHeader("Authorization", "AQAAAAARpTFIAAMFR6gwditFbUb5mwNI1ZYEuuA")
      xhr.setRequestHeader("Content-Type", "application/json");
  
      xhr.send(null);
  
      xhr.onreadystatechange = function() { 
        if (xhr.readyState != 4) return;
  
        if (xhr.status == 200) {
          //console.log(xhr.responseText)
          self.requestJson(xhr.responseText)
        }
  
      }
    },
    requestJson: function(json){
      var parents = this.getDOMElement()
      var elem = parents.querySelector(".task__cont-img");
        var params = {
          json: JSON.parse(json),
        parent: elem,
        funTask: this
      }
      var funListBox = new createListBox(params)
    },
    onRender: function() {
      // DOM-элемент задания сформирован (доступен через #getDOMElement()) 
      //console.log(getDOMElement())
      
      //this.example_json = 'https://drive.google.com/uc?id=1aLbHqMy1qOuSejnWscnz7s5AKlO53S83'
      this.example_json = 'https://sandbox.toloka.yandex.com/api/proxy/folder-sandbox/IMG_3138.json'
      var data = this.getTemplateData()
      var parents = this.getDOMElement()
      var elem = parents.querySelector(".task__cont-img")
      console.log(this)
      // console.log(this.getSolution)
      
      
  
      if(elem){
        this.loadJson()    	
        //this.requestJson(data.json)
      }
    },
    
    onDestroy: function() {
      console.log('onDestroy')
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
  
  function createListBox (params) {
    var json = params.json;
    var parent = params.parent
    var funTask = params.funTask
      
      parent.style.position = 'relative';
    var cont_box = document.createElement('div');
    cont_box.className = 'cont-box';
    parent.appendChild(cont_box);
    console.log(funTask.getTemplateData)
    this.clickBox = function(obj, box){
      funTask.setResult(obj, 11111)
      box.classList.add('selected')
    }
    
    for(var i = 0; i < json.length; i++){
        //console.log(json[i])
      var elem = new itemBox(json[i])
      elem.addEventListener('click', this.clickBox.bind(this, json[i], elem) )
      cont_box.appendChild(elem)
    }
    this.clickBox = function(obj, box){
      funTask.setResult(obj, 11111)
      box.classList.add('selected')
    }
  }
  function itemBox(data) {
    var elem = document.createElement('div');
    elem.className = 'box'
    elem.style.width = Math.floor((data.boxes.x_max - data.boxes.x_min)*100) + '%';
    elem.style.height = Math.floor((data.boxes.y_max - data.boxes.y_min)*100) + '%';
    elem.style.left = Math.floor( data.boxes.x_min*100 ) + '%';
    elem.style.top  = Math.floor( data.boxes.y_min*100 ) + '%';
    return elem
  }
  
var json = [
  {
   "id": "name_1",
  "class":"4600494313165",
  "score":0.9999686479568481,
  "boxes":{
  "x_min":0.8128760457038879,
  "y_min":0.12611418962478638,
  "x_max":0.9013035893440247,
  "y_max":0.4980064928531647
  }
  },
  {
    "id": "name_2",
  "class":"4690228028038",
  "score":0.9999523162841797,
  "boxes":{
  "x_min":0.1032407134771347,
  "y_min":0.7457746863365173,
  "x_max":0.20946437120437622,
  "y_max":0.9141080975532532
  }
  },
  {
    "id": "name_3",
  "class":"4601201019202",
  "score":0.9999206066131592,
  "boxes":{
  "x_min":0.29641833901405334,
  "y_min":0.12548160552978516,
  "x_max":0.43907663226127625,
  "y_max":0.48673108220100403
  }
  },
  {
    "id": "name_4",
  "class":"4607025390855",
  "score":0.9994433522224426,
  "boxes":{
  "x_min":0.7276021242141724,
  "y_min":0.7149309515953064,
  "x_max":0.7798038125038147,
  "y_max":0.9100179076194763
  }
  },
  {
    "id": "name_5",
  "class":"4601201018038_akcia",
  "score":0.9993093013763428,
  "boxes":{
  "x_min":0.6405422687530518,
  "y_min":0.6161385178565979,
  "x_max":0.7346473336219788,
  "y_max":0.9334861636161804
  }
  },
  {
    "id": "name_6",
  "class":"4690228028922",
  "score":0.9991471767425537,
  "boxes":{
  "x_min":0.5581320524215698,
  "y_min":0.6855905055999756,
  "x_max":0.6390557885169983,
  "y_max":0.9145565032958984
  }
  },
  {
    "id": "name_7",
  "class":"4601201018038",
  "score":0.9987297654151917,
  "boxes":{
  "x_min":0.7806978225708008,
  "y_min":0.6207697987556458,
  "x_max":0.887639045715332,
  "y_max":0.9266953468322754
  }
  },
  {
    "id": "name_8",
  "class":"4605664000371",
  "score":0.9985194802284241,
  "boxes":{
  "x_min":0.4646059572696686,
  "y_min":0.6683230996131897,
  "x_max":0.5330393314361572,
  "y_max":0.9133133888244629
  }
  },
  {
    "id": "name_9",
  "class":"4690228016714",
  "score":0.9982670545578003,
  "boxes":{
  "x_min":0.38030630350112915,
  "y_min":0.6806477308273315,
  "x_max":0.4617893099784851,
  "y_max":0.893563985824585
  }
  },
  {
    "id": "name_10",
  "class":"4600699507406",
  "score":0.9982206225395203,
  "boxes":{
  "x_min":0.8886067271232605,
  "y_min":0.20344135165214539,
  "x_max":0.962311863899231,
  "y_max":0.48910853266716003
  }
  },
  {
    "id": "name_11",
  "class":"4690228029905",
  "score":0.9981833100318909,
  "boxes":{
  "x_min":0.8758243918418884,
  "y_min":0.6464205384254456,
  "x_max":0.9401987791061401,
  "y_max":0.9228938221931458
  }
  },
  {
    "id": "name_12",
  "class":"4605664000371",
  "score":0.9978383183479309,
  "boxes":{
  "x_min":0.30824121832847595,
  "y_min":0.6589096188545227,
  "x_max":0.37313133478164673,
  "y_max":0.8966140747070312
  }
  },
  {
    "id": "name_13",
  "class":"4690228026713",
  "score":0.9953746199607849,
  "boxes":{
  "x_min":0.941085934638977,
  "y_min":0.7255725860595703,
  "x_max":0.9998089671134949,
  "y_max":0.9223537445068359
  }
  },
  {
    "id": "name_14",
  "class":"4601201017659",
  "score":0.9943905472755432,
  "boxes":{
  "x_min":0.1143672987818718,
  "y_min":0.12682747840881348,
  "x_max":0.2888314723968506,
  "y_max":0.4783037304878235
  }
  },
  {
    "id": "name_15",
  "class":"4601201001412",
  "score":0.9921365976333618,
  "boxes":{
  "x_min":0.6760513186454773,
  "y_min":0.3623775541782379,
  "x_max":0.7645057439804077,
  "y_max":0.49097996950149536
  }
  },
  {
    "id": "name_16",
  "class":"4602541004170",
  "score":0.9842394590377808,
  "boxes":{
  "x_min":0.5795378088951111,
  "y_min":0.34317532181739807,
  "x_max":0.6484225392341614,
  "y_max":0.48629406094551086
  }
  },
  {
    "id": "name_17",
  "class":"4601201012739",
  "score":0.9548751711845398,
  "boxes":{
  "x_min":0.4710726737976074,
  "y_min":0.36573755741119385,
  "x_max":0.5480877757072449,
  "y_max":0.49079322814941406
  }
  },
  {
    "id": "name_18",
  "class":"4690228031168",
  "score":0.9417823553085327,
  "boxes":{
  "x_min":0.2185782790184021,
  "y_min":0.6294400095939636,
  "x_max":0.28203651309013367,
  "y_max":0.9129123091697693
  }
  },
  {
    "id": "name_19",
  "class":"4690228026690",
  "score":0.9389974474906921,
  "boxes":{
  "x_min":0.9582863450050354,
  "y_min":0.29091861844062805,
  "x_max":0.998138964176178,
  "y_max":0.493731290102005
  }
  },
  {
    "id": "name_20",
  "class":"4601201010865",
  "score":0.20678748190402985,
  "boxes":{
  "x_min":0.4736074209213257,
  "y_min":0.36448660492897034,
  "x_max":0.5513185262680054,
  "y_max":0.48733022809028625
  }
  }
  ]