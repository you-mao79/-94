// /js/model-preview.js - 3D模型预览组件

window.ModelPreview3D = {
    init: null,
    load: null,
    cleanup: null,
    zoomIn: null,
    zoomOut: null,
    reset: null,
    rotateLeft: null,
    rotateRight: null,
    moveUp: null,
    moveDown: null,
    moveLeft: null,
    moveRight: null,
    panUp: null,
    panDown: null,
    panLeft: null,
    panRight: null,
    increaseBrightness: null,
    decreaseBrightness: null,
    resetBrightness: null
};

let currentScene = null;
let currentModel = null;
let animationId = null;
let mixer = null;

function initScene() {
    console.log('🚀 初始化3D预览场景...');

    const container = document.getElementById('preview-3d-container');
    if (!container) {
        console.error('❌ 找不到预览容器 #preview-3d-container');
        return null;
    }

    // 获取容器实际尺寸
    const rect = container.getBoundingClientRect();
    console.log('容器尺寸:', rect.width, 'x', rect.height);

    if (rect.width === 0 || rect.height === 0) {
        console.error('❌ 预览容器尺寸为0');
        return null;
    }

    // 清理现有场景
    cleanupScene();

    try {
        // 检查 Three.js
        if (typeof THREE === 'undefined') {
            throw new Error('Three.js 未加载');
        }
        console.log('✅ Three.js 版本:', THREE.REVISION);

        // 创建场景
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);

        // 创建相机
        const camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 1000);
        camera.position.set(8, 6, 10);

        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(rect.width, rect.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // 添加到容器
        container.innerHTML = '';
        container.appendChild(renderer.domElement);
        console.log('✅ 渲染器创建成功');

        // 创建控制器
        let controls = null;
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.screenSpacePanning = true;
            controls.enablePan = true;
            controls.mouseButtons = {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
            };
            controls.minDistance = 1;
            controls.maxDistance = 50;
            controls.target.set(0, 1, 0);
            controls.update();
            console.log('✅ 控制器创建成功');
        } else {
            console.warn('⚠️ OrbitControls 未加载');
        }

        // 创建灯光
        createLights(scene);
        console.log('✅ 灯光创建成功');

        // 创建参考场景
        createReferenceScene(scene);
        console.log('✅ 参考场景创建成功');

        // 存储场景
        currentScene = { scene, camera, renderer, controls, container };

        // 渲染循环
        function animate() {
            animationId = requestAnimationFrame(animate);
            if (controls) controls.update();
            if (mixer) mixer.update(0.016);
            renderer.render(scene, camera);
        }
        animate();
        console.log('✅ 渲染循环启动');

        // 窗口大小监听
        window.addEventListener('resize', handleResize);

        console.log('🎉 3D场景初始化完成！');
        return currentScene;

    } catch (error) {
        console.error('💥 初始化失败:', error);
        showErrorInContainer('场景初始化失败: ' + error.message);
        return null;
    }
}

function createLights(scene) {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 主光源
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    // 补光
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-10, 10, 5);
    scene.add(fillLight);

    // 轮廓光
    const rimLight = new THREE.SpotLight(0x4facfe, 0.5);
    rimLight.position.set(0, 10, -10);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);

    // 半球光
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
    scene.add(hemiLight);
}

function createReferenceScene(scene) {
    // 地面
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a4e,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // 网格
    const gridHelper = new THREE.GridHelper(50, 50, 0x4facfe, 0x3a3a6e);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // 坐标轴
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    // 展示台（圆盘）
    const platformGeometry = new THREE.CylinderGeometry(2, 2.2, 0.2, 32);
    const platformMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a6e,
        roughness: 0.5,
        metalness: 0.6
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 0.1;
    platform.receiveShadow = true;
    platform.castShadow = true;
    scene.add(platform);

    // 展示台光环
    const ringGeometry = new THREE.TorusGeometry(2.3, 0.05, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x4facfe });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    scene.add(ring);
}

// ==================== 模型加载 ====================

