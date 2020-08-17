function LabelsViewer(options) {
    
    this.className = 'LabelsViewer';
    this.setting = {
    // id: doc element
    // data: labels dataset
    };
    this.view;
    this.addBtn;
    this.searchBar; // input and btn
    this.searchList;
    this.allLabels;
    this.labelsGrid;
    this.isNewLabel = true;
    this.__editLabelElt;

    this.editor;
    this.saveBtn;
    this.backBtn;
    this.clearBtn;
    this.nameZone;
    this.colorZone;
    this.modeZone;
    this.sizeZone;
    this.keyZone;


    // onAdd()
    // onRemove(labels)
    // onUpdate(labels)
    // onSelected()
    // setting dataset
    extend(this.setting, options);
    this.elt = document.getElementById(this.setting.id);
    if (!this.elt) {
    console.error(`${this.className}: No Main Elements...`);
    return;
    }
    this.elt.classList.add('labels-container');

    this.__refreshUI();
}
LabelsViewer.prototype.__clearUI = function() {
    empty(this.elt);
    
    this.view = null;
    this.addBtn = null;
    this.searchBar = null;
    this.searchList = null;
    this.allLabels = null;
    this.labelsGrid = null;
    this.__editLabelElt = null;

    this.editor = null;
    this.saveBtn = null;
    this.backBtn = null;
    this.cleanBtn = null;
    this.nameZone = null;
    this.colorZone = null;
    this.modeZone = null;
    this.sizeZone = null;
    this.keyZone = null;

    this.isNewLabel = true;
  };
