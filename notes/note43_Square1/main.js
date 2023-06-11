
import * as THREE from '../../node_modules/three/build/three.module.js';

import {OrbitControls} from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from '../../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
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
		this._setupModel();
		this._setupControls();
		this._setupBackground();
		

		window.onresize = this.resize.bind(this);
		this.resize();
		
		this.prevTime = performance.now();
		requestAnimationFrame(this.render.bind(this));
	}

    _setupBackground(){
        this._scene.background = new THREE.Color(0x000000);

    }

	_setupControls(){ 
        // new OrbitControls(this._camera, this._divContainer);

        const moveEvent = e=>{
			this.pointerX = -window.innerWidth / 2 + e.clientX ?? e.touches[0].clientX;
			this.pointerY = window.innerHeight /2 - e.clientY ?? e.touches[0].clientY;
			console.log(this.pointerY)
        }


		if ('ontouchstart' in window){
			this._divContainer.addEventListener("touchmove",moveEvent, false);
		}
		else{
			this._divContainer.addEventListener("mousemove",moveEvent, false);
			
		}




	}

	_setupCamera() {
		const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.001, 1000);
		
		camera.position.set(0,0,2)
		
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
		this.len = 1;
		this.segNum = 10;
		this.unit = this.len / this.segNum;
		this.pointerX = 1;
		this.pointerY = 1;
		Shader.uniforms.pointer.value = new THREE.Vector2(this.pointerX, this.pointerY);
		
		Shader.uniforms.unit.value = this.unit;
		Shader.uniforms.damping.value = 0.01;
		
		
		const squareGeom = new THREE.PlaneGeometry(this.len, this.len);
		const squareMate = new THREE.ShaderMaterial(Shader);
		const square = new THREE.Mesh(squareGeom, squareMate);
		this._scene.add(square);
		
		
		
		

		
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
		
	}
	update() {
		Shader.uniforms.pointer.value.set(this.pointerX, this.pointerY)
		
	}
	
}

window.onload = function () {
	new App();
};