async function loadModel(modelUrl, fileExtension) {
    console.log('📦 加载模型:', modelUrl, '格式:', fileExtension);

    if (!currentScene) {
        console.error('❌ 场景未初始化');
        return false;
    }

    // 清理现有模型
    if (currentModel) {
        currentScene.scene.remove(currentModel);
        currentModel = null;
    }
    if (mixer) {
        mixer = null;
    }

    // 如果没有URL，不加载
    if (!modelUrl) {
        console.log('ℹ️ 无模型文件');
        return true;
    }

    // 修正URL - 添加调试
    let actualUrl = modelUrl;
    console.log('原始URL:', modelUrl);

    // 测试URL的可访问性
    try {
        const testResponse = await fetch(modelUrl, { method: 'HEAD' });
        console.log('URL测试结果:', {
            url: modelUrl,
            status: testResponse.status,
            statusText: testResponse.statusText,
            contentType: testResponse.headers.get('content-type'),
            contentLength: testResponse.headers.get('content-length')
        });

        if (!testResponse.ok) {
            console.warn('原始URL不可访问，尝试修正...');

            // 尝试不同的URL格式
            const testUrls = [
                modelUrl,
                '/models/' + modelUrl.split('/').pop(),
                '/static/models/' + modelUrl.split('/').pop(),
                '/uploads/models/' + modelUrl.split('/').pop()
            ];

            for (const testUrl of testUrls) {
                try {
                    const testResp = await fetch(testUrl, { method: 'HEAD' });
                    if (testResp.ok) {
                        actualUrl = testUrl;
                        console.log('✅ 找到可访问的URL:', actualUrl);
                        break;
                    }
                } catch (e) {
                    // 继续尝试下一个
                }
            }
        }
    } catch (error) {
        console.warn('URL测试失败:', error.message);
    }

    // 根据格式加载
    const ext = (fileExtension || modelUrl.split('.').pop()).toLowerCase();
    console.log('📋 检测到的格式:', ext);

    try {
        console.log('开始加载模型...');
        console.log('最终URL:', actualUrl);

        // 添加加载超时
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('模型加载超时')), 30000)
        );

        const loadPromise = (async () => {
            switch (ext) {
                case 'gltf':
                case 'glb':
                    await loadGLTF(actualUrl);
                    break;
                case 'fbx':
                    await loadFBX(actualUrl);
                    break;
                case 'obj':
                    await loadOBJ(actualUrl);
                    break;
                case 'pmx':
                case 'pmd':
                    await loadMMD(actualUrl);
                    break;
                default:
                    console.warn('⚠️ 未知格式:', ext);
                    return false;
            }
            return true;
        })();

        const result = await Promise.race([loadPromise, timeoutPromise]);
        console.log('✅ 模型加载完成');
        return result;

    } catch (error) {
        console.error('❌ 模型加载失败:', error);
        console.error('错误详情:', {
            message: error.message,
            stack: error.stack,
            url: actualUrl,
            extension: ext
        });

        // 尝试使用简单的几何体作为后备
        try {
            console.log('尝试加载后备几何体...');
            showFallbackModel();
            return true;
        } catch (fallbackError) {
            console.error('后备方案也失败了:', fallbackError);
            return false;
        }
    }
}

