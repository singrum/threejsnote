import * as THREE from '../node_modules/three/build/three.module.js';
import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPixelatedPass.js';
class App {
	constructor() {
		document.querySelector("body").innerHTML = 
		`<div id="webgl_container"></div>
		<div id = "score">score : 0</div>
		<div class="modal fade" id="loseModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
			<div class="modal-dialog modal-dialog-centered">
				<div class="modal-content" style="background-color: rgba(0,0,0,0); border-color: rgba(0,0,0,0);">
					<div class="modal-body" >
						<div style ="font-size: 40px; color : #ffffff">Game Over!</div>
						<br>
						<button type="button" class="btn btn-primary" id="restart" >restart</button>
					</div>
				</div>
			</div>
    	</div>`
		document.querySelector("#restart").addEventListener("click", ()=>{
			location.reload()
		})
		this.once = true
		const scoreBoard = document.querySelector("#score");
		this.scoreBoard = scoreBoard
		this.score = 0;
		const divContainer = document.querySelector("#webgl_container");
		this._divContainer = divContainer;
		this.currDirection = 0;
		this.initDirection;
		this.xDown
		this.yDown
		this.flag = 1;
		this.len = {"x" : 1, "y" : 1, "z" : 1};
		this.coordinate = {"x" : 0, "z" : 0};
		this.appleCoordinate = {"x" : this.rangeRandom(), "z" : this.rangeRandom()};
		this.time = 0;
		this.initMatrix = new THREE.Matrix4();
		this.baseWidth = 29
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		
		divContainer.appendChild(renderer.domElement);
		this._renderer = renderer;
		renderer.shadowMap.enabled = true;
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio( window.devicePixelRatio );
		const scene = new THREE.Scene();
		this._scene = scene;
		this._setupCamera();
		this._setupLight();
		this._setupModel();
		this._setupBackground();
		this._setupGameControls();
		window.onresize = this.resize.bind(this);


        
        const composer = new EffectComposer( renderer );
        const renderPixelatedPass = new RenderPixelatedPass( 6, this._scene, this._camera );
        composer.addPass( renderPixelatedPass );
        this._composer = composer
        renderPixelatedPass.setPixelSize(2);



		this.resize();
		requestAnimationFrame(this.render.bind(this));

		

		
	}
	_setupGameControls(){
        document.addEventListener('touchstart', this._handleTouchStart.bind(this), false);        
        document.addEventListener('touchmove', this._handleTouchMove.bind(this), false);
        document.addEventListener('keydown', this._keydownEvent.bind(this), false); 
        this.xDown = null;                                                        
        this.yDown = null;
	}
    _getTouches(evt) {
        return evt.touches || evt.originalEvent.touches; 
    }                                                     
                                                                                
    _handleTouchStart(evt) {
		const firstTouch = this._getTouches(evt)[0];                                      
		this.xDown = firstTouch.clientX;                                      
		this.yDown = firstTouch.clientY;                              
    }                                               
                                                                                
