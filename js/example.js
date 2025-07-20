import * as THREE from 'three'
import Stats from './libs/threejs/stats.module.js'
import { GLTFLoader } from './libs/threejs/GLTFLoader.js';

import TouchControls from './TouchControls.js'


let renderer, camera, scene, controls, stats
let sceneObject, intersected

let width
let height
let aspect
let viewAngle = 45
let near = 1
let far = 10000
let container = document.getElementById('container3d')


// Start the scene
startScene(container)
// render()

function startScene(container) {
    width = window.innerWidth - 50
    height = window.innerHeight - 80
    aspect = width / height

    scene = new THREE.Scene()

    // Load scene/model
    const loader = new GLTFLoader().setPath( 'https://storage.googleapis.com/pearl-artifacts-cdn/' )
    loader.load('museum_test_1blend.gltf', (gltf) => {
        console.log(gltf)
        sceneObject = gltf.scene
        sceneObject.scale.set(2, 2, 2)
        sceneObject.position.set(0, 0, 0)
        scene.add(sceneObject)

        addLights()
        addControls()

        render()
    })

    renderer = new THREE.WebGLRenderer({antialias: true})
    // renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1
	renderer.outputEncoding = THREE.sRGBEncoding
    container.append(renderer.domElement)

    stats = new Stats()
    // stats.domElement.style.position = 'absolute'
    stats.domElement.style.top = '10px'
    stats.domElement.style.left = ''
    stats.domElement.style.right = '10px'
    document.body.append(stats.domElement)

    window.addEventListener('resize', onWindowResize)
}

function addLights() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
directionalLight.position.set(-165.01445413093128, 539.25437520156, -216.11550290035518);
ambientLight.position.set(86.73729926481377, 140.41787049838712, 17.54735020570745);
scene.add(ambientLight);
scene.add(directionalLight);
}

function addControls() {
    // Camera
    camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far)

    // Controls
    let options = {
        delta: 0.75,           // coefficient of movement
        moveSpeed: 0.9,        // speed of movement
        rotationSpeed: 0.002,  // coefficient of rotation
        maxPitch: 55,          // max camera pitch angle
        hitTest: true,         // stop on hitting objects
        hitTestDistance: 40    // distance to test for hit
    }
    controls = new TouchControls(container.parentNode, camera, options)
    controls.setPosition(84, 45, 288)
    controls.addToScene(scene)
    // controls.setRotation(0.15, -0.15)
}

function render() {
    requestAnimationFrame(render)
    controls.update()
    stats.update()

    // Mouse hit-testing:
    let vector = new THREE.Vector3(controls.mouse.x, controls.mouse.y, 1)
    vector.unproject(camera)

    let raycaster = new THREE.Raycaster(controls.fpsBody.position, vector.sub(controls.fpsBody.position).normalize())
    let intersects = raycaster.intersectObjects(sceneObject.children)
    if (intersects.length > 0) {
        // console.log(intersects)
        if (intersected != intersects[0].object) {
            if (intersected) intersected.material.emissive.setHex(intersected.currentHex)
            intersected = intersects[0].object
            if (intersected.name != 'Base_Plane') {
                intersected.currentHex = intersected.material.emissive.getHex()
                intersected.material.emissive.setHex(0xdd0090)
            }
        }
    } else {
        if (intersected) intersected.material.emissive.setHex(intersected.currentHex)
        intersected = null
    }

    renderer.render(scene, camera)
}

function onWindowResize() {
    width = window.innerWidth - 50
    height = window.innerHeight - 80

    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
}
