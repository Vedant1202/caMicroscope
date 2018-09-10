/** Class representing camicroscope core instance **/
class CaMic{
  /**
  * create a camic core instance
  * @param divId - the div id to inject openseadragon into
  * @param slideId - the id of the slide to load
  * @property slideId - the slide id
  * @property viewer - the OSD viewer object
  * @property draw - the drawing layer controls
  * @property layers - the layer controller
  */
  constructor(divId, slideId, options){
    // initalize viewer
    this.__default_opt = {
      id: divId,
      prefixUrl: "images/",
      //defaultZoomLevel:2.8793774319066148,
      constrainDuringPan:true,
      // -- navigator setting
      showNavigationControl:false,
      showNavigator: true,
      navigatorAutoFade: false,
      navigatorPosition: "BOTTOM_RIGHT",
      zoomPerClick: 1,
      animationTime: 0.1,
      maxZoomPixelRatio: 1,
      visibilityRatio: 1,
      springStiffness:0.0001,
      // maxZoomLevel:4,
      // minZoomLevel:.4,
      
      constrainDuringPan: true
    }
    extend(this.__default_opt, options);

    this.viewer = new OpenSeadragon.Viewer(this.__default_opt);
    // initialize layers
    //this.__draw;
    //this.__hover;

    this.slideId = slideId;
    // initalize store
    this.store = new Store();
    // load image
    // set overlay thing
    this.viewer.addOnceHandler('open',this.init.bind(this));
  }
  init(){
    this.viewer.controls.bottomright.style.zIndex = 600;
    
    this.viewer.addOnceHandler('tile-loaded', function(){
      $UI.message.add('Tile loaded');
      Loading.close();
      // set zoom and pan
      if(this.__default_opt.states){
        const states = this.__default_opt.states;
        var pt = new OpenSeadragon.Point(states.x, states.y);
        $CAMIC.viewer.viewport.zoomTo(states.z, pt);
        $CAMIC.viewer.viewport.panTo(pt, true);
        // TODO update zoom ctrl
      }
    }.bind(this));
    
    // create draw pulgin
    this.canvasDraw();
    this.overlayers({});
    // create style context menu for draw
    this.drawContextmenu = new StyleContextMenu(
      this.viewer.container, 
      {
        btns:this.__default_opt.draw.btns
      }
    );

    // add event to hook up 
    this.drawContextmenu.addHandler('style-changed',function(e){
      this.viewer.canvasDrawInstance.style = e.style;
    }.bind(this));

    this.drawContextmenu.addHandler('undo',function(e){
      this.viewer.canvasDrawInstance.undo();
    }.bind(this));

    this.drawContextmenu.addHandler('redo',function(e){
      this.viewer.canvasDrawInstance.redo();
    }.bind(this));

    this.drawContextmenu.addHandler('clear',function(e){
      if(this.viewer.canvasDrawInstance._draws_data_.length == 0) return;
      if(confirm("Do you want to clear all markups?")) this.viewer.canvasDrawInstance.clear();
    }.bind(this));

    this.drawContextmenu.addHandler('draw-mode-changed',function(e){
      this.viewer.canvasDrawInstance.drawMode = e.mode;
    }.bind(this));

    this.drawContextmenu.addHandler('draw',draw);


    // change navigator style
    const nav = this.viewer.element.querySelector('.navigator');
    nav.style.backgroundColor = '#365f9c';
    nav.style.opacity = 1;

    // zoom control
    // const zmax = this.viewer.viewport.getMaxZoom();
    // const zmin = this.viewer.viewport.getMinZoom();
    // const step = (zmax - zmin)/100;

    // this.zctrl = new CaZoomControl({
    //   'id':'zctrl',
    //   'viewer':this.viewer,
    //   'zoom':{
    //     'max':zmax,
    //     'min':zmin,
    //     'cur':zmax,
    //     'step':step
    //   }
    // });
    
    this.viewer.cazoomctrl({
      position:"BOTTOM_RIGHT",
      autoFade: false
    });
  }
  /**
  * Change which image is staged, used loadImg to load it.
  */
  setImg(slideId){
    this.layers.resetAll();
    this.slideId = slideId;
  }
  /**
  * Loads the staged image
  */
  loadImg(func){
    // loads current image
    this.store.findSlide(this.slideId)
      .then((x)=>{
        if(!x || !OpenSeadragon.isArray(x) || !x.length || !x[0].location){
          redirect($D.pages.table,`Can't find the slide information`);
          return;
        }

        this.viewer.open(x[0].location);
        // set scalebar
        this.scalebar(x[0].mpp)
        var imagingHelper = new OpenSeadragonImaging.ImagingHelper({
          viewer: this.viewer
        });
        imagingHelper.setMaxZoom(1);
        if(func && typeof func === 'function') func.call(null,x[0]);
        Loading.text.textContent = `loading slide's tiles...`;
        //func.call(null,x[0]);
      })
      .catch(e=>{
        Loading.close();
        $UI.message.addError('loadImg Error');
        console.error(e);

        if(func && typeof func === 'function') func.call(null,{hasError:true,message:e});
      })
  }
  canvasDraw(){
    this.viewer.canvasDraw();
  }

  overlayers(){
    this.viewer.overlaysManager();
  }
  /**
  * Set up a scalebar on the image
  * @param {number} mpp - microns per pixel of image
  */
  scalebar(mpp){
    try {
      this.viewer.scalebar({
              type: OpenSeadragon.ScalebarType.MAP,
              pixelsPerMeter: (1 / (parseFloat(mpp) * 0.000001)),
              xOffset: 5,
              yOffset: 10,
              stayInsideImage: true,
              color: "rgb(150,150,150)",
              fontColor: "rgb(100,100,100)",
              backgroundColor: "rgba(255,255,255,0.5)",
              barThickness: 2
          });
      } catch (ex) {
          console.log("scalebar err: ", ex.message);
      }
  }
}
