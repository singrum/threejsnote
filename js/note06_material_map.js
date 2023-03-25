
import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
// https://polyhaven.com/


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
		camera.position.set(-3,2,3);
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
		const textureLoader = new THREE.TextureLoader();
		const map = textureLoader.load(
			"../img/uv_grid.jpg", texture => {
				texture.repeat.x = 1;
				texture.repeat.y = 1;
				texture.wrapS = THREE.ClampToEdgeWrapping;
				texture.wrapT = THREE.ClampToEdgeWrapping;
				texture.offset.x = 0;
				texture.offset.y = 0;
				texture.rotation = THREE.MathUtils.degToRad(0)
				texture.center.x = 0.5;
				texture.center.y = 0.5;
				texture.magFilter = THREE.NearestFilter;
				texture.minFilter = THREE.NearestMipMapLinearFilter;
			}
		)
		const material = new THREE.MeshStandardMaterial({
			map : map
		})

		const box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), material);
		box.position.set(-1,0,0);
		this._scene.add(box);

		const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32,32), material);
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