LabelsViewer.prototype.__refreshUI = function() {
    this.__clearUI();
    //
    this.view = document.createElement('div');
    this.view.classList.add('labels-viewer')
    const view_html = `
        <button class='btn btn-info'>Add Labels</button>
        <div class='searchbar'>
            <input type='text' placeholder='Search By Label Name'/>
            <div class='material-icons'>find_in_page</div>
        </div>

        <div class='checklist'>
            <label>  Point  <input type='checkbox' value='point' checked/></label>
            <label>  Brush  <input type='checkbox' value='grid' checked/></label>
            <label>  Pen  <input type='checkbox' value='free' checked/></label>
        </div>
        <div class='labels-grid'>
            ${this.__createLables(this.setting.data)}
        </div>`
    this.view.innerHTML = view_html;
    this.elt.append(this.view);

    this.labelsGrid = this.view.querySelector('.labels-grid')
    this.addBtn = this.view.querySelector('button')
    this.searchBar = {
        text:this.view.querySelector('.searchbar input[type=text]'),
        btn:this.view.querySelector('.searchbar .material-icons')
    }
    this.searchList = this.view.querySelector('.checklist')
    this.allLabels = [...this.view.querySelectorAll('.labels-grid > .labels')]
    if(this.allLabels&&this.allLabels.length>0) {
        this.allLabels[0].classList.add('selected')
    }
    // EVENTS
    
    // search
    this.searchBar.btn.addEventListener('click', this.__searchHandler.bind(this));
    this.searchBar.text.addEventListener('change', this.__searchHandler.bind(this));
    this.searchBar.text.addEventListener('keyup', this.__searchHandler.bind(this));

    [...this.searchList.querySelectorAll('input[type=checkbox]')].forEach(chk=>chk.addEventListener('change',e=>{this.__search(this.searchBar.text.value)}))

    // selected
    this.allLabels.forEach(elt=>elt.addEventListener('click',e=>{
        const elt = e.currentTarget;
        this.selectLabel(elt);
    }))

    // add label
    this.addBtn.addEventListener('click',e=>{
        this.__switch('editor')
        this.isNewLabel = true;
        this.__editLabelElt = null;
        this.setLabelsEditorValue()
        this.__validEditor()
    })

    // edit and remove label
    this.allLabels.forEach(elt=>{
        elt.querySelector('.material-icons.edit').addEventListener('click',this.__editLabelsHandler.bind(this))
        elt.querySelector('.material-icons.remove').addEventListener('click',this.__removeLabelsHandler.bind(this))
    },this)

    // -- create editor -- //
    this.editor = document.createElement('div');
    this.editor.classList.add('labels-editor')
    this.editor.style.display = 'none'
    const editor_html = `
    <label>Label Name <span style='color:#ff0000;font-size:12px;'></span></label> <input type='text' placeholder='Enter Label Name'/>
    <div></div>
    <label>Color (#RRGGBB)<span style='border:2px black solid;'>color</span></label><input type='text' />
    <div></div>
    
    <label>Shape</label> 
    <select>
        <option value="free">Polygen</option>
        <option value="point">Point</option>
        <option value="grid">Brush</option>
    </select>
    <div></div>

    <label>Size (px) <span style='color:#ff0000;font-size:12px;'></span></label><input type='number' placeholder='Integer Only'/>
    <div class='size-after'></div>

    <label>Shortcut <span style='color:#ff0000;font-size:12px;'></span></label><div><span>Ctrl + </span><input type='text' placeholder='Number Or Alphabet'/></div>
    <div class='btn-group' style='display:flex;justify-content:center;'>
        <button class='btn btn-primary'>Back</button>
        <button class='btn btn-primary'>Clean</button>
        <button class='btn btn-primary' disabled>Save</button>
    </div>
    `



    this.editor.innerHTML = editor_html;
    const labels_text = this.editor.querySelectorAll('label');
    const labels_input = this.editor.querySelectorAll('input');
    this.nameZone = {
        label:labels_text[0],
        text:labels_input[0],
        error:labels_text[0].querySelector('span')
    };
    // color pick zone
    this.colorZone = {
        label:labels_text[1],
        text:labels_input[1],
        span:labels_text[1].querySelector('span'),
        cpr: new CP(labels_input[1])
    };

    // create a static color picker
    this.colorZone.cpr.on('change', color=>{
        labels_input[1].value = '#' + color;
        labels_text[1].querySelector('span').style.color = '#' + color;
        labels_text[1].querySelector('span').style.background = '#' + color;
    });

    const update = () => {
        this.colorZone.cpr.set(labels_input[1].value).enter()
        labels_text[1].querySelector('span').style.color = labels_input[1].value;
        labels_text[1].querySelector('span').style.background = labels_input[1].value;
    }
    this.colorZone.cpr.target.oncut = update;
    this.colorZone.cpr.target.onpaste = update;
    this.colorZone.cpr.target.onkeyup = update;
    this.colorZone.cpr.target.oninput = update;    

    // Add a `is-static` class to the color picker panel
    // this.colorZone.cpr.self.classList.add('is-static');

    // Put color picker panel to the second `<p>` element
    //this.colorZone.cpr.enter(this.editor.querySelector('div')[1]);


    this.modeZone = {
        label:labels_text[2],
        text:this.editor.querySelector('select')
    }
    this.sizeZone = {
        label:labels_text[3],
        text:labels_input[2],
        error:labels_text[3].querySelector('span')
    };
    this.keyZone = {
        label:labels_text[4],
        text:labels_input[3],
        error:labels_text[4].querySelector('span')       
    }
    const btns = this.editor.querySelectorAll('.btn-group .btn')
    this.backBtn = btns[0];
    this.cleanBtn = btns[1];
    this.saveBtn = btns[2];
    this.elt.append(this.editor);
    this.toggleSizeZone(false);

    // events for editor
    
    this.modeZone.text.addEventListener('change',e=>{
        if(this.modeZone.text.value=='grid') {
            this.toggleSizeZone(true)
        }else{
            this.toggleSizeZone(false)
        }
    })

    // check label name
    this.nameZone.text.addEventListener('change',e=>this.__validEditor())
    this.nameZone.text.addEventListener('blur',e=>this.__validEditor())
    this.nameZone.text.addEventListener('keyup',e=>this.__validEditor())

    this.sizeZone.text.addEventListener('change',e=>this.__validEditor())
    this.sizeZone.text.addEventListener('blur',e=>this.__validEditor())
    this.sizeZone.text.addEventListener('keyup',e=>this.__validEditor())


    this.keyZone.text.addEventListener('blur',e=>this.__validEditor())


    var __key='';
    var __preKey='';
    this.keyZone.text.addEventListener('keydown',e=>__key = e.key)
    this.keyZone.text.addEventListener('keyup',e=>{
        var regex = new RegExp('^[A-Za-z0-9]$');
        if(__key == e.key && regex.test(e.key)){
            this.keyZone.text.value = e.key.toLocaleLowerCase();
            __preKey = e.key;
        }else{
            this.keyZone.text.value = __preKey.toLocaleLowerCase();
        }
        this.__validEditor()
    })


    // check on shortcut

    // check on size

    //this.saveBtn.addEventListener('click', e=>{
        // const rs0 = $CAMIC.store.addPresetLabels({
        //     "color":"#ff00ff",
        //     "mode":"grid",
        //     "type":"Tumor-Test3",
        //     "size":100,
        //     "key":"a"       
        // }).then(res=>res.json())
        // console.log(rs0)

        // const rs1 = $CAMIC.store.updatePresetLabels('aaa',{
        //     "color":"#0066ff",
        //     "mode":"point",
        //     "type":"Tumor-NoPoint",
        //     "key":"x"
        // })
        // console.log(rs1)

        // const rs2 = $CAMIC.store.removePresetLabels('o').then(res=>res.json())
        // console.log(rs2)    
    //})
    this.backBtn.addEventListener('click', ()=>this.__switch('view'))
    this.cleanBtn.addEventListener('click', ()=>{this.cleanLabelsEditorValue();this.__validEditor()})
    this.saveBtn.addEventListener('click', this.__saveBtnHandler.bind(this))


}
LabelsViewer.prototype.__saveBtnHandler = function(e){
    const labels = this.getLabelsEditorValue()
    if(this.isNewLabel){ // new 
        if(isFunction(this.setting.onAdd)) this.setting.onAdd(labels)
    }else{ // edit
        console.log(labels, e.currentTarget)
        if(isFunction(this.setting.onEdit)) this.setting.onEdit(this.__editLabelElt,labels)
    }
    this.__switch('view')

}
LabelsViewer.prototype.setLabels = function(elt,labels){
    const key = elt.dataset.key;
    const _i = this.setting.data.findIndex(d=>d.key==key);
    if(_i!=-1) this.setting.data[_i]= {...labels}
    // set data
    //this.__editLabelElt.dataset = {...labels}
    this.__editLabelElt.setAttribute("data-type", labels.type);
    this.__editLabelElt.setAttribute("data-color", labels.color);
    this.__editLabelElt.setAttribute("data-mode", labels.mode);

    if(labels.mode == 'grid')
        this.__editLabelElt.setAttribute("data-size", labels.size);
    else
        this.__editLabelElt.removeAttribute("data-size");
    
    this.__editLabelElt.setAttribute("data-key", labels.key);
    const divs = this.__editLabelElt.querySelectorAll('div');
    // set color
    divs[0].textContent = labels.color
    divs[0].style.color = labels.color
    divs[0].style.background = labels.color
    // set name
    divs[1].textContent = labels.type
    // set other
    divs[2].innerHTML = `${labels.size ?
        `${labels.mode=='grid'?'BRUSH':labels.mode.toUpperCase()} ${labels.size}px`
        :`${labels.mode=='grid'?'BRUSH':labels.mode.toUpperCase()}`
    }<br>Ctrl + ${labels.key}`

}
LabelsViewer.prototype.selectLabel = function(elt){
    this.allLabels.forEach(label=>label.classList.remove('selected'))
    elt.classList.add('selected')
    const labels = this.getSelectedLabels()
    if(isFunction(this.setting.onSelected)) this.setting.onSelected(labels)
} 
LabelsViewer.prototype.__searchHandler = function(e){
     const text = e.target.value;
     this.__search(text);
}
/**
 * @private
 * search event
 * @param  {[type]} e [description]
 */