// 添加后备模型函数
function showFallbackModel() {
    if (!currentScene) return;

    // 创建简单的立方体作为后备
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
        color: 0x4facfe,
        roughness: 0.5,
        metalness: 0.5
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;

    currentScene.scene.add(cube);
    currentModel = cube;

    // 居中显示
    centerModel();
    console.log('✅ 显示后备模型');
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function loadGLTF(url) {
    return new Promise((resolve, reject) => {
        loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js')
            .then(() => {
                const loader = new THREE.GLTFLoader();
                loader.load(url, (gltf) => {
                    currentModel = gltf.scene;
                    currentModel.traverse(c => {
                        if (c.isMesh) {
                            c.castShadow = true;
                            c.receiveShadow = true;
                        }
                    });
                    if (gltf.animations?.length) {
                        mixer = new THREE.AnimationMixer(currentModel);
                        mixer.clipAction(gltf.animations[0]).play();
                    }
                    currentScene.scene.add(currentModel);
                    centerModel();
                    resolve();
                }, null, reject);
            }).catch(reject);
    });
}

function loadFBX(url) {
    return new Promise((resolve, reject) => {
        loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/FBXLoader.js')
            .then(() => {
                const loader = new THREE.FBXLoader();
                loader.load(url, (fbx) => {
                    currentModel = fbx;
                    currentModel.traverse(c => {
                        if (c.isMesh) {
                            c.castShadow = true;
                            c.receiveShadow = true;
                        }
                    });
                    if (fbx.animations?.length) {
                        mixer = new THREE.AnimationMixer(currentModel);
                        mixer.clipAction(fbx.animations[0]).play();
                    }
                    currentScene.scene.add(currentModel);
                    centerModel();
                    resolve();
                }, null, reject);
            }).catch(reject);
    });
}

function loadOBJ(url) {
    return new Promise((resolve, reject) => {
        loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js')
            .then(() => {
                const loader = new THREE.OBJLoader();
                loader.load(url, (obj) => {
                    currentModel = obj;
                    currentModel.traverse(c => {
                        if (c.isMesh) {
                            c.castShadow = true;
                            c.receiveShadow = true;
                            if (!c.material) {
                                c.material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
                            }
                        }
                    });
                    currentScene.scene.add(currentModel);
                    centerModel();
                    resolve();
                }, null, reject);
            }).catch(reject);
    });
}

function loadMMD(url) {
    return new Promise((resolve, reject) => {
        // 确保 Three.js 加载器可用
        const requiredScripts = [
            'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/MMDLoader.js',
            'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/ammo.wasm.js',
            'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/animation/MMDAnimationHelper.js'
        ];

        Promise.all(requiredScripts.map(src => loadScript(src)))
            .then(() => {
                if (!THREE.MMDLoader) {
                    reject(new Error('MMDLoader 加载失败'));
                    return;
                }

                console.log('✅ MMDLoader 加载成功');

                const loader = new THREE.MMDLoader();

                // PMX 文件通常需要额外的处理
                loader.loadPmx(
                    url,
                    (mesh) => {
                        console.log('✅ PMX 模型加载成功');
                        currentModel = mesh;

                        // 遍历所有子对象设置阴影
                        currentModel.traverse(child => {
                            if (child.isMesh) {
                                child.castShadow = true;
                                child.receiveShadow = true;

                                // 为PMX材质设置更好的显示效果
                                if (child.material) {
                                    child.material.side = THREE.DoubleSide;
                                    child.material.needsUpdate = true;
                                }
                            }
                        });

                        currentScene.scene.add(currentModel);
                        centerModel();
                        resolve();
                    },
                    (progress) => {
                        console.log(`加载进度: ${(progress.loaded / progress.total * 100).toFixed(1)}%`);
                    },
                    (error) => {
                        console.error('❌ PMX 加载失败:', error);
                        reject(error);
                    }
                );
            })
            .catch(reject);
    });
}

function centerModel() {
    if (!currentModel || !currentScene) return;

    const box = new THREE.Box3().setFromObject(currentModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    console.log('📐 模型尺寸:', size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2));

    // 居中模型
    currentModel.position.x = -center.x;
    currentModel.position.y = -center.y + size.y / 2 + 0.2;
    currentModel.position.z = -center.z;

    // 调整相机
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = Math.max(maxDim * 1.8, 6);

    currentScene.camera.position.set(distance * 0.8, distance * 0.6, distance * 0.8);
    currentScene.camera.lookAt(0, size.y / 2, 0);

    if (currentScene.controls) {
        currentScene.controls.target.set(0, size.y / 2, 0);
        currentScene.controls.update();
    }
}

// ==================== 控制功能 ====================

function rotateLeft() {
    if (currentModel) currentModel.rotation.y += Math.PI / 8;
}

function rotateRight() {
    if (currentModel) currentModel.rotation.y -= Math.PI / 8;
}

function moveUp() {
    if (currentModel) currentModel.position.y += 0.2;
}

function moveDown() {
    if (currentModel) currentModel.position.y -= 0.2;
}

function moveLeft() {
    if (currentModel) currentModel.position.x -= 0.2;
}

function moveRight() {
    if (currentModel) currentModel.position.x += 0.2;
}

function panUp() {
    if (currentScene?.controls) {
        currentScene.controls.target.y += 0.5;
        currentScene.camera.position.y += 0.5;
        currentScene.controls.update();
    }
}

function panDown() {
    if (currentScene?.controls) {
        currentScene.controls.target.y -= 0.5;
        currentScene.camera.position.y -= 0.5;
        currentScene.controls.update();
    }
}

function panLeft() {
    if (currentScene?.controls) {
        currentScene.controls.target.x -= 0.5;
        currentScene.camera.position.x -= 0.5;
        currentScene.controls.update();
    }
}

function panRight() {
    if (currentScene?.controls) {
        currentScene.controls.target.x += 0.5;
        currentScene.camera.position.x += 0.5;
        currentScene.controls.update();
    }
}

function zoomIn() {
    if (currentScene?.camera) {
        const dir = new THREE.Vector3();
        currentScene.camera.getWorldDirection(dir);
        currentScene.camera.position.add(dir.multiplyScalar(0.5));
    }
}

function zoomOut() {
    if (currentScene?.camera) {
        const dir = new THREE.Vector3();
        currentScene.camera.getWorldDirection(dir);
        currentScene.camera.position.sub(dir.multiplyScalar(0.5));
    }
}

function resetView() {
    if (!currentScene) return;
    currentScene.camera.position.set(8, 6, 10);
    currentScene.camera.lookAt(0, 1, 0);
    if (currentScene.controls) {
        currentScene.controls.target.set(0, 1, 0);
        currentScene.controls.reset();
    }
}

function increaseBrightness() {
    if (!currentScene?.scene) return;
    currentScene.scene.traverse(child => {
        if (child.isLight && child.intensity !== undefined) {
            child.intensity *= 1.3;
        }
    });
}

function decreaseBrightness() {
    if (!currentScene?.scene) return;
    currentScene.scene.traverse(child => {
        if (child.isLight && child.intensity !== undefined) {
            child.intensity *= 0.7;
        }
    });
}

function resetBrightness() {
    // 重新创建灯光
    if (currentScene?.scene) {
        // 移除所有灯光
        const lights = [];
        currentScene.scene.traverse(child => {
            if (child.isLight) lights.push(child);
        });
        lights.forEach(light => currentScene.scene.remove(light));
        // 重新创建
        createLights(currentScene.scene);
    }
}

function cleanupScene() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    mixer = null;

    if (currentModel) {
        if (currentScene) currentScene.scene.remove(currentModel);
        currentModel = null;
    }

    if (currentScene) {
        window.removeEventListener('resize', handleResize);
        if (currentScene.controls) currentScene.controls.dispose();
        if (currentScene.renderer) {
            currentScene.renderer.dispose();
            if (currentScene.renderer.domElement?.parentNode === currentScene.container) {
                currentScene.container.removeChild(currentScene.renderer.domElement);
            }
        }
        currentScene = null;
    }
}

