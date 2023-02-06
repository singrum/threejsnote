import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {TextGeometry} from '../node_modules/three/examples/jsm/geometries/TextGeometry.js'
import {FontLoader} from '../node_modules/three/examples/jsm/loaders/FontLoader.js'

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
		const fontLoader = new FontLoader();
		async function loadFont(that){
			const url = '../node_modules/three/examples/fonts/helvetiker_regular.typeface.json';
			const font = await new Promise((resolve, reject) => {
				fontLoader.load(url,resolve, undefined, reject);
			});

			const geometry = new TextGeometry("Singrum", {
				font: font,
				size: 0.5,
				height : 0,
				curveSegments : 4,
				bevelEnabled: true,
				bevelThickness:0.1,
				bevelSize : 0.1,
				bevelSegments : 20
			});
			const fillMaterial = new THREE.MeshPhongMaterial({color:0x515151});
			const cube = new THREE.Mesh(geometry, fillMaterial);
			const lineMaterial = new THREE.LineBasicMaterial({color : 0xffff00});
			const line = new THREE.LineSegments(
				new THREE.WireframeGeometry(geometry), lineMaterial);
			const group = new THREE.Group();
			// group.position.x = - geometry.size / 2
			group.add(cube);
			// group.add(line);
			group.position.x = -1.3
			that._scene.add(group);
			that._cube = group;
		}
		loadFont(this)
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