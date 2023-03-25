import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js"

// https://sketchfab.com

const matmul = function(...mats){
	return mats.reduce((prev, curr) => prev.multiply(curr))
}
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
		this.scaleAmp = 0.1;this.scaleFre = 4;
		this.shearAmp = 0.1;this.shearFre = 4;
		this.time = 0;
		this.step = 0.1

		this._setupCamera();
		this._setupLight();
		this._setupGround();
		this._setupModel();
		this._setupControls();
		this._setupBackground();

		window.onresize = this.resize.bind(this);
		this.resize();

		
	}
	randRange(a,b){
		if(! b){
			return Math.random() * a;
		}
		return Math.random() * (b - a) + a;
	}
    _setupBackground(){
        this._scene.background = new THREE.Color(0x62CDFF);

    }
	_setupControls(){
		new OrbitControls(this._camera, this._divContainer);
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.set(10,10,10)
		this._camera = camera;
        this._scene.add(this._camera)
	}

	_setupLight() {
		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(10, 10, 10);
		light.castShadow = true;
		light.shadow.camera.top = light.shadow.camera.right = 30;
		light.shadow.camera.bottom = light.shadow.camera.left = -30;
		light.shadow.mapSize.width = light.shadow.mapSize.height = 4096 // 텍스쳐 맵 픽셀 수 증가 -> 선명
		light.shadow.radius = 4;
		this._camera.add(light);
	}

	_setupModel() {
		const gltfLoader = new GLTFLoader()
		gltfLoader.load('../data/cutewhale/scene.gltf',
			(gltf)=>{
				const whaleRoot = gltf.scene;
				this.whale = whaleRoot;
				this._scene.add(this.whale);
				gltfLoader.load('../data/cactus/scene.gltf',
				
				(gltf)=>{
						
						const cactusRoot = gltf.scene;
						
						cactusRoot.traverse( function( node ) {
							if ( node.isMesh ) { node.castShadow = true;  }
						} );

						this.cactusArr = [];
						for(let i = 0; i< 10; i++){
							const clone = cactusRoot.clone()
							this._scene.add(clone)
							
							clone.matrixAutoUpdate = false
							this.cactusArr.push(clone);
							clone.random1 = this.randRange(-10,10);
							clone.random2 = this.randRange(-10,10);
						}
						this.initMat = cactusRoot.matrix.makeScale(0.005,0.005,0.005);
						
						this.whale.matrixAutoUpdate = false;
						console.log(this.whale)



						requestAnimationFrame(this.render.bind(this));
							
							
					}
				)
			}
		)

	}

	_setupGround(){
		const groundGeom = new THREE.PlaneGeometry(100,100, 300,300);
		const groundMate = new THREE.MeshPhysicalMaterial({color : 0xf6d7b0});
		const ground = new THREE.Mesh(groundGeom, groundMate);
		ground.receiveShadow = true;
		ground.rotation.set(-Math.PI/2,0,0);
		this.ground = ground;
		this._scene.add(ground);
		this._count = ground.geometry.attributes.position.count;
	}


	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
	}

	render() {
		this._renderer.render(this._scene, this._camera);
		this.time += this.step;
		this.groundUpdate();
		this.cactusDance();
		this.whaleSwim();
		this.update();
		
		requestAnimationFrame(this.render.bind(this));
	}
	
	groundUpdate(){
		for(let i = 0; i < this._count; i++){
			const x = this.ground.geometry.attributes.position.getX(i);
			const y = this.ground.geometry.attributes.position.getY(i);
			const xsin = 0.2 * Math.sin(x+0);
			const ycos = 0.1 * Math.cos(y+0);
			this.ground.geometry.attributes.position.setZ(i,xsin + ycos);
		}
		this.ground.geometry.computeVertexNormals();
		this.ground.geometry.attributes.position.needsUpdate = true;
	}
	cactusDance(){
		
		for(let cactus of this.cactusArr){
			cactus.matrix = matmul(
				new THREE.Matrix4().makeTranslation(cactus.random1, 0, cactus.random2),
				new THREE.Matrix4().makeShear(0,0,this.shearAmp * Math.sin(this.time * this.shearFre),0,0,0), 
				new THREE.Matrix4().makeScale(1,this.scaleAmp * (Math.cos(this.time * this.scaleFre) + 1) / 2 + 0.8, 1),
				this.initMat)
		}


	}
	whaleSwim(){

	}
	update() {

		
		// this._cube.rotation.x = time;
		// this._cube.rotation.y = time;
	}
}

window.onload = function () {
	new App();
};