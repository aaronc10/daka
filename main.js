import * as THREE from 'three';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';


// const canvas = document.querySelector('canvas.webgl')

const sizes = {
width: window.innerWidth,
height: window.innerHeight
}

window.addEventListener('resize', () => 
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 43.78, window.innerWidth / window.innerHeight, 0.1, 1000 );

// array containing the camera switching positons
const positions = [
    { cameraPos: {x:-1.2175, y:-1.1157,z:2.7272}, target:{x:0, y:0, z:0}}, //pos1
    { cameraPos: {x: -1.2175, y:-1.1157, z: 1.9772}, target:{x:24, y:0, z:0}}, //pos2
    { cameraPos: {x:-1.2175, y:-1.1157, z:1.9722}, target:{x:-33, y:0, z:0}}, //pos3
    { cameraPos: {x:-1.2175,y:-1.1157,z:1.0472}, target:{x:-2,y:0,z:0}}, //pos4
    { cameraPos: {x:-1.2175,y:-1.1157,z:0.2028}, target:{x:-17,y:0,z:0}}, //pos5
]

console.log(positions[0].cameraPos.x);

let cameraView = 0; 


window.addEventListener('mousedown', function(){
  cameraView +=1;
  if(cameraView > 4) cameraView = 4;
  if(cameraView < 0 ) cameraView = 0;
  console.log(cameraView);
  triggerAnimation(cameraView);
})



function triggerAnimation(index){

 gsap.to (camera.position,{
    x: positions[index].cameraPos.x,
    y: positions[index].cameraPos.y,
    z: positions[index].cameraPos.z,
    duration: 2,
    ease: 'Power3.inOut',
  })

  // gsap.to (controls.target,{
  //   x: positions[index].target.x,
  //   y: positions[index].target.y,
  //   z: positions[index].target.z,
  //   duration: 2,
  //   ease: 'Power3.inOut',
  //  })

} 


const geometry = new THREE.CircleGeometry( .02, 24 );
const material = new THREE.MeshBasicMaterial( { color: 0xffffff } ); 
const circle1 = new THREE.Mesh( geometry, material ); 
scene.add( circle1 );
circle1.position.x=-1.4542;
circle1.position.y=-1.143;
circle1.position.z=0.9469;


camera.position.x = positions[0].cameraPos.x;
camera.position.y = positions[0].cameraPos.y;
camera.position.z = positions[0].cameraPos.z;

// camera.rotateX = -1.24
// camera.rotateY = -1.24
// camera.rotateZ = -0.03

//Mouse Rotation Handler

export const handleMouseMovement = (mouseX, mouseY, cameraOrientationState) => {
    const now = performance.now() 

    cameraOrientationState.lastMouseMoveTime = now;

    const rotationScale = 0.05;

    cameraOrientationState.pitchAngle = -(mouseY * rotationScale) * Math.PI; //Remove negative if mouse rotation is inverted
    cameraOrientationState.yawAngle = -(mouseX * rotationScale) * Math.PI; //Remove negative if mouse rotation is inverted

    cameraOrientationState.startingPitchAngleForCurrentCoordinates = cameraOrientationState.previousPitchAngle;
    cameraOrientationState.startingYawAngleForCurrentCoordinates = cameraOrientationState.previousYawAngle;
}

export const handleCameraRotation = (camera, cameraOrientationState) => {
    const now = performance.now()
  
    const timeElapsed = now - cameraOrientationState.lastMouseMoveTime

    if( timeElapsed < cameraOrientationState.movementDuration){

        const timeLeftPercentage = timeElapsed / cameraOrientationState.movementDuration;
        const minimumDegreeOfChange = 0.5;
        
        // Calculate the interpolation factor based on the time elapsed since the last mouse movement
        let interpolationFactor = Math.max(timeLeftPercentage, minimumDegreeOfChange); 

        // Linearly interpolate the pitch and yaw angles
        const interpolatedPitchAngle = (1 - interpolationFactor) * cameraOrientationState.startingPitchAngleForCurrentCoordinates + interpolationFactor * cameraOrientationState.pitchAngle; //The max value for t will be one, since the time elapsed is the amount of time since the last update. And t will never be more than 1. It goes from 0 to 1 sort of like 0% of elapsed time cycle to 100%
        const interpolatedYawAngle = (1 - interpolationFactor) * cameraOrientationState.startingYawAngleForCurrentCoordinates + interpolationFactor * cameraOrientationState.yawAngle;
        

        camera.rotation.x = interpolatedPitchAngle;
        camera.rotation.y = interpolatedYawAngle;

        // update the previous pitch and yaw angles
        cameraOrientationState.previousPitchAngle = interpolatedPitchAngle;
        cameraOrientationState.previousYawAngle = interpolatedYawAngle;
    }}





const loader = new GLTFLoader();

loader.load(
	// resource URL
	'/Models/LiaFerreiro_CAVE_2.gltf',
	// called when the resource is loaded
	function ( gltf ) {

		scene.add( gltf.scene );

		gltf.animations; // Array<THREE.AnimationClip>
		gltf.scene; // THREE.Group
		gltf.scenes; // Array<THREE.Group>
		gltf.cameras ; // Array<THREE.Camera>
		gltf.asset; // Object

	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);

const hdrTextureURL = new URL('public/Models/tex/studio_small_09_4k.hdr', import.meta.url);

const texLoader = new RGBELoader();
texLoader.load(hdrTextureURL, function(texture) {
    
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture; 
    scene.environment = texture;
});




//retrieve list of all cameras
function retrieveListOfCameras(scene){
    // Get a list of all cameras in the scene
    scene.traverse(function (object) {
      if (object.isCamera) {
        cameraList.push(object);
      }
    });
  
    //Set the camera to the first value in the list of cameras
    camera = cameraList[0];
  
    updateCameraAspect(camera);}



//Create a variable to keep track of mouse position
const mouse = new THREE.Vector2();

class CameraOrientationState {
    constructor() {
      this.pitchAngle = 0;
      this.yawAngle = 0;
      this.startingPitchAngleForCurrentCoordinates = 0;
      this.startingYawAngleForCurrentCoordinates = 0;
      this.previousPitchAngle = 0;
      this.previousYawAngle = 0;
      this.lastMouseMoveTime = 0;
      this.movementDuration = 100;
    }
  }
  
  export default CameraOrientationState;

//Set up the default cameraOrientationStateObject
let cameraOrientationState = new CameraOrientationState();

//A function to be called every time the mouse moves
function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (event.clientY / window.innerHeight) * 2 - 1;

  handleMouseMovement(mouse.x, mouse.y, cameraOrientationState);
}

//Add listener to call onMouseMove every time the mouse moves in the browser window
document.addEventListener('mousemove', onMouseMove, false);


function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );

    //Every scene handles mouse movement
    handleCameraRotation(camera, cameraOrientationState);
};

animate();
