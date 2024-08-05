import * as THREE from "three";
import { OrbitControls } from 'https://unpkg.com/three@0.156.1/examples/jsm/controls/OrbitControls.js';
// import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
// import { GLTFLoader } from '/three/addons/loaders/GLTFLoader.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.156.1/examples/jsm/loaders/GLTFLoader.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

const loader = new GLTFLoader();

loader.load( './311-gameroom.glb', function ( gltf ) {

	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

camera.position.set(8, 8, 5);
controls.update();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// // initialize the scene
// const scene = new THREE.Scene();

// // add objects to the scene
// const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
// const cubeMaterial = new THREE.MeshBasicMaterial({ color: "red" });

// const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
// scene.add(cubeMesh);

// // initialize the camera
// const camera = new THREE.PerspectiveCamera(
//   35,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   200
// );
// camera.position.z = 5;

// // initialize the renderer
// const canvas = document.querySelector("canvas.threejs");
// const renderer = new THREE.WebGLRenderer({
//   canvas: canvas,
//   antialias: true,
// });
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// // instantiate the controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// // controls.autoRotate = true;

// window.addEventListener('resize', () =>{
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix()
//   renderer.setSize(window.innerWidth, window.innerHeight);
// })

// // render the scene
// const renderloop = () => {
//   controls.update();  
//   renderer.render(scene, camera);
//   window.requestAnimationFrame(renderloop);
// };

// renderloop();