LabelsViewer.prototype.__search = function(pattern) {
    this.allLabels.forEach(elt=>elt.style.display = '')

    //const pattern = e.target.value;
    const regex = new RegExp(pattern, 'gi');
    
    const checked_type = [...$UI.labelsViewer.searchList.querySelectorAll('input:checked')].map(elt=>elt.value)

    this.allLabels.forEach(elt => {
      if(!elt.dataset.type.match(regex)) {
        elt.style.display = 'none';
      }
      if(!checked_type.includes(elt.dataset.mode)) {
        elt.style.display = 'none';
      }
    });
  };

LabelsViewer.prototype.__createLables = function(data){
    if(data&&Array.isArray(data)&&data.length>0){
        return data.map(d=>this.__createLabelsCard({...d})).join('')
    }else{
        return `<div class='empty'>No Labels, Please Add One.</div>`
    }
}
LabelsViewer.prototype.__createLabelsCard = function ({type, color, mode, size, key, selected}) {
    return `
    <div class="labels" data-type="${type}" data-key="${key}" data-color="${color}" data-mode="${mode}" ${size?`data-size="${size}"`:""} >
        <div style="border-radius:2px;border:1px #808080 solid;color:${color};background:${color}">${color}</div>
        <div class="labels-title">${type}</div>
        <div class="labels-description">
            ${size?`${mode=='grid'?'BRUSH':mode.toUpperCase()} ${size}px`:`${mode=='grid'?'BRUSH':mode.toUpperCase()}`}<br>
            Ctrl + ${key}
        </div>
        <div class="material-icons edit" title="Edit">short_text</div>
        <div class="material-icons remove" title="Delete">clear</div>
    </div>`
}