    _handleTouchMove(evt) {
		if ( ! this.xDown || ! this.yDown ) {
			return;
		}

		let xUp = evt.touches[0].clientX;                                    
		let yUp = evt.touches[0].clientY;

		let xDiff = this.xDown - xUp;
		let yDiff = this.yDown - yUp;
																			
		if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
			if ( xDiff > 0 ) {
				this.currDirection = 3; //-x
			} else {
				this.currDirection = 2; //+x
			}                       
		} else {
			if ( yDiff > 0 ) {
				this.currDirection = 0; //-z
			} else { 
				this.currDirection = 1; //+z
			}                                                                 
		}
		/* reset values */
		this.xDown = null;
		this.yDown = null;     
		
    }
    _keydownEvent(e){
		if(e.keyCode === 37){
			this.currDirection = 3;
		}
		else if(e.keyCode === 38){
			this.currDirection = 0;
		}
		else if(e.keyCode === 39){
			this.currDirection = 2;
		}
		else if(e.keyCode === 40){
			this.currDirection = 1;
		}
    }
	


	_setupBackground(){
		this._scene.background = new THREE.Color(0xc4e4fe)
		this._scene.fog = new THREE.FogExp2(0xc4e4fe, 0.01)
	}



	_setupCamera() {
		const width = this._divContainer.clientWidth;
		const height = this._divContainer.clientHeight;
		const camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100);
		camera.position.set(0, 40, 40)
		camera.zoom = 0.32
		camera.lookAt(0,0,0)
		this._camera = camera;
	}

	_setupLight() {
		const auxLight = new THREE.DirectionalLight(0xffffff, 0.7);
		auxLight.position.set(20, 40, 30);
		this._scene.add(auxLight);



		const color = 0xffffff;
		const intensity = 0.6;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(20, 40, 30);
		this._scene.add(light);
		light.castShadow = true;
		light.shadow.mapSize.width = light.shadow.mapSize.height = 1024
		light.shadow.radius = 5


		light.shadow.camera.top = light.shadow.camera.right = 20;
		light.shadow.camera.bottom = light.shadow.camera.left = -20;
		

	}

	_setupModel() {
		const baseHeight = 100;
		const baseGeometry = new THREE.BoxGeometry(this.baseWidth,baseHeight,this.baseWidth);
		const baseMaterial = new THREE.MeshPhysicalMaterial({
			color: 0x37FF33,
			emissive: 0x000000,
			roughness: 1,
			metalness: 0,
			wireframe: false,
			flatShading: false,
			clearcoat:1,
			clearcoatRoughness:0
		})
		const base = new THREE.Mesh(baseGeometry, baseMaterial);
		base.position.set(0, - baseHeight /2 )
		this._scene.add(base);
		base.receiveShadow = true;
		this.len.x = 1;this.len.y = 1;this.len.z = 1;
        const cubeGeometry = new THREE.BoxGeometry(1,1,1);
        const cubeMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x33CBFF,
			emissive: 0x000000,
			roughness: 1,
			metalness: 0,
			wireframe: false,
			flatShading: false,
			clearcoat:1,
			clearcoatRoughness:0
        })
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(0,0.5,0);
        this._scene.add(cube)
		cube.castShadow = true
		cube.matrixAutoUpdate = false
		cube.matrix = new THREE.Matrix4().makeTranslation(0, this.len.y / 2, 0)
		this._cube = cube;


		const appleGeometry = new THREE.SphereGeometry(0.5,10,10);
		const appleMaterial = new THREE.MeshPhysicalMaterial({
			color: 0xff0000,
			emissive: 0xff0000,
			roughness: 1,
			metalness: 0,
			wireframe: false,
			flatShading: false,
			clearcoat:1,
			clearcoatRoughness:0
		})
		const apple = new THREE.Mesh(appleGeometry,appleMaterial);
		this._scene.add(apple)
		apple.castShadow = true
		apple.matrixAutoUpdate = false
		apple.matrix = new THREE.Matrix4().makeTranslation(this.appleCoordinate.x,0.5,this.appleCoordinate.z)
		this._apple = apple;


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
		// this._renderer.render(this._scene, this._camera);
		this.update();
		requestAnimationFrame(this.render.bind(this));
	}

	update() {
		this.time += 0.07;
		switch(this.flag){
			
			case 0:
				// roll
				this._rotate(this.initMatrix, this.time, this.initDirection)
				if(this.time >= Math.PI/2){
					this.flag = 1;
					this.time = 0;
					this._setLenAndCoordinate(this.initDirection)
					
					break;
				}
				break;
			case 1:
				// check
				
				this.initDirection = this.currDirection;
				
				this.flag = 0;

				if(this._checkEatApple()){
					this.score++;
					this.scoreBoard.innerHTML = `score : ${this.score}`;
					this._makeNewApple()
					this.flag = 2;
				}
				if(this._checkFall()){
					this.flag = 3;
				}
				break;
			case 2:
				// grow
				
				this._cube.matrix = this.matmul(new THREE.Matrix4().makeScale(1,(this.len.y + this.time)/this.len.y ,1),
					new THREE.Matrix4().makeTranslation(this.coordinate.x,this.len.y / 2, this.coordinate.z),
					this.initMatrix)
				
				
				if (this.time >= 1){
					this.time = 0;
					this._cube.matrix = this.matmul(new THREE.Matrix4().makeScale(1,(this.len.y + 1)/this.len.y,1),
						new THREE.Matrix4().makeTranslation(this.coordinate.x,this.len.y / 2, this.coordinate.z),
						this.initMatrix)
					this.initMatrix = this.matmul(new THREE.Matrix4().makeScale(1,(this.len.y + 1)/this.len.y,1), this.initMatrix);
					this.len.y += 1;
					this.flag = 0;
					this.initDirection = this.currDirection;
				}
				
				break;
			case 3:
				this._cube.matrix = this.matmul(new THREE.Matrix4().makeTranslation(this.coordinate.x,this.len.y / 2 - 3*this.time * this.time,this.coordinate.z),
				this.initMatrix)
				this._showModal();
		}
	}

	_showModal(){
		if(!this.once) return;
		const myModalEl = new bootstrap.Modal(document.querySelector('#loseModal'));
		myModalEl.show()
		this.once = !this.once
	}
	_checkFall(){
		if (this.coordinate.x + this.len.x / 2 <= -this.baseWidth / 2 ||
		this.coordinate.x - this.len.x / 2 >= this.baseWidth / 2 ||
		this.coordinate.z + this.len.x / 2 <= -this.baseWidth / 2 ||
		this.coordinate.z - this.len.x / 2 >= this.baseWidth / 2)
		return true;
	}
	_checkEatApple(){
		if (this.coordinate.x - this.len.x / 2 <= this.appleCoordinate.x &&
			this.coordinate.x + this.len.x / 2 >= this.appleCoordinate.x &&
			this.coordinate.z - this.len.z / 2 <= this.appleCoordinate.z &&
			this.coordinate.z + this.len.z / 2 >= this.appleCoordinate.z)
			return true;
		
	}
	rangeRandom(){
		return Math.floor(Math.random() * 29) - (29 - 1)/2;
	}
	_makeNewApple(){	
		[this.appleCoordinate.x, this.appleCoordinate.z] = [this.rangeRandom(), this.rangeRandom()]
		this._apple.matrix = new THREE.Matrix4().makeTranslation(this.appleCoordinate.x,0.5,this.appleCoordinate.z)
	}
	_setLenAndCoordinate(direction){
		switch(direction){
			case 0:
				[this.len.z, this.len.y] = [this.len.y, this.len.z]
				this.coordinate.z = this.coordinate.z - this.len.z / 2 - this.len.y / 2		
				this.initMatrix = this.matmul(new THREE.Matrix4().makeRotationX(Math.PI/2), this.initMatrix);
				break;
			case 1:
				[this.len.z, this.len.y] = [this.len.y, this.len.z]
				this.coordinate.z = this.coordinate.z + this.len.z / 2 + this.len.y / 2		
				this.initMatrix = this.matmul(new THREE.Matrix4().makeRotationX(Math.PI/2), this.initMatrix);
				break;
			case 2:
				[this.len.x, this.len.y] = [this.len.y, this.len.x]
				this.coordinate.x = this.coordinate.x + this.len.x / 2 + this.len.y / 2		
				this.initMatrix = this.matmul(new THREE.Matrix4().makeRotationZ(Math.PI/2), this.initMatrix);
				break;
			case 3:
				[this.len.x, this.len.y] = [this.len.y, this.len.x]
				this.coordinate.x = this.coordinate.x - this.len.x / 2 - this.len.y / 2		
				this.initMatrix = this.matmul(new THREE.Matrix4().makeRotationZ(Math.PI/2), this.initMatrix);
				break;
		}
	}
	_rotate(initMatrix, angle, direction){
		switch(direction){
			case 0:
				
				this._cube.matrix = this.matmul(new THREE.Matrix4().makeTranslation(this.coordinate.x,0,this.coordinate.z - this.len.z / 2),
				new THREE.Matrix4().makeRotationX(-angle),
				new THREE.Matrix4().makeTranslation(0,this.len.y / 2,this.len.z / 2),
				initMatrix)
				
				break;
			case 1:
				this._cube.matrix = this.matmul(new THREE.Matrix4().makeTranslation(this.coordinate.x,0,this.coordinate.z + this.len.z / 2),
				new THREE.Matrix4().makeRotationX(angle),
				new THREE.Matrix4().makeTranslation(0,this.len.y /2 ,-this.len.z / 2),
				initMatrix)
				break;
			case 2:
				this._cube.matrix = this.matmul(new THREE.Matrix4().makeTranslation(this.coordinate.x + this.len.x / 2,0,this.coordinate.z),
				new THREE.Matrix4().makeRotationZ(-angle),
				new THREE.Matrix4().makeTranslation(-this.len.x / 2,this.len.y /2 ,0),
				initMatrix)
				break;
			case 3:
				this._cube.matrix = this.matmul(new THREE.Matrix4().makeTranslation(this.coordinate.x - this.len.x / 2,0,this.coordinate.z),
				new THREE.Matrix4().makeRotationZ(angle),
				new THREE.Matrix4().makeTranslation(this.len.x / 2,this.len.y /2 ,0),
				initMatrix)
				break;
		}
	}

	matmul(...mats){
		return mats.reduce((prev, curr) => prev.multiply(curr))
	}
}



window.onload = function () {

	new App();
};