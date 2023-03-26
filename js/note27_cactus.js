import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js"
import * as TWEEN from "../node_modules/@tweenjs/tween.js/dist/tween.esm.js"

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
		this.scaleAmp = 0.1;this.scaleFre = 2;
		this.shearAmp = 0.1;this.shearFre = 2;
		this.time = 0;
		this.step = 0.1
		

		this._setupCamera();
		this._setupLight();
		this._setupGround();
		this._setupModel();
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
		// new OrbitControls(this._camera, this._divContainer);
		const getPointerGroundCoord = e => {
			const raycaster = new THREE.Raycaster();
            
            const pt = {
                x: (e.clientX / this._divContainer.clientWidth) * 2 - 1,
                y: - (e.clientY / this._divContainer.clientHeight) * 2 + 1
            }
            raycaster.setFromCamera(pt, this._camera)
            const interObj = raycaster.intersectObject(this.transparentGround);
            if(interObj.length === 0){
                return;
            }
			else{
				return interObj[0].point;
			}
		}
		const onPointerDown = (e) => {


			function getAngle(x1, y1, x2, y2) {
				let angle = Math.atan2(y2 - y1,x2 - x1);
				if(angle < 0){
					return angle + 2 * Math.PI;
				}
				else if(angle > 2 * Math.PI){
					return angle - 2 * Math.PI;
				}
				return angle
				
			}

			this.whale.tween.forEach(e=>{e.stop();})

			const groundCoord = getPointerGroundCoord(e);
			if(!groundCoord){
				return;
			}
			
			if(this.whale.rotation.y < 0){
				this.whale.rotation.y += 2 * Math.PI;
			}
			else if(this.whale.rotation.y > 2 * Math.PI){
				this.whale.rotation.y -= 2 * Math.PI;
			}
			
			const angle = getAngle(this.whale.position.z, this.whale.position.x, groundCoord.z, groundCoord.x);
			const arr = [angle - 2 * Math.PI, angle, angle + 2 * Math.PI];
			const toAngle = arr.reduce((min, val) => Math.abs(min - this.whale.rotation.y) < Math.abs(val  - this.whale.rotation.y) ? min : val);


			const tween2 = new TWEEN.Tween(this.whale.rotation)
			.to({y:toAngle}, Math.abs(this.whale.rotation.y - toAngle) * 100)
			.easing(TWEEN.Easing.Quadratic.Out)
			
			const tween1 = new TWEEN.Tween(this.whale.position)
			.to({x : groundCoord.x, z : groundCoord.z}, Math.hypot(this.whale.position.x - groundCoord.x, this.whale.position.z - groundCoord.z) * 200)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onComplete(()=>{
			})
			tween2.onStart(()=>{tween1.start()})
			tween2.start()			

			this.whale.tween = [tween1, tween2];



		}

		window.addEventListener("pointerdown", onPointerDown);

	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.initPos = {x : 10, y : 10, z : 10};
		camera.position.set(camera.initPos.x, camera.initPos.y, camera.initPos.z);
		this._camera = camera;
        this._scene.add(this._camera)
	}

	_setupLight() {
		const defaultlight = new THREE.AmbientLight(0xffffff, 0.2);
		this._scene.add(defaultlight)

		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(100, 100, 100);
		light.castShadow = true;
		light.shadow.camera.top = light.shadow.camera.right = 100;
		light.shadow.camera.bottom = light.shadow.camera.left = -100;
		light.shadow.mapSize.width = light.shadow.mapSize.height = 4096 // 텍스쳐 맵 픽셀 수 증가 -> 선명
		light.shadow.radius = 1;
		this._camera.add(light);
	}

	_setupModel() {
		const gltfLoader = new GLTFLoader()
		gltfLoader.load('../data/cutewhale/scene.gltf',
			(gltf)=>{
				const whaleRoot = gltf.scene;
				this.whale = whaleRoot;
				this.whale.tween = [];
				whaleRoot.traverse( function( node ) {
					if ( node.isMesh ) { node.castShadow = true;  }
				} );
				this._scene.add(this.whale);
				gltfLoader.load('../data/cactus/scene.gltf',
				
				(gltf)=>{
						
						const cactusRoot = gltf.scene;
						
						cactusRoot.traverse( function( node ) {
							if ( node.isMesh ) { node.castShadow = true;  }
						} );

						this.cactusArr = [];
						for(let i = 0; i< 30; i++){
							const clone = cactusRoot.clone()
							this._scene.add(clone)
							
							clone.matrixAutoUpdate = false
							this.cactusArr.push(clone);
							clone.random1 = this.randRange(-40,40);
							clone.random2 = this.randRange(-40,40);
						}
						this.initMat = cactusRoot.matrix.makeScale(0.005,0.005,0.005);
						
						


						this._setupControls();
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
		for(let i = 0; i < this._count; i++){
			const x = this.ground.geometry.attributes.position.getX(i);
			const y = this.ground.geometry.attributes.position.getY(i);
			const xsin = 0.2 * Math.sin(x+0);
			const ycos = 0.1 * Math.cos(y+0);
			this.ground.geometry.attributes.position.setZ(i,xsin + ycos);
		}
		this.ground.geometry.computeVertexNormals();
		this.ground.geometry.attributes.position.needsUpdate = true;


		const transparentGroundGeom = new THREE.PlaneGeometry(100,100);
		const transparentGroundMate = new THREE.MeshBasicMaterial({visible : false});
		const transparentGround = new THREE.Mesh(transparentGroundGeom, transparentGroundMate);
		transparentGround.rotation.set(-Math.PI/2,0,0);
		this._scene.add(transparentGround)
		this.transparentGround = transparentGround;
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
		
		this.cactusDance();
		this.whaleSwim();
		this.cameraUpdate();
	
		
		TWEEN.update();
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
		this.whale.position.y = 1 + Math.abs(Math.sin(this.time))
		// this.whale.matrix = matmul(
		// 	new THREE.Matrix4().makeTranslation(0,1 + Math.abs(Math.sin(this.time * 2)),0),
		// )
		
	}
	cameraUpdate() {
		this._camera.position.set(this._camera.initPos.x + this.whale.position.x, this._camera.initPos.y, this._camera.initPos.z + this.whale.position.z)
		this._camera.lookAt(this.whale.position.x,0,this.whale.position.z)
	}
}

window.onload = function () {
	new App();
};