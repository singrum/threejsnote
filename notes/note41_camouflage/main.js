
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

		this.prevTime = performance.now()
		this.time = 0;
		this._setupCamera();
		// this._setupLight();
		this._setupModel();
		this._setupControls();
		this._setupBackground();
		// this._setupComposer();

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
		const fxaaPass = new ShaderPass(FXAAShader);
        
        fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
		// this._composer.addPass(fxaaPass);

		const filterPass = new ShaderPass( Filter );
		filterPass.uniforms.renderTex.value = this._composer.renderTarget1.texture;
		this._composer.addPass( filterPass);


		
        

		
    }
    _setupBackground(){
        this._scene.background = new THREE.Color(0x000000);

    }
	screenToPlane(point){
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
		console.log([interObj[0].uv.x, interObj[0].uv.y])
		return [interObj[0].uv.x, interObj[0].uv.y]
	}
	_setupControls(){ 
        // new OrbitControls(this._camera, this._divContainer);

        
        const touchstartEvent = evt=>{
			this.isTouch = true;
			this.currPoint = new THREE.Vector2(...this.screenToPlane([evt.clientX ?? evt.touches[0].clientX, evt.clientY ?? evt.touches[0].clientY]));
            if ('ontouchstart' in window){
            this._divContainer.addEventListener("touchmove", touchmoveEvent, false);
            
            }
            else{
            this._divContainer.addEventListener("mousemove", touchmoveEvent, false);
            }

            
			
        }

        const touchmoveEvent = evt=>{
			this.currPoint = new THREE.Vector2(...this.screenToPlane([evt.clientX ?? evt.touches[0].clientX, evt.clientY ?? evt.touches[0].clientY]));
        }
		const mouseUpEvent = ()=>{
            this.isTouch = false;
			if ('ontouchstart' in window){
                this._divContainer.removeEventListener("touchmove", touchmoveEvent, false);
                
            }
            else{
            	this._divContainer.removeEventListener("mousemove", touchmoveEvent, false);
            
            }

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
        const geom = new THREE.PlaneGeometry(2,2,128,128);
        const mate = new THREE.ShaderMaterial(Shader);
		const mesh = new THREE.Mesh(geom, mate)
		
		this._scene.add(mesh);
		this._plane =mesh;


		
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
		this._renderer.render(this._scene, this._camera);
		// this._composer.render()
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
		Shader.uniforms.iTime.value = this.time;
		
	}
	update() {
		if(this.isTouch === true){
			Shader.uniforms.center.value = this.currPoint;
		}
		else{
			
		}
		
	}
	
}

window.onload = function () {
	new App();
};