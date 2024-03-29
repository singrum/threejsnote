
import * as THREE from '../node_modules/three/build/three.module.js';

import {GLTFLoader} from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js"
import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPixelatedPass.js';
// https://sketchfab.com


class App {
	constructor() {
		const divContainer = document.querySelector("#webgl_container");
		this._divContainer = divContainer;

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.autoClear = false;
        renderer.setClearColor(0x000000, 0.0);
		renderer.shadowMap.enabled = true;
		
		divContainer.appendChild(renderer.domElement);
		this._renderer = renderer;
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio( window.devicePixelRatio );
		const scene = new THREE.Scene();
		this._scene = scene;
		this.delta = 0.2
		this.step = 0;
		this.isPush = false;

        this._setupBackground();
		this._setupCamera();
		this._setupLight();
		this._setupModel();
		window.onresize = this.resize.bind(this);
		

        


		
		
		

		
	}
	debugPoint(pos){
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute([pos.x, pos.y, pos.z], 3)
		);

		const material = new THREE.PointsMaterial({
			color:0xff38a2,
			size: 5,
			sizeAttenuation : false
		})
		const points = new THREE.Points(geometry, material);
		this._scene.add(points)
	}


	_push(){
		this.isPush = true;
	}
    _setupBackground(){
        // this._scene.background = new THREE.Color(0xeeeeee);
    }
	_setupControls(){ 




		const onPointerDown = ( event ) => {
			
			if ( event.isPrimary === false ) return;
			this.startX = event.clientX
			this.startY = event.clientY
			this.pointerXOnPointerDown = event.clientX - window.innerWidth / 2;
			this.targetRotationOnPointerDown = this.targetRotation;

			document.addEventListener( 'pointermove', onPointerMove );
			document.addEventListener( 'pointerup', onPointerUp );

		}

		const onPointerMove = ( event ) => {
			
			if ( event.isPrimary === false ) return;
			this.pointerX = event.clientX - window.innerWidth / 2;

			this.targetRotation = this.targetRotationOnPointerDown + ( this.pointerX - this.pointerXOnPointerDown ) * 0.02;
			

		}

		const onPointerUp = (event) => {
			
			if ( event.isPrimary === false ) return;
			if(Math.hypot(this.startX - event.clientX, this.startY - event.clientY) < 10) this._push();
			
			document.removeEventListener( 'pointermove', onPointerMove );
			document.removeEventListener( 'pointerup', onPointerUp );

		}
		this.targetRotation = 0;
		this.targetRotationOnPointerDown = 0;
		this.pointerX = 0;
		this.pointerXOnPointerDown = 0;
		this._divContainer.style.touchAction = 'none';
		this._divContainer.addEventListener( 'pointerdown', onPointerDown );



	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.set(0,5,-9);
		this._camera = camera;
        this._scene.add(this._camera)
		this._camera.lookAt(0,3,0)
	}

	_setupLight() {
		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.castShadow = true;
		light.shadow.camera.top = light.shadow.camera.right = 30;
		light.shadow.camera.bottom = light.shadow.camera.left = -30;
		light.shadow.mapSize.width = light.shadow.mapSize.height = 2048 // 텍스쳐 맵 픽셀 수 증가 -> 선명
		light.shadow.radius = 4;
		light.position.set(6, 6, -10);
		this._scene.add(light);

		const light2 = new THREE.DirectionalLight(color, intensity);
		light2.position.set(-6,6,-10);
		this._scene.add(light2)
	}

	_setupModel() {

		const gltfLoader = new GLTFLoader()
        const url = '../data/patrick/scene.gltf';
        gltfLoader.load(
            url,
            (gltf)=>{
                const root = gltf.scene.children[0];
				this.group = root;
                // this._scene.add(root);
				const children = root.children[0].children;
				
				children.splice(2,3)
				// 받침대 : children[0], children[1]
				// 우편함 : children[2],children[3], children[4] -> 삭제
				// 해마&뚱이 : children[5] -> children[2]
				this._scene.add(root)
				root.traverse( function( node ) {

					if ( node.isMesh ) { node.castShadow = true; }
			
				} );
				


				this._patrick = children[2]
				this._patrickBody = this._patrick.children[0].children[0].children[1].children[0]
				this._setupControls()


				const groundGeometry = new THREE.PlaneGeometry(60,60);
				const material = new THREE.ShadowMaterial();
				material.opacity = 0.3;

				const GroundMesh = new THREE.Mesh( groundGeometry, material );
				GroundMesh.receiveShadow = true;
				GroundMesh.rotation.x = THREE.MathUtils.degToRad(-90);
				this._scene.add(GroundMesh);



				const geom = new THREE.BoxGeometry(6,6);
				const mate = new THREE.MeshPhongMaterial({color : 0x77777});
				

				const mesh = new THREE.Mesh( geom, mate );
				mesh.receiveShadow = true;
				mesh.rotation.x = THREE.MathUtils.degToRad(-90);
				this._scene.add( mesh );

				const composer = new EffectComposer( this._renderer );
				const renderPixelatedPass = new RenderPixelatedPass( 2, this._scene, this._camera );
				composer.addPass( renderPixelatedPass );
				this._composer = composer
				this.resize();
				requestAnimationFrame(this.render.bind(this));

            }
        )

	}

	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
		this._composer.setSize(width, height );
	}

	render() {
        this._composer.render();
		// this._renderer.render(this._scene, this._camera)
		this.update();	
		requestAnimationFrame(this.render.bind(this));
	}

	update() {
		if(this.isPush){
			this.delta1 = Math.random() * 2 * Math.PI
			this.delta2 = Math.random() * 2 * Math.PI
			this.isPush = false;
			this.isLinear = true;
			this.isRotate = false
			this.linearStep = 10;
			this.amp = 0.7
			this.tempX = this._patrick.rotation.x;
			this.tempY = this._patrick.rotation.y;
			this.step = 0;
			
		}
		if(this.isLinear){
			this.step ++;
			this._patrick.rotation.x += this.amp * (Math.cos(this.delta1) - this.tempX) / this.linearStep
			this._patrick.rotation.y += this.amp * (Math.sin(-this.delta2) - this.tempY) / this.linearStep
			
			
			if(this.step >= this.linearStep){
				this.step =0;
				this.isLinear = false;
				this.isRotate=true;
			}
			
		}
		if(this.isRotate){
			
			this._patrick.rotation.x = this.amp * Math.cos((this.step - this.delta1) * (1 + this.step / 10)) / Math.exp(this.step/5)
			this._patrick.rotation.y = this.amp * Math.sin((this.step - this.delta2)* (1 + this.step / 10)) / Math.exp(this.step/5)
			this.step += 0.1;
		}
		
		this.group.rotation.z += ( this.targetRotation - this.group.rotation.z ) * 0.05;



	}
}

window.onload = function () {
	new App();
};