function handleResize() {
    if (!currentScene?.container) return;
    const { camera, renderer, container } = currentScene;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height);
}

function showErrorInContainer(message) {
    const container = document.getElementById('preview-3d-container');
    if (container) {
        container.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; 
                        background: linear-gradient(135deg, #2a2a3a 0%, #3a3a5a 100%); color: white; text-align: center; padding: 30px;">
                <i class="bi bi-exclamation-triangle" style="font-size: 48px; color: #ff6b6b; margin-bottom: 15px;"></i>
                <h3 style="margin: 0 0 10px 0;">3D场景加载失败</h3>
                <p style="margin: 0; color: #ccc;">${message}</p>
            </div>`;
    }
}

// 导出
window.ModelPreview3D.init = initScene;
window.ModelPreview3D.load = loadModel;
window.ModelPreview3D.cleanup = cleanupScene;
window.ModelPreview3D.zoomIn = zoomIn;
window.ModelPreview3D.zoomOut = zoomOut;
window.ModelPreview3D.reset = resetView;
window.ModelPreview3D.rotateLeft = rotateLeft;
window.ModelPreview3D.rotateRight = rotateRight;
window.ModelPreview3D.moveUp = moveUp;
window.ModelPreview3D.moveDown = moveDown;
window.ModelPreview3D.moveLeft = moveLeft;
window.ModelPreview3D.moveRight = moveRight;
window.ModelPreview3D.panUp = panUp;
window.ModelPreview3D.panDown = panDown;
window.ModelPreview3D.panLeft = panLeft;
window.ModelPreview3D.panRight = panRight;
window.ModelPreview3D.increaseBrightness = increaseBrightness;
window.ModelPreview3D.decreaseBrightness = decreaseBrightness;
window.ModelPreview3D.resetBrightness = resetBrightness;

console.log('🚀 ModelPreview3D 已加载');