LabelsViewer.prototype.__switch = function(target) {
    if(target=='view'){
        this.view.style.display =''
        this.editor.style.display ='none'
    } else {
        this.view.style.display ='none'
        this.editor.style.display =''
    }
}
LabelsViewer.prototype.toggleSizeZone = function(isShow){
    if(isShow) {
        this.sizeZone.label.style.display='';
        this.sizeZone.text.style.display='';
        this.editor.querySelector('.size-after').style.display='';
    }else {
        this.sizeZone.label.style.display='none';
        this.sizeZone.text.style.display='none';
        this.editor.querySelector('.size-after').style.display='none';
    }
}
LabelsViewer.prototype.getLabelsEditorValue = function (){
    const labels = {
        type:this.nameZone.text.value,
        color:this.colorZone.text.value,
        mode:this.modeZone.text.value,
        key:this.keyZone.text.value
    }
    if(labels.mode=='grid') labels.size = this.sizeZone.text.value;
    return labels;
}


LabelsViewer.prototype.setLabelsEditorValue = function(labels){
    this.cleanLabelsEditorValue()
    if(labels){
        this.nameZone.text.value = labels.type;
        this.nameZone.error.textContent = '';
        this.colorZone.text.value = labels.color;
        this.colorZone.cpr.set(labels.color);
        this.colorZone.label.querySelector('span').style.color = labels.color;
        this.colorZone.label.querySelector('span').style.background = labels.color;
        this.modeZone.text.value = labels.mode;
        if(labels.mode == 'grid')
            this.toggleSizeZone(true)
        else
            this.toggleSizeZone(false)
        this.sizeZone.text.value = labels.size;
        this.sizeZone.error.textContent = '';
        this.keyZone.text.value = labels.key;
        this.keyZone.error.textContent = '';
    }
}


LabelsViewer.prototype.cleanLabelsEditorValue = function(){
    this.nameZone.text.value = null;
    this.nameZone.error.textContent = '';
    this.colorZone.text.value = '#ff0000';
    this.colorZone.label.querySelector('span').style.color = this.colorZone.text.value;
    this.colorZone.label.querySelector('span').style.background = this.colorZone.text.value;
    this.colorZone.cpr.set(this.colorZone.text.value);
    this.modeZone.text.value = 'free';
    this.toggleSizeZone(false)
    this.sizeZone.text.value = 250;
    this.sizeZone.error.textContent = '';
    this.keyZone.text.value = null;
    this.keyZone.error.textContent = '';

}
LabelsViewer.prototype.updateEditor = function(label){
    

}
LabelsViewer.prototype.addLabel = function(label){
    
    const new_labels = this.__createElementFromHTML(this.__createLabelsCard(label))
    this.setting.data.unshift(label);
    this.allLabels.unshift(new_labels)
    this.labelsGrid.prepend(new_labels)
    const empty  = this.labelsGrid.querySelector('.empty');
    if(empty) {
        empty.remove();
        new_labels.classList.add('selected');
        const labels = this.getSelectedLabels()
        if(isFunction(this.setting.onSelected)) this.setting.onSelected(labels)

    }

    // event TODO
    this.__addAllEventsForLabels(new_labels)
    return new_labels;
}

LabelsViewer.prototype.__addAllEventsForLabels = function(labels){
    labels.addEventListener('click',e=>{
        const elt = e.currentTarget;
        this.selectLabel(elt)
    })
    const _remove = labels.querySelector('.material-icons.remove')
    _remove.addEventListener('click', this.__removeLabelsHandler.bind(this))
    const _edit = labels.querySelector('.material-icons.edit')
    _edit.addEventListener('click', this.__editLabelsHandler.bind(this))
}


