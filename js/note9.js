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
		const groundGeometry = new THREE.PlaneGeometry(10,10);
		const groundMaterial = new THREE.MeshStandardMaterial({
			color: "#2c3e50",
			roughness: 0.5,
			metalness: 0.5,
			side: THREE.DoubleSide,
		});
		const ground = new THREE.Mesh(groundGeometry, groundMaterial);
		ground.rotation.x = THREE.MathUtils.degToRad(-90);
		this._scene.add(ground);

		const bigSphereGeometry = new THREE.SphereGeometry(1.5, 64,64,0,Math.PI);
		const bigSphereMaterial = new THREE.MeshStandardMaterial({
			color:"#ffffff",
			roughness:0.1,
			metalness:0.2,
		});
		const bigSphere = new THREE.Mesh(bigSphereGeometry,bigSphereMaterial);
		bigSphere.rotation.x = THREE.MathUtils.degToRad(-90);
		this._scene.add(bigSphere);

		const torusGeometry = new THREE.TorusGeometry(0.4, 0.1, 32,32);
		const torusMaterial = new THREE.MeshStandardMaterial({
			color: "#9b59b6",
			roughness: 0.5,
			metalness:0.9,
		})
		for(let i=0; i<8; i++){
			const torusPivot = new THREE.Object3D();
			const torus = new THREE.Mesh(torusGeometry, torusMaterial);
			torusPivot.rotation.y = THREE.MathUtils.degToRad(45*i);
			torus.position.set(3,0.5,0);
			this._scene.add(torusPivot)
		}


		const smallSphereGeometry = new THREE.SphereGeometry(0.3,32,32);
		const smallSphereMaterial = new THREE.MeshStandardMaterial({
			color: "#e74c3c",
			roughness: 0.2,
			metalness: 0.5,
		})
		const smallSpherePivot = new THREE.Object3D();
		const smallSphere = new THREE.Mesh(smallSphereGeometry, smallSphereMaterial);
		smallSpherePivot.add(smallSphere);
		smallSpherePivot.name = "smallSpherePivot";
		smallSphere.position.set(3,0.5,0);
		this._scene.add(smallSpherePivot)
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