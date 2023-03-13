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

		this.time = 0;

        this._setupBackground();
		this._setupCamera();
		this._setupLight();
		this._setupModel();
		this._setupControls()

		

		const composer = new EffectComposer( renderer );
		const renderPixelatedPass = new RenderPixelatedPass( 6, this._scene, this._camera );
		this._renderPixelatedPass = renderPixelatedPass
        renderPixelatedPass.pixelSize = 4
		renderPixelatedPass.normalEdgeStrength = 0.2;
		renderPixelatedPass.depthEdgeStrength = 0.1
        
		composer.addPass( renderPixelatedPass );
		this._composer = composer


		window.onresize = this.resize.bind(this);
		this.resize();

		requestAnimationFrame(this.render.bind(this));
	}
    _setupBackground(){
        this._scene.background = new THREE.Color(0x400D51)
    }
	_setupControls(){
		new OrbitControls(this._camera, this._divContainer);
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const aspectRatio = window.innerWidth / window.innerHeight;
		const camera = new THREE.OrthographicCamera( - aspectRatio, aspectRatio, 1, - 1, 0.1, 40 );
		// const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.set(5,5,5);
		camera.zoom = 0.2
		// camera.lookAt(0,0,0)
        
		this._camera = camera;
        this._scene.add(camera)
	}

	_setupLight() {
		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(3, 10, 3);
		light.castShadow = true;
		this._scene.add(light);
	}

	_setupModel() {
		// const floorLen = 4;
		// const floorColor = 0xCBE4DE

		// const planeArr = [new THREE.Mesh(new THREE.PlaneGeometry(floorLen,floorLen), new THREE.MeshPhysicalMaterial({color : floorColor})),
		// 	new THREE.Mesh(new THREE.PlaneGeometry(floorLen,floorLen), new THREE.MeshPhysicalMaterial({color : floorColor})),
		// 	new THREE.Mesh(new THREE.PlaneGeometry(floorLen,floorLen), new THREE.MeshPhysicalMaterial({color : floorColor}))]

		// planeArr[0].rotation.set(-Math.PI/2,0,0)
		// planeArr[0].position.set(floorLen/2,0,floorLen/2)

		// planeArr[1].rotation.set(0,0,0)
		// planeArr[1].position.set(floorLen/2,floorLen/2,0)

		// planeArr[2].rotation.set(0,Math.PI/2,0)
		// planeArr[2].position.set(0,floorLen/2,floorLen/2)
		// planeArr.forEach(e=>{
		// 	// this._scene.add(e);
		// })



		// const cubeColor = 0x2C3333;
		// const cubeMate = new THREE.MeshPhysicalMaterial({color : cubeColor, side: THREE.DoubleSide, transparent : true, opacity : 0.5})
        // const cubeArr = [new THREE.Mesh(new THREE.BoxGeometry(1,1,1), cubeMate),
        //     new THREE.Mesh(new THREE.BoxGeometry(1,1,1), cubeMate),
        //     new THREE.Mesh(new THREE.BoxGeometry(1,1,1), cubeMate),
        //     new THREE.Mesh(new THREE.BoxGeometry(1,1,1), cubeMate),
        //     new THREE.Mesh(new THREE.BoxGeometry(1,1,1), cubeMate),
        //     new THREE.Mesh(new THREE.BoxGeometry(1,1,1), cubeMate)]
		// const cubePosArr = [new THREE.Vector3(0.5,2.5,0.5),
		// 	new THREE.Vector3(1.5,1.5,0.5),
		// 	new THREE.Vector3(0.5,1.5,1.5),
		// 	new THREE.Vector3(2.5,0.5,0.5),
		// 	new THREE.Vector3(1.5,0.5,1.5),
		// 	new THREE.Vector3(0.5,0.5,2.5)]
		
		// for(let i = 0;i<6;i++){
		// 	cubeArr[i].position.set(cubePosArr[i].x, cubePosArr[i].y, cubePosArr[i].z)
		// 	// this._scene.add(cubeArr[i])
		// }

		// cubeArr.forEach(e=>{
		// 	e.receiveShadow = true;
		// 	e.castShadow = true;
		// })
		

		//heart shape
		const heartShape = new THREE.Shape();
		heartShape.moveTo(0, 0);
		heartShape.bezierCurveTo(0, -0.5, -0.8, -1.5, -2, -1.5);
		heartShape.bezierCurveTo(-3.5, -1.5, -4.5, 0, -4.5, 1.5);
		heartShape.bezierCurveTo(-4.5, 3.5, -2.5, 5, 0, 7);
		heartShape.bezierCurveTo(2.5, 5, 4.5, 3.5, 4.5, 1.5);
		heartShape.bezierCurveTo(4.5, 0, 3.5, -1.5, 2, -1.5);
		heartShape.bezierCurveTo(0.8, -1.5, 0, -0.5, 0, 0);
		
		const extrudeSettings = {
			depth: 0,
			bevelEnabled: true,
			bevelSegments: 1,
			steps: 1,
			bevelSize: 2.3,
			bevelThickness: 2,
			curveSegments: 2
		  };
		  const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings).scale(0.15,0.15,0.15).rotateZ(Math.PI).translate(0,1,0)


		//emerald shape
		const emeraldShape = new THREE.Shape();
		const width = 0.6;
		const height = 1.2;
		emeraldShape.moveTo( -width/2, -height/2 );
		emeraldShape.lineTo( -width/2, height/2 );
		emeraldShape.lineTo( width/2, height/2 );
		emeraldShape.lineTo( width/2, -height/2 );
		emeraldShape.lineTo( -width/2, -height/2 );

		const emeraldExtrudeSettings = {
			steps: 2,
			depth: 0,
			bevelEnabled: true,
			bevelThickness: 0.3,
			bevelSize: 0.3,
			bevelOffset: 0,
			bevelSegments: 1
		};
		const emeraldGeometry = new THREE.ExtrudeGeometry( emeraldShape, emeraldExtrudeSettings );

		//emerald shape
		const emeraldShape2 = new THREE.Shape();
		const width2 = 0.8;
		const height2 = 1.3;
		emeraldShape2.moveTo( -width2/2, 0 );
		emeraldShape2.lineTo( 0, height2/2 );
		emeraldShape2.lineTo( width2/2, 0 );
		emeraldShape2.lineTo( 0, -height2/2 );
		emeraldShape2.lineTo( -width2/2, 0 );

		const emeraldExtrudeSettings2 = {
			steps: 2,
			depth: 0,
			bevelEnabled: true,
			bevelThickness: 0.3,
			bevelSize: 0.3,
			bevelOffset: 0,
			bevelSegments: 1
		};
		const emeraldGeometry2 = new THREE.ExtrudeGeometry( emeraldShape2, emeraldExtrudeSettings2 );



		const jewelArr = [
			new THREE.Mesh(new THREE.IcosahedronGeometry(1,0), new THREE.MeshPhongMaterial({color : 0x865DFF, shininess: 2, specular: 0xffffff, transparent: true, opacity : 1})),
			new THREE.Mesh(new THREE.OctahedronGeometry(0.8,0).scale(1,1.5,1), new THREE.MeshPhongMaterial({color : 0x35D0BA, shininess: 2, specular: 0xffffff, transparent: true, opacity : 0.8})),
			new THREE.Mesh(new THREE.IcosahedronGeometry(1,1), new THREE.MeshPhongMaterial({color : 0xFAEEE7, shininess: 2, specular: 0xffffff, flatShading: true})),
			new THREE.Mesh(heartGeometry, new THREE.MeshPhongMaterial({color : 0xff0000, shininess: 2, specular: 0xffffff})),
			new THREE.Mesh(emeraldGeometry, new THREE.MeshPhongMaterial({color : 0x16FF00, shininess: 2, specular: 0xffffff})),
			new THREE.Mesh(emeraldGeometry2 , new THREE.MeshPhongMaterial({color : 0xF8B500, shininess: 2, specular: 0xffffff}))
		]
		this._jewelArr = jewelArr;

		jewelArr.forEach(e=>{
			e.castShadow =true;
			e.receiveShadow = true;
		})
		
		const cylColor = 0x2C3333;
		const cylRadius = 2;
		const cylHeight = 10;
		const cylMate = new THREE.MeshPhysicalMaterial({color : cylColor, side: THREE.DoubleSide, transparent : false, opacity : 0.5})
        const cylArr = [new THREE.Mesh(new THREE.CylinderGeometry(cylRadius,cylRadius,cylHeight,32), cylMate)]
		const cylPosArr = [new THREE.Vector3(0,-cylHeight / 2,0)]
		
		for(let i = 0;i<1;i++){
			cylArr[i].position.set(cylPosArr[i].x, cylPosArr[i].y, cylPosArr[i].z)
			this._scene.add(cylArr[i])
			console.log(this._scene)
			cylArr[i].receiveShadow = true;
		}

		let jewelIndex = 5
		jewelArr[jewelIndex].position.set(0, 2, 0)
		this._scene.add(jewelArr[jewelIndex])




	}

	resize() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
		this._composer.setSize( window.innerWidth, window.innerHeight );

	}

	render() {
		this._composer.render();
		this.update();
		requestAnimationFrame(this.render.bind(this));
	}

	update() {
		this.time += 0.01;
		let i = 0
		for(let obj of this._jewelArr){
			i ++;
			obj.rotation.y = this.time
			obj.position.y += Math.sin(this.time * 5 + i) * 0.003
		}
	}
}

window.onload = function () {
	new App();
};