import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPixelatedPass.js';


class App {
	constructor() {
		const divContainer = document.querySelector("#webgl_container");
		this._divContainer = divContainer;

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.shadowMap.enabled = true;




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



		const composer = new EffectComposer( renderer );
		const renderPixelatedPass = new RenderPixelatedPass( 6, this._scene, this._camera );
		composer.addPass( renderPixelatedPass );
		this._composer = composer


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
		const geometry = new THREE.TorusGeometry( 0.6, 0.3, 16,30 );
		const material = new THREE.MeshPhongMaterial({ color: 0x44a88 });
		const cube = new THREE.Mesh(geometry, material);
		console.log(geometry)
		const lineMaterial = new THREE.LineBasicMaterial({color : 0xffff00});
		const line = new THREE.LineSegments(
			new THREE.WireframeGeometry(geometry), lineMaterial)
		
		const group = new THREE.Group();
		group.add(cube);
		group.add(line);


		this._scene.add(group);
		this._cube = cube;
	}

	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
		this._composer.setSize( window.innerWidth, window.innerHeight );

	}

	render(time) {
		this._composer.render();
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