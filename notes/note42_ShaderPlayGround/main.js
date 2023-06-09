
import * as THREE from '../../node_modules/three/build/three.module.js';

import {OrbitControls} from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from '../../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from '../../node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from '../../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { Filter } from './pass.js';


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

		this.angle = 0;

		this.prevTime = performance.now()
		this.time = 0;
		this.torsion = 0;
		this._setupCamera();
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

		const filterPass = new ShaderPass( Filter );
		filterPass.uniforms.renderTex.value = this._composer.renderTarget1.texture;
		this._composer.addPass( filterPass);
		

		
        

		
    }
    _setupBackground(){
        this._scene.background = new THREE.Color(0xffff00);

    }
	_setupControls(){ 

	}

	_setupCamera() {
		const width = 400;
		
		const height = this._divContainer.clientHeight;
		const aspectRatio = window.innerWidth / window.innerHeight;
		const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
		
		camera.position.set(0,30,100)
		camera.zoom = 1.0
		// camera.zoom = 0.1
		camera.lookAt(0,0,0)
		this._camera = camera;
        this._scene.add(this._camera)
	}

	_setupLight() {
		
	}
	_setupModel() {
		
	}



	randRange(a,b){
		return Math.random() * (b - a) + a;
	}
	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		// this._camera.aspect = width / height;
		// this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
		this._composer.setSize(width, height);
		
	}

	render() {
		// this._renderer.render(this._scene, this._camera);
		this._composer.render()
		
		this.update();
		this.timeUpdate();
		requestAnimationFrame(this.render.bind(this));
	}

	timeUpdate(){
		const currentTime = performance.now();
		const deltaTime = (currentTime - this.prevTime) / 1000;
		this.prevTime = currentTime;
		this.time += deltaTime;
		
	}
	update() {
		
	}
	
}

window.onload = function () {
	new App();
};