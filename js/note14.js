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
		const geometry = new THREE.SphereBufferGeometry();

		const material1 = new THREE.MeshStandardMaterial({
			color: "#2ecc71",
			roughness: 0.3,
			metalness:0.9,
		})
		const material2 = new THREE.MeshStandardMaterial({
			color: "#e74c3c",
			roughness: 0.3,
			metalness: 0.9,
		})
		const rangeMin = -20.0, rangeMax = 20.0;
		const gap = 10.0;
		let flag = true;

		for(let x = rangeMin; x <= rangeMax; x += gap){
			for(let y = rangeMin; y<= rangeMax;y+= gap){
				for(let z = rangeMin * 10; z <= rangeMax; z += gap){
					flag = !flag;
					const mesh = new THREE.Mesh(geometry,
						flag ? material1 : material2);
					mesh.position.set(x,y,z)
					this._scene.add(mesh)
				}
			}
		}
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