import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {TeapotGeometry} from '../node_modules/three/examples/jsm/geometries/TeapotGeometry.js'

import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from '../node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { Filter } from '../shader/EdgeDetectionfilter.js';
import { Filter1 } from '../shader/GaussianBlur1.js';
import { Filter2 } from '../shader/GaussianBlur2.js';


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

		this._setupCamera();
		this._setupBackground();
		this._setupLight();
		this._setupModel();
		this._setupControls();
        this._setupComposer();
		window.onresize = this.resize.bind(this);
		this.resize();

		requestAnimationFrame(this.render.bind(this));
	}
    gaussian(x, variance){
    
        const coefficient = 1 / Math.sqrt(2 * Math.PI * variance);
        const exponent = -(x ** 2) / (2 * variance);
        return coefficient * Math.exp(exponent);
    
    }
    _setupComposer(){
        this._composer = new EffectComposer( this._renderer );
        
        this._composer.setSize(window.innerWidth, window.innerHeight);

        const renderPass = new RenderPass(this._scene, this._camera);
        let weight = Array(5);
        weight[0] = this.gaussian(0, 10);
        
        let sum = weight[0];
        for(let i = 1; i<5; i ++){
            weight[i] = this.gaussian(i, 10);
            sum += 2 * weight[i];
        }
        for(let i=0; i<5; i++){
            weight[i] /= sum;
        }        
        console.log(weight)
        Filter1.uniforms.Weight.value = weight;
        Filter2.uniforms.Weight.value = weight;
        
        
		this._composer.addPass(renderPass);

		const filterPass1 = new ShaderPass( Filter1 );
		filterPass1.uniforms.renderTex.value = this._composer.renderTarget1.texture;
		this._composer.addPass( filterPass1 );


        const filterPass2 = new ShaderPass( Filter2 );
		filterPass2.uniforms.renderTex.value = this._composer.renderTarget2.texture;
		this._composer.addPass( filterPass2 );
		
        

    }
	_setupBackground(){
		this._scene.background = new THREE.Color(0x666666)
	}
	_setupControls(){
		new OrbitControls(this._camera, this._divContainer);
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
		camera.position.set(10,10,30);
		this._camera = camera;
	}

	_setupLight() {
		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(20,5,20);
		this._scene.add(light);
	}

	_setupModel() {
		const geometry = new THREE.TorusGeometry(5,2,32,32)
		const customMaterial = new THREE.MeshPhongMaterial({color : 0x88ff00});
		const mesh = new THREE.Mesh(geometry, customMaterial);
        mesh.position.set(0,3.5,0);

        const planeGeom = new THREE.PlaneGeometry(20,20);
        const plane = new THREE.Mesh(planeGeom, customMaterial);
        plane.rotation.set(-Math.PI/2,0,0)

		this._scene.add(mesh,plane);
	}

	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();
        this._renderer.setSize(width, height);
		this._composer.setSize(width, height);
	}

	render() {
		// this._renderer.render(this._scene, this._camera);
        this._composer.render()
		this.update();
		requestAnimationFrame(this.render.bind(this));
	}

	update() {
	}
}

window.onload = function () {
	new App();
};
