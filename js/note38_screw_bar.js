
import * as THREE from '../node_modules/three/build/three.module.js';
import {BarShader, StickShader} from '../shader/note38_Shader.js'
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';


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

		this.angle = 0;

		this.prevTime = performance.now()
		this.time = 0;
		this._setupCamera();
		this._setupLight();
		this._setupModel();
		this._setupControls();
		this._setupBackground();

		window.onresize = this.resize.bind(this);
		this.resize();
		
		this.prevTime = performance.now();
		requestAnimationFrame(this.render.bind(this));
	}
    _setupBackground(){
        this._scene.background = new THREE.Color(0xD6CDA4);

    }
	_setupControls(){ 
        // new OrbitControls(this._camera, this._divContainer);
        const onPointerDown = ( event ) => {
			
			if ( event.isPrimary === false ) return;
			this.startX = event.clientX
			this.startY = event.clientY
			this.pointerYOnPointerDown = event.clientY - window.innerWidth / 2;
			this.targetRotationOnPointerDown = this.targetRotation;

			document.addEventListener( 'pointermove', onPointerMove );
			document.addEventListener( 'pointerup', onPointerUp );

		}

		const onPointerMove = ( event ) => {
			
			if ( event.isPrimary === false ) return;
			this.pointerY = event.clientY - window.innerWidth / 2;

			this.targetRotation = this.targetRotationOnPointerDown + ( this.pointerY - this.pointerYOnPointerDown ) * 0.02;
			


		}

		const onPointerUp = (event) => {
			
			if ( event.isPrimary === false ) return;
			document.removeEventListener( 'pointermove', onPointerMove );
			document.removeEventListener( 'pointerup', onPointerUp );

		}
		this.targetRotation = 0;
		this.targetRotationOnPointerDown = 0;
		this.pointerY = 0;
		this.pointerYOnPointerDown = 0;
		this._divContainer.style.touchAction = 'none';
		this._divContainer.addEventListener( 'pointerdown', onPointerDown );

	}

	_setupCamera() {
		const width = 400;
		
		const height = this._divContainer.clientHeight;
		const aspectRatio = window.innerWidth / window.innerHeight;
		const camera = new THREE.OrthographicCamera( -aspectRatio * width / 2, aspectRatio * width / 2, width / 2, -width /2, 0.000001, 100000 );
		
		camera.position.set(8,10,35)
		camera.zoom = 6
				camera.lookAt(-1,0,0)
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
		for(let i= 0; i < 20; i++){
			barShape.lineTo(3,1 - 0.1 * (i+1));	
		}    
        barShape.arc(0,-2,2, Math.PI *0.5, Math.PI);
		for(let i= 0; i < 20; i++){
			barShape.lineTo(1 - 0.1 * (i+1), -3);	
		}    
        barShape.arc(-2,0,2, 0,Math.PI *0.5);
		for(let i= 0; i < 20; i++){
			barShape.lineTo(-3, -1 + 0.1 * (i+1));	
		}    
        
        barShape.arc(0,2,2, Math.PI * 1.5, Math.PI * 2);
		for(let i= 0; i < 20; i++){
			barShape.lineTo(-1 + 0.1 * (i+1),3);	
		}    
        
        const barLen = 20
		const barStep = 40;
        const extrudeSettings ={
			curveSegments : 10,
            steps: barStep,
            depth: barLen,
            bevelEnabled: false,
            bevelThickness: 0.5,
            bevelSize: 0.3,
            bevelSegments: 10
        }
        const barGeometry = new THREE.ExtrudeGeometry( barShape, extrudeSettings );
        const barMaterial = new THREE.ShaderMaterial(BarShader);
		BarShader.uniforms.iTime.value = this.time;
        const bar = new THREE.Mesh(barGeometry, barMaterial);
        bar.rotation.set(-Math.PI/2, 0, 0);
        bar.position.set(0,-barLen/2,0)


        const stickLen = 8;
        const stickGeometry = new THREE.CylinderGeometry(0.6,0.6,stickLen, 16);
        const stickMaterial = new THREE.ShaderMaterial(StickShader)
        const stick = new THREE.Mesh(stickGeometry, stickMaterial)
        stick.position.set(0,-barLen / 2 - stickLen / 2,0);

        const group = new THREE.Object3D();
        group.add(bar, stick);
        this._scene.add(group);
        group.rotation.set(0,0,-Math.PI/4);

        

        this.bar = bar;
		this.vPos = bar.geometry.attributes.position;
        
        this.positionClone = JSON.parse(JSON.stringify(this.vPos.array))
		




		
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
		this.timeUpdate();
		requestAnimationFrame(this.render.bind(this));
	}
	timeUpdate(){
		const currentTime = performance.now();
		const deltaTime = (currentTime - this.prevTime) / 1000;
		this.prevTime = currentTime;
		this.time += deltaTime;
	}
	update() {
        // this.angle += 0.01
		// console.log(this.angle)
		
        const cos = Math.cos(this.angle);
		const sin = Math.sin(this.angle);
		for (let i = 0;i < this.vPos.count;i++) {
			const ix = i * 3;
			const iy = i * 3 + 1;
			const iz = i * 3 + 2;
			const x = this.positionClone[ix];
			const y = this.positionClone[iy];
			const z = this.positionClone[iz];
			
			this.vPos.setX(i, x * Math.cos(this.angle * z/10) - y * Math.sin(this.angle * z/10));
			this.vPos.setY(i, x * Math.sin(this.angle * z/10) + y * Math.cos(this.angle * z/10));
			this.vPos.setZ(i, z);
			// this.vPos.setX(i, this.angle);
			
		}           
		this.bar.geometry.computeVertexNormals();
		this.vPos.needsUpdate = true;
		this.angle += ( this.targetRotation - this.angle ) * 0.05;
		
	}
	
}

window.onload = function () {
	new App();
};