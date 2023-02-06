import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

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
		this._setupModel();
		this._setupControls()

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
		camera.position.z = 2;
		camera.position.x = -2;
		this._camera = camera;
	}

	_setupLight() {
		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(-1, 2, 4);
		this._scene.add(light);
	}

	_setupModel() {
		const material1 = new THREE.MeshBasicMaterial({
			visible: true,
			transparent: true,
			opacity:0.5,
			depthTest:true,
			depthWrite:true,
			side: THREE.FrontSide,
			color:0xffff00,
			wireframe:false
		})


		const material2 = new THREE.MeshLambertMaterial({
			transparent: true,
			opacity:0.5,
			side: THREE.DoubleSide,
			color:0xffff00,
			emissive: 0xff0000,
			wireframe:false
		})

		const box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), material2);
		box.position.set(-1,0,0);
		this._scene.add(box);

		const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32,32), material2);
		sphere.position.set(1,0,0);
		this._scene.add(sphere);
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
		// this._cube.rotation.x = time;
		// this._cube.rotation.y = time;
	}
}

window.onload = function () {
	new App();
};