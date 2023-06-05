
import * as THREE from '../../node_modules/three/build/three.module.js';

import {OrbitControls} from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from '../../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from '../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from '../../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { Filter } from './pass.js';
import {Shader} from './shader.js'


// https://sketchfab.com



class App {
	constructor() {
		const divContainer = document.querySelector("#webgl_container");
		this._divContainer = divContainer;

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		
		divContainer.appendChild(renderer.domElement);
		this._renderer = renderer;
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio( window.devicePixelRatio );
		const scene = new THREE.Scene();
		this._scene = scene;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		this.angle = 0;
		this.isTouch = false;
		this.duration = 0;

		this.prevTime = performance.now()
		this.time = 0;

		this.camoData = [];

		this._setupCamera();
		// this._setupLight();
		// this._setupModel();
		this._setupControls();
		this._setupBackground();
		this._setupComposer();

		window.onresize = this.resize.bind(this);
		this.resize();
		
		this.prevTime = performance.now();
		requestAnimationFrame(this.render.bind(this));
	}

	_setupComposer(){
        this._composer = new EffectComposer( this._renderer );
        
        this._composer.setSize(window.innerWidth, window.innerHeight);
		this._composer.setPixelRatio( window.devicePixelRatio )
        const renderPass = new RenderPass(this._scene, this._camera);
		this._composer.addPass(renderPass);


		this.pixelDiv = 32;
		
		



		const filterPass = new ShaderPass( Filter );
		
		this._composer.addPass( filterPass);


		
        

		
    }
    _setupBackground(){
        this._scene.background = new THREE.Color(0x000000);

    }

	_setupControls(){ 
        // new OrbitControls(this._camera, this._divContainer);
		const screenToPlane = point => {
			const raycaster = new THREE.Raycaster();
			
			const pt = {
				x: (point[0] / this._divContainer.clientWidth) * 2 - 1,
				y: - (point[1] / this._divContainer.clientHeight) * 2 + 1
			}
			raycaster.setFromCamera(pt, this._camera)
			const interObj = raycaster.intersectObject(this._plane)
			if(interObj.length === 0){
				return;
			}
			
			return [Math.round(interObj[0].uv.x * this.pixelDiv) / this.pixelDiv, Math.round(interObj[0].uv.y * this.pixelDiv) / this.pixelDiv]
		}
		const getPlaneCoord = evt => {
			return [evt.clientX ?? evt.touches[0].clientX, evt.clientY ?? evt.touches[0].clientY]
		}
        
        const touchstartEvent = evt=>{
			this.isTouch = true;
			this.isSameCoord = true;
			this.duration = 0;
			this.currCoord = screenToPlane(getPlaneCoord(evt));
			Filter.uniforms.center.value = new THREE.Vector2(...this.currCoord);



            if ('ontouchstart' in window){
            this._divContainer.addEventListener("touchmove", touchmoveEvent, false);
            
            }
            else{
            this._divContainer.addEventListener("mousemove", touchmoveEvent, false);
            }


            
			
        }

        const touchmoveEvent = evt=>{
			function areArraysEqual(array1, array2) {
				return array1[0] === array2[0] && array1[1] === array2[1];
			}
			const newCoord = screenToPlane(getPlaneCoord(evt));
			if(areArraysEqual(this.currCoord, newCoord)){
				this.isSameCoord = true;
				return;
			}
			this.isSameCoord = false;
			this.camoData.push(
				{
					pos : this.currCoord,
					duration : this.duration
				}
			)

			this.currCoord = newCoord;
			this.duration = 0;
			Filter.uniforms.center.value = new THREE.Vector2(...this.currCoord);

        }
		const mouseUpEvent = ()=>{
			this.isSameCoord = false;
			this.camoData.push(
				{
					pos : this.currCoord,
					duration : this.duration
				}
			)
			this.duration = 0;




            if ('ontouchstart' in window){
				this._divContainer.removeEventListener("touchmove", touchmoveEvent, false);
				
				}
				else{
				this._divContainer.removeEventListener("mousemove", touchmoveEvent, false);
			}
			console.log(this.camoData)
        }


		if ('ontouchstart' in window){
			this._divContainer.addEventListener("touchstart", touchstartEvent, false);
			this._divContainer.addEventListener("touchend", mouseUpEvent, false);
		}
		else{
			this._divContainer.addEventListener("mousedown", touchstartEvent, false);
			this._divContainer.addEventListener("mouseup", mouseUpEvent, false);
		}




	}

	_setupCamera() {
		const width = 400;
		const aspectRatio = window.innerWidth / window.innerHeight;
		const camera = new THREE.OrthographicCamera( -aspectRatio * width / 2, aspectRatio * width / 2, width / 2, -width /2, 0.1, 100 );
		
		camera.position.set(0,0,10)
		camera.zoom = 100.0
		camera.lookAt(0,0,0)
		this._camera = camera;
        this._scene.add(this._camera)
	}


	debugPoint(x,y,z){
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute([x,y,z], 3)
		);

		const material = new THREE.PointsMaterial({
			color:0xff38a2,
			size: 5,
			sizeAttenuation : false
		})
		const points = new THREE.Points(geometry, material);
		this._scene.add(points)
	}
	_setupModel() {



		
	}



	randRange(a,b){
		return Math.random() * (b - a) + a;
	}
	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
	}

	render() {
		// this._renderer.render(this._scene, this._camera);
		this._composer.render()
		this.update();
		this.timeUpdate();
		this.colorUpdate();
		requestAnimationFrame(this.render.bind(this));
	}

	colorUpdate(){
			
	}
	timeUpdate(){
		const currentTime = performance.now();
		const deltaTime = (currentTime - this.prevTime) / 1000;
		this.prevTime = currentTime;
		this.time += deltaTime;
		if(this.isSameCoord){
			this.duration += deltaTime;
			
		}
		console.log(this.duaration)
		Filter.uniforms.iTime.value = this.time;
		Filter.uniforms.duration.value = this.duration;
		
	}
	update() {
		
		
	}
	
}

window.onload = function () {
	new App();
};