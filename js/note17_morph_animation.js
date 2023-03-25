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
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.set(0,-20,20)
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
		// 평면

		// const geometry = new THREE.PlaneGeometry(20,20, 300,300);
		// this._geometry = geometry;
		// const material = new THREE.MeshPhysicalMaterial({color: 0xffff00});
		// const plane = new THREE.Mesh(geometry, material);
		// this._scene.add(plane)
		// this._count = geometry.attributes.position.count;

		// 구
		const geometry = new THREE.SphereGeometry(10, 128,128);
		this._geometry = geometry;
		const material = new THREE.MeshPhysicalMaterial({color: 0xffff00, emissive: 0xff});
		const sphere = new THREE.Mesh(geometry, material);
		this._scene.add(sphere)
		this._count = geometry.attributes.position.count;

		this._positionClone = JSON.parse(
			JSON.stringify(geometry.attributes.position.array)
		)
		this._normalsClone = JSON.parse(
			JSON.stringify(geometry.attributes.normal.array)
		)


	
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
		time *= 0.005;
		// 평면

		// for(let i = 0; i < this._count; i++){
		// 	const x = this._geometry.attributes.position.getX(i);
		// 	const y = this._geometry.attributes.position.getY(i);
		// 	const xsin = Math.sin(x+time);
		// 	const ycos = Math.cos(y+time);
		// 	this._geometry.attributes.position.setZ(i,xsin + ycos);
		// }
		// this._geometry.computeVertexNormals();
		// this._geometry.attributes.position.needsUpdate = true;

		//구

		for(let i = 0; i < this._count; i++){
			const uX = this._geometry.attributes.uv.getX(i) * Math.PI * 16;
			const uY = this._geometry.attributes.uv.getY(i) * Math.PI * 16;

			const xangle = uX + time;
			const xsin = Math.sin(xangle) * 0.5
			const yangle = uY + time;
			const ycos = Math.sin(yangle) * 0.5

			const ix = i* 3;
			const iy = i * 3 + 1;
			const iz = i * 3 + 2;
			this._geometry.attributes.position.setX(i, this._positionClone[ix] + this._normalsClone[ix] * (xsin + ycos));
			this._geometry.attributes.position.setY(i, this._positionClone[iy] + this._normalsClone[iy] * (xsin + ycos));
			this._geometry.attributes.position.setZ(i, this._positionClone[iz] + this._normalsClone[iz] * (xsin + ycos));

		}
		this._geometry.computeVertexNormals();
		this._geometry.attributes.position.needsUpdate = true;
		
	}
}

window.onload = function () {
	new App();
};