
import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js"
import {VertexNormalsHelper} from "../node_modules/three/examples/jsm/helpers/VertexNormalsHelper.js";

// https://sketchfab.com


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
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		this.time = 0;
		
		this.prevTime = performance.now()

		this._setupCamera();
		this._setupLight();
		this._setupModel();
		this._setupControls();
		this._setupBackground();

		window.onresize = this.resize.bind(this);
		this.resize();
		this.temp = 0;
		requestAnimationFrame(this.render.bind(this));
	}
    _setupBackground(){
        this._scene.background = new THREE.Color(0xD6CDA4);

    }
	_setupControls(){ 
        new OrbitControls(this._camera, this._divContainer);
		let idx = 600;
		// window.addEventListener("click",()=>{

		// 		const ix = idx * 3;
		// 		const iy = idx * 3 + 1;
		// 		const iz = idx * 3 + 2;
		// 		const x = this.positionClone[ix];
		// 		const y = this.positionClone[iy];
		// 		const z = this.positionClone[iz];
		// 		console.log(x,y,z)
		// 		this.debugPoint(x,y,z)
		// 		idx ++;
		// })

	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const aspectRatio = window.innerWidth / window.innerHeight;
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		
		camera.position.set(5,10,50)
		camera.lookAt(0,0,0)
		// camera.zoom = 0.1
		this._camera = camera;
        this._scene.add(this._camera)
	}

	_setupLight() {
		const color = 0xffffff;
		const intensity = 0.5;

		const defaultLight = new THREE.AmbientLight(0xffffff, 0.5);
		this._scene.add(defaultLight)

		const light = new THREE.DirectionalLight(color, 0.7);
		
		light.castShadow = true;
		light.shadow.camera.top = light.shadow.camera.right = 1000;
		light.shadow.camera.bottom = light.shadow.camera.left = -1000;
		light.shadow.mapSize.width = light.shadow.mapSize.height = 2048 // 텍스쳐 맵 픽셀 수 증가 -> 선명
		light.shadow.radius = 1;
		light.position.set(0, 20, 0);
		
		
		this._scene.add(light);
		
	}
	debugPoint(x,y,z){
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute([x,y,z], 3)
		);

		const material = new THREE.PointsMaterial({
			color:0xff38a2,
			size: 5,
			sizeAttenuation : false
		})
		const points = new THREE.Points(geometry, material);
		this._scene.add(points)
	}
	_setupModel() {
		const barShape = new THREE.Shape();
        barShape.moveTo(1,3);
        barShape.arc(2,0,2, Math.PI, Math.PI * 1.5);
        barShape.lineTo(3,-1);
        barShape.arc(0,-2,2, Math.PI *0.5, Math.PI);
		barShape.lineTo(-1,-3);
        barShape.arc(-2,0,2, 0,Math.PI *0.5);
        barShape.lineTo(-3,1);
        barShape.arc(0,2,2, Math.PI * 1.5, Math.PI * 2);
        barShape.lineTo(-1,3)
        
        const barLen = 20
		const barStep = 20;
        const extrudeSettings ={
            steps: barStep,
            depth: barLen,
            bevelEnabled: false,
            // bevelThickness: 0.5,
            // bevelSize: 0.3,
            // bevelOffset: 0,
            // bevelSegments: 10
        }
        const barGeometry = new THREE.ExtrudeGeometry( barShape, extrudeSettings );
        const barMaterial = new THREE.MeshPhysicalMaterial({color : 0x444444, wireframe: true});
        const bar = new THREE.Mesh(barGeometry, barMaterial);
        bar.rotation.set(Math.PI/2, 0, 0);
        bar.position.set(0,barLen/2,0)


        const stickLen = 8;
        const stickGeometry = new THREE.CylinderGeometry(0.6,0.6,stickLen, 16);
        const stickMaterial = new THREE.MeshPhysicalMaterial({color : 0x222222})
        const stick = new THREE.Mesh(stickGeometry, stickMaterial)
        stick.position.set(0,-barLen / 2 - stickLen / 2,0);

        const group = new THREE.Object3D();
        group.add(bar, stick);
        // this._scene.add(group);
        group.rotation.set(0,0,-Math.PI/4);

        

        this.bar = bar;
        this.count = this.bar.geometry.attributes.position.count;
        this.positionClone = JSON.parse(JSON.stringify(this.bar.geometry.attributes.position.array))
        
		console.log(this.count)
		//600 + 612 * 20씩 증가

		this.indexPartition = [[],[]];
		for(let i = 0; i< barStep + 10; i++){
			this.indexPartition.push([]);
		}
		for (let i = 0; i < 300; i++) {
			this.indexPartition[0].push(i);
		}
		for(let i = 300; i<600; i++){
			this.indexPartition[1].push(i);
		}
		let index = 0;
		for(let i = index; i<this.count; i++){
			// console.log(this.positionClone[i]);
			
		}
		// console.log(this.indexPartition)



		for (let idx = 0;idx < this.count/2;idx++) {
			const ix = idx * 3;
			const iy = idx * 3 + 1;
			const iz = idx * 3 + 2;
			const x = this.positionClone[ix];
			const y = this.positionClone[iy];
			const z = this.positionClone[iz];
			for(let i = 0; i<20;i++) {
				if(z < 0.5 * (i + 1)){
					this.indexPartition[0].push(idx);
					break;
				}
			}
			
		}
		console.log(this.indexPartition)
		
	}



	randRange(a,b){
		return Math.random() * (b - a) + a;
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
		this.update();
		requestAnimationFrame(this.render.bind(this));
	}

	update() {
        this.angle += 0.01
		this.time += 1;
        
		const ix = this.time* 3;
		const iy = this.time * 3 + 1;
		const iz = this.time * 3 + 2;
		const x = this.positionClone[ix];
		const y = this.positionClone[iy];
		const z = this.positionClone[iz];
        
		// this.debugPoint(x,y,z)
            
        // }
        // this.bowArr[j].geometry.computeVertexNormals();
        // this.bowArr[j].geometry.attributes.position.needsUpdate = true;
    }
}

window.onload = function () {
	new App();
};