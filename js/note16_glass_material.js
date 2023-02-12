import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {TeapotGeometry} from '../node_modules/three/examples/jsm/geometries/TeapotGeometry.js'

class App {
	constructor() {
		const divContainer = document.querySelector("#webgl_container");
		this._divContainer = divContainer;

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		
		divContainer.appendChild(renderer.domElement);
		this._renderer = renderer;
		renderer.setSize(window.innerWidth, window.innerHeight);
		const scene = new THREE.Scene();
		this._scene = scene;

		this._setupCamera();
		this._setupLight();
		// this._setupBackground();
		this._setupModel();
		this._setupControls();
		

		window.onresize = this.resize.bind(this);
		this.resize();

		requestAnimationFrame(this.render.bind(this));
	}

	_setupControls(){
		new OrbitControls(this._camera, this._divContainer);
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
		camera.position.set(0,10,10)
		this._camera = camera;
	}

	_setupLight() {
		this._scene.add(new THREE.AmbientLight(0xffffff, 0.2))


		const color = 0xffffff;
		const intensity = 5;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(-1, 2, 4);
		this._scene.add(light);
	}
	// _setupBackground(){
	// 	const loader = new THREE.TextureLoader();
	// 	loader.load("/data/background.jpg", texture => {
	// 		const renderTarget = new THREE.WebGLCubeRenderTarget(texture.image.height);
	// 		renderTarget.fromEquirectangularTexture(this._renderer, texture);
	// 		this._scene.background = renderTarget.texture
	// 	})
	// }
	_setupModel() {
		const teapotGeometry = new TeapotGeometry(0.7, 24);
		const teapotMaterial = new THREE.MeshPhysicalMaterial({
			color: 0xffffff,
			metalness: .1,
			roughness:0.05,
			ior: 2.5, // 1(진공) , 1.00029(공기), 1.4~1.7(유리), 2.419(다이아몬드)
			thickness: 0.2,
			transmission: 1,
			side: THREE.DoubleSide
		})
		const teapot = new THREE.Mesh(teapotGeometry, teapotMaterial);
		this._scene.add(teapot);
		this._teapot = teapot;
	}

	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
	}

	render(time) {

		

		this._renderer.render(this._scene, this._camera);
		this.update(time);
		requestAnimationFrame(this.render.bind(this));
	}

	update(time) {
		time *= 0.001;
		const torus = this._scene.getObjectByName("torus");
		if(torus){
			torus.rotation.x = Math.sin(time);
		}
	}
}

window.onload = function () {
	new App();
};