LabelsViewer.prototype.__editLabelsHandler = function(e){
    e.preventDefault()
    e.stopPropagation()
    this.__editLabelElt = e.currentTarget.parentElement;
    const labels = {...this.__editLabelElt.dataset}
    this.__switch('editor')
    this.isNewLabel = false;
    this.setLabelsEditorValue(labels);
    this.__validEditor()
    // get all labels data
}
LabelsViewer.prototype.__removeLabelsHandler = function(e){
    e.preventDefault()
    e.stopPropagation()
    console.log('remove')
    const elt = e.currentTarget.parentElement;
    const labels = {...elt.dataset}
    if(!confirm(`Do You Want To Delete "${labels.type}" label?`)) return;
    if(isFunction(this.setting.onRemove)) this.setting.onRemove(elt,labels);
    // get all labels data
}
LabelsViewer.prototype.editLabel = function(label){
    
}

LabelsViewer.prototype.removeLabel = function(key){

    const _i = this.setting.data.findIndex(d=>d.key==key);
    if(_i!=-1) this.setting.data.splice(_i,1);

    const _idx =this.allLabels.findIndex(d=>d.dataset.key==key);
    this.allLabels[_idx].remove();
    if(_i!=-1) this.allLabels.splice(_i,1);

    // this.allLabels
    const labels = $UI.labelsViewer.labelsGrid.querySelector('.labels');
    // no labels
    if(!labels) {
        $UI.labelsViewer.labelsGrid.innerHTML = `<div class='empty'>No Labels, Please Add One.</div>`
        const labels = this.getSelectedLabels()
        if(isFunction(this.setting.onSelected)) this.setting.onSelected(labels)    
        return;
    }
    const selectedLabels = $UI.labelsViewer.labelsGrid.querySelector('.labels.selected');
    // no seleted labels selected the first labels 
    if(!selectedLabels){
        this.allLabels[0].classList.add('selected');
        const labels = this.getSelectedLabels()
        if(isFunction(this.setting.onSelected)) this.setting.onSelected(labels)
    }

}

LabelsViewer.prototype.__nameValid = function(){
    //var regex = new RegExp('^\\d+$');
    if(this.nameZone.text.value!==''){
        //this.nameZone.text.value = null;
        this.nameZone.error.textContent = '';
        return true;
    }else{
        this.nameZone.error.textContent = 'Enter Label Name';
        return false;
    }
}
LabelsViewer.prototype.__sizeValid = function(){
    var regex = new RegExp('^\\d+$');
    if(regex.test(this.sizeZone.text.value)){
        this.sizeZone.error.textContent = '';
        return true;
    }else{
        this.sizeZone.text.value = null;
        this.sizeZone.error.textContent = 'Enter Integer Only';
        return false;
    }
}
LabelsViewer.prototype.__keyValid = function(){
    var regex = new RegExp('^[A-z0-9]$');
    if(regex.test(this.keyZone.text.value)){
        const keys = ["a","m","r","s",...this.setting.data.map(d=>d.key)];
        if(this.__editLabelElt) {
            const _i = keys.findIndex(d=>d==this.__editLabelElt.dataset.key);
            if(_i!=-1) keys.splice(_i,1)
        }
        if(keys.includes(this.keyZone.text.value)){
            this.keyZone.error.textContent = `Key '${this.keyZone.text.value}' Has Been Used`;
            return false;
        }
        this.keyZone.error.textContent = '';
        return true;
    }else{
        this.keyZone.text.value = null;
        this.keyZone.error.textContent = 'Number And Alphabet Only';
        return false;
    }
}

LabelsViewer.prototype.__validEditor = function(){
    var isValid = true;
    if(!this.__nameValid()){
       //error 
       isValid = false;
    }

    if(this.modeZone.text.value=='grid'&&(!this.__sizeValid())){
        // error
        isValid = false;
    }

    if(!this.__keyValid()){
        // error
        isValid = false;
    }
    if(isValid)
        this.saveBtn.disabled = false;
    else
        this.saveBtn.disabled = true;
}
LabelsViewer.prototype.getSelectedLabels = function(){
    const labels = this.labelsGrid.querySelector('.labels.selected')
    if(labels){
        return {...labels.dataset}
    }else{
        return null;
    }
}
LabelsViewer.prototype.__createElementFromHTML= function(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild; 
  }





// 
//`^[A-Za-z0-9]$`;



