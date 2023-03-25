import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPixelatedPass.js';
//https://threejs.org/examples/?q=pixel

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

		this.time = 0;
		this.pixelSizeControl = document.querySelector("#pixelsize");
		this.colorControl = document.querySelector("#color");
		

		
        this._setupBackground();
		this._setupCamera();
		this._setupLight();
		this._setupModel();
		this._setupControls();

		

		const composer = new EffectComposer( renderer );
		const renderPixelatedPass = new RenderPixelatedPass( 6, this._scene, this._camera );
		this._renderPixelatedPass = renderPixelatedPass
        renderPixelatedPass.pixelSize = 5
		renderPixelatedPass.normalEdgeStrength = 0.2;
		renderPixelatedPass.depthEdgeStrength = 0.1
        
		composer.addPass( renderPixelatedPass );
		this._composer = composer


		window.onresize = this.resize.bind(this);
		this.resize();

		requestAnimationFrame(this.render.bind(this));
	}
    _setupBackground(){
        this._scene.background = new THREE.Color(0xF7EFE5)
    }
	nextJewelIndex(currIndex){
		return currIndex < this._jewelArr.length - 1 ? currIndex + 1 :0
	}
	prevJewelIndex(currIndex){
		return currIndex > 0 ? currIndex - 1 : this._jewelArr.length-1
	}
	_setupControls(){
		// new OrbitControls(this._camera, this._divContainer);
		let touchstartX = 0
		let touchendX = 0
		this._static = true;
		const isTouchValid = e=>{
			if(!this._static){return}
			const raycaster = new THREE.Raycaster();
            
			const pt = {
				x: (e.touches[0].clientX/ this._divContainer.clientWidth) * 2 - 1,
				y: - (e.touches[0].clientY / this._divContainer.clientHeight) * 2 + 1
			}
			raycaster.setFromCamera(pt, this._camera)
			const interObj = raycaster.intersectObject(this._jewelArr[this._currJewelIndex])
			if(interObj.length === 0){
				return false;
			}
			
			return true
		}
		const touchEnd = e => {
			touchendX = e.changedTouches[0].screenX
			checkDirection()
			document.removeEventListener('touchend', touchEnd)
		  }
		
		document.addEventListener('touchstart', e => {
			if(!isTouchValid(e)){
				return;
			}
			this._static = false;
		  	touchstartX = e.changedTouches[0].screenX
			document.addEventListener('touchend', touchEnd)
		})
		


		const checkDirection = ()=> {
			if (touchendX < touchstartX) {
				gsap.to(this._jewelArr[this._currJewelIndex].position,{duration : 2, x : -5, z : 5})
				this._currJewelIndex = this.nextJewelIndex(this._currJewelIndex)
				const nextJewel = this._jewelArr[this._currJewelIndex]
				
				this._scene.add(nextJewel)
				nextJewel.position.set(5,1.5,-5)
				
				gsap.to(nextJewel.position,{duration : 2, x : 0, z : 0,
					onComplete : ()=>{
						console.log(1)
						this._scene.remove(this._jewelArr[this.prevJewelIndex(this._currJewelIndex)])
						this._static = true;
					}})
			}
			if (touchendX > touchstartX){
				gsap.to(this._jewelArr[this._currJewelIndex].position,{duration : 2, x : 5, z : -5})
				this._currJewelIndex = this.prevJewelIndex(this._currJewelIndex)
				const nextJewel = this._jewelArr[this._currJewelIndex]
				
				this._scene.add(nextJewel)
				nextJewel.position.set(-5,1.5,5)
				
				gsap.to(nextJewel.position,{duration : 2, x : 0, z : 0,
					onComplete : () => {
						this._scene.remove(this._jewelArr[this.nextJewelIndex(this._currJewelIndex)])
						this._static = true;
					}})
			}
		}

		this.pixelSizeControl.addEventListener("change", (e)=>{
			this._renderPixelatedPass.setPixelSize(this.pixelSizeControl.value)
		})

		this.colorControl.addEventListener("change", (e)=>{
			const color = new THREE.Color(`hsl(${this.colorControl.value}, 100%, 60%)`)
			this._jewelArr[this._currJewelIndex].material.color = color
			this._jewelArr[this._currJewelIndex].material.emissive = color
			// this._jewelArr[this._currJewelIndex].material.specular = color
		})
	}

	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const aspectRatio = window.innerWidth / window.innerHeight;
		const camera = new THREE.OrthographicCamera( - aspectRatio, aspectRatio, 1, - 1, 0.1, 40 );
		// const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.set(5,4,5);
		camera.zoom = 0.2
		camera.lookAt(0,0,0)
        
		this._camera = camera;
        this._scene.add(camera)
	}

	_setupLight() {
		const color = 0xffffff;
		const intensity = 0.5;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(3, 10, 2);
		// light.castShadow = true;
		this._scene.add(light);



		const spotLight = new THREE.SpotLight( 0xfd9f68, 1, 20, Math.PI / 20	, 0.02, 2 );
		spotLight.position.set( 0, 10, 0);
		const target = spotLight.target;
		this._scene.add( target );
		target.position.set( 0, 0, 0 );
		spotLight.castShadow = true;
		this._scene.add( spotLight );
	}
	
	_setupModel() {


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

		const diamondPoints = [
			new THREE.Vector3(0, -1.5, 0),
			new THREE.Vector3(1.5, 0, 0),
			new THREE.Vector3(1, 0.7, 0),
			new THREE.Vector3(0, 0.8, 0)
		  ]


		const jewelArr = [
			new THREE.Mesh(new THREE.IcosahedronGeometry(1,0), new THREE.MeshPhongMaterial({color : 0x865DFF, shininess: 2.5, specular: 0xffffff})),
			// new THREE.Mesh(new THREE.OctahedronGeometry(0.8,1).scale(1,1.5,1), new THREE.MeshPhongMaterial({color : 0x35D0BA, shininess: 2.5, specular: 0xffffff,flatShading: true})),
			new THREE.Mesh(new THREE.IcosahedronGeometry(1,1), new THREE.MeshPhongMaterial({color : 0xFAEEE7, shininess: 2.5, specular: 0xffffff, flatShading: true})),
			new THREE.Mesh(heartGeometry, new THREE.MeshPhongMaterial({color : 0xDF2E38, shininess: 2.5, specular: 0xffffff})),
			new THREE.Mesh(new THREE.LatheGeometry(diamondPoints, 8).scale(0.6,0.6,0.6), new THREE.MeshPhongMaterial({color : 0xC9EEFF, shininess: 2.0, specular: 0xffffff,flatShading: true})),
			new THREE.Mesh(emeraldGeometry2 , new THREE.MeshPhongMaterial({color : 0xF8B500, shininess: 2.5, specular: 0xffffff}))
		]
		this._jewelArr = jewelArr;
		this._currJewelIndex = 0
		jewelArr.forEach(e=>{
			e.material.emissive = e.material.color
			e.castShadow =true;
			e.receiveShadow = true;
		})
		




		function pixelTexture( texture ) {

			texture.minFilter = THREE.NearestFilter;
			texture.magFilter = THREE.NearestFilter;
			texture.generateMipmaps = false;
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			return texture;

		}
		const loader = new THREE.TextureLoader();
		const texChecker = pixelTexture( loader.load( 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/checker.png' ) );
		const texChecker2 = pixelTexture( loader.load( 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/checker.png' ) );
		texChecker.repeat.set( 3, 3 );
		texChecker2.repeat.set( 1.5, 1.5 );


		const cylColor = 0x2C3333;
		const cylRadius = 3;
		const cylHeight = 3;
		const cylMate = new THREE.MeshPhysicalMaterial({map : texChecker2})
        const cylArr = [new THREE.Mesh(new THREE.BoxGeometry(cylRadius,cylHeight,cylRadius), cylMate),
			new THREE.Mesh(new THREE.BoxGeometry(cylRadius,cylHeight,cylRadius), cylMate),
			new THREE.Mesh(new THREE.BoxGeometry(cylRadius,cylHeight,cylRadius), cylMate)]
		const cylPosArr = [new THREE.Vector3(0,-cylHeight / 2,0),
			new THREE.Vector3(0,-cylHeight*7/6,0),
			new THREE.Vector3(0,-cylHeight*11/6,0),
		]
		
		for(let i = 0;i<3;i++){
			cylArr[i].position.set(cylPosArr[i].x, cylPosArr[i].y, cylPosArr[i].z)
			this._scene.add(cylArr[i])
			
			cylArr[i].receiveShadow = true;
		}

		let jewelIndex = 0
		jewelArr[jewelIndex].position.set(0, 1.5, 0)
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
			obj.position.y += Math.sin(this.time * 5 + i) * 0.008
			obj.material.emissiveIntensity = Math.sin( this.time * 5 ) * .2 + 0.3 ;
			// obj.shininess = Math.sin( this.time * 3 ) * .2 + 0.3 ;
			
			// console.log(obj.material.emissiveIntensity)
		}
	}
}

window.onload = function () {
	new App();
};