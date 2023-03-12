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
		const scene = new THREE.Scene();
		this._scene = scene;



        this._setupBackground();
		this._setupCamera();
		this._setupLight();
		this._setupModel();
		this._setupControls()



		const composer = new EffectComposer( renderer );
		const renderPixelatedPass = new RenderPixelatedPass( 6, this._scene, this._camera );
		this._renderPixelatedPass = renderPixelatedPass
        renderPixelatedPass.pixelSize = 3
		renderPixelatedPass.normalEdgeStrength = 0.3;
		renderPixelatedPass.depthEdgeStrength = 0.2
        
		composer.addPass( renderPixelatedPass );
		this._composer = composer


		window.onresize = this.resize.bind(this);
		this.resize();

		requestAnimationFrame(this.render.bind(this));
	}
    _setupBackground(){
        this._scene.background = new THREE.Color(0x191825)
    }
	_setupControls(){
		new OrbitControls(this._camera, this._divContainer);
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const aspectRatio = window.innerWidth / window.innerHeight;
		const camera = new THREE.OrthographicCamera( - aspectRatio, aspectRatio, 1, - 1, 0.1, 40 );
		camera.position.set(2,2,2);
		camera.zoom = 0.20
        
		this._camera = camera;
        this._scene.add(camera)
	}

	_setupLight() {
		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(3, 3, 5);
		this._camera.add(light);
	}

	_setupModel() {
		const floorLen = 4;
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(floorLen,floorLen), new THREE.MeshPhysicalMaterial({color : 0x555555}));
        floor.rotation.set(-Math.PI/2,0,0)
        floor.position.set(floorLen/2,0,floorLen/2)
        this._scene.add(floor)

		const wall1 = new THREE.Mesh(new THREE.PlaneGeometry(floorLen,floorLen), new THREE.MeshPhysicalMaterial({color : 0x555555}));
        wall1.rotation.set(0,0,0)
        wall1.position.set(floorLen/2,floorLen/2,0)
        this._scene.add(wall1)

		const wall2 = new THREE.Mesh(new THREE.PlaneGeometry(floorLen,floorLen), new THREE.MeshPhysicalMaterial({color : 0x555555}));
        wall2.rotation.set(0,Math.PI/2,0)
        wall2.position.set(0,floorLen/2,floorLen/2)
        this._scene.add(wall2)

        const cubeArr = [new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshPhysicalMaterial({color : 0x7743DB})),
            new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshPhysicalMaterial({color : 0x7743DB})),
            new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshPhysicalMaterial({color : 0x7743DB})),
            new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshPhysicalMaterial({color : 0x7743DB})),
            new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshPhysicalMaterial({color : 0x7743DB})),
            new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshPhysicalMaterial({color : 0x7743DB}))]
		const cubePosArr = [new THREE.Vector3(0.5,2.5,0.5),
			new THREE.Vector3(1.5,1.5,0.5),
			new THREE.Vector3(0.5,1.5,1.5),
			new THREE.Vector3(2.5,0.5,0.5),
			new THREE.Vector3(1.5,0.5,1.5),
			new THREE.Vector3(0.5,0.5,2.5)]
		
		for(let i = 0;i<6;i++){
			cubeArr[i].position.set(cubePosArr[i].x, cubePosArr[i].y, cubePosArr[i].z)
			this._scene.add(cubeArr[i])
		}

		const jewelArr = [
			new THREE.Mesh(new THREE.IcosahedronGeometry(0.4,0), new THREE.MeshPhysicalMaterial({color : 0xff0000})),
			new THREE.Mesh(new THREE.IcosahedronGeometry(0.4,0), new THREE.MeshPhysicalMaterial({color : 0xff0000})),
			new THREE.Mesh(new THREE.IcosahedronGeometry(0.4,0), new THREE.MeshPhysicalMaterial({color : 0xff0000})),
			new THREE.Mesh(new THREE.IcosahedronGeometry(0.4,0), new THREE.MeshPhysicalMaterial({color : 0xff0000})),
			new THREE.Mesh(new THREE.IcosahedronGeometry(0.4,0), new THREE.MeshPhysicalMaterial({color : 0xff0000})),
			new THREE.Mesh(new THREE.IcosahedronGeometry(0.4,0), new THREE.MeshPhysicalMaterial({color : 0xff0000}))
		]
		for(let i = 0;i<6;i++){
			jewelArr[i].position.set(cubePosArr[i].x, cubePosArr[i].y + 1, cubePosArr[i].z)
			this._scene.add(jewelArr[i])
		}
		
        

		// const geometry = new THREE.IcosahedronGeometry(1,0);
		// const material = new THREE.MeshPhysicalMaterial({ color: 0x44a88 });
		// const cube = new THREE.Mesh(geometry, material);
		// cube.position.set(new THREE.Vector3(4,4,4))


		// this._scene.add(cube);
		// this._cube = cube;
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