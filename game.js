let scene, camera, renderer, player, dinosaur;
let health = 5;
let maxHealth = 100;
let attackPower = 1;
let dinosaurHealth = 100;
let level = 1;
let coins = 0;  // 初始金币为0
let bullets = [];
let bulletSpeed = 0.5;
let grenadeCount = 1;  // 初始手榴弹数量为1

// 修改跳跃相关变量
let isJumping = false;
let jumpVelocity = 0;
const jumpHeight = 6;  // 跳跃高度
const gravity = 0.05;   // 当前重力加速度为0.05

// 添加按键状态对象
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    ' ': false,  // 空格键
    z: false,    // 小写z
    Z: false,    // 大写Z
    'g': false,    // 手雷按键
    'G': false,
    'b': false,  // 商城按键
    'B': false
};

// 添加射击冷却相关变量
let canShoot = true;
const shootCooldown = 500; // 射击冷却时间（毫秒）

// 修改基础移动速度
const moveSpeed = 0.1;  // 从0.1375改为0.1

// 添加地面范围限制
const groundLimit = 24; // 地面大小是50，留一点边距

// 添加恐龙相关变量
const dinosaurSpeed = 0.1375;  // 恐龙速度保持原来的速度
let dinosaurCanMove = true; // 控制恐龙是否可以移动

// 修改手雷相关变量
let grenades = [];
const grenadeSpeed = 0.3;
const grenadeDamage = 10;  // 基础伤害值为10
let canThrowGrenade = true;
const grenadeCooldown = 2000; // 2秒冷却时间

// 在文件开头添加音频变量
let gunshotSound, explosionSound;

// 添加火球相关变量
let fireballs = [];
const fireballSpeed = bulletSpeed * 0.5;  // 火球速度是子弹速度的一半
let canShootFireball = true;
const fireballCooldown = 2000;  // 2秒冷却时间

// 初始化场景
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 创建地面（草地颜色）
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2d5a27,  // 深草绿色
        shininess: 10,
        side: THREE.DoubleSide 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    scene.add(ground);

    // 创建玩家（人类形态）
    const playerGroup = new THREE.Group();

    // 头部
    const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);  // 头部尺寸
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffccaa });  // 肤色
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.8;  // 头部位置
    playerGroup.add(head);

    // 头发
    const hairGeometry = new THREE.BoxGeometry(0.42, 0.15, 0.42);  // 头发尺寸
    const hairMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });  // 黑色头发
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 0.2; // 降低位置，更贴近头部
    head.add(hair);

    // 眼睛
    const eyeGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.08);  // 眼睛尺寸
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });  // 黑色眼睛
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.1, 0, 0.2);
    head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.1, 0, 0.2);
    head.add(rightEye);

    // 嘴巴
    const mouthGeometry = new THREE.BoxGeometry(0.1, 0.03, 0.08);  // 嘴巴尺寸
    const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });  // 褐色
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.1, 0.2);
    head.add(mouth);

    // 身体
    const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.3);  // 身体尺寸
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });  // 红色衣服
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.2;
    playerGroup.add(body);

    // 左腿
    const legGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);  // 腿部尺寸
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });  // 蓝色裤子
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.15, -0.3, 0);
    playerGroup.add(leftLeg);

    // 左鞋
    const shoeGeometry = new THREE.BoxGeometry(0.22, 0.1, 0.3);  // 鞋子尺寸
    const shoeMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });  // 深灰色鞋子
    const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    leftShoe.position.y = -0.35;
    leftShoe.position.z = 0.05;
    leftLeg.add(leftShoe);

    // 右腿
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.15, -0.3, 0);
    playerGroup.add(rightLeg);

    // 右鞋
    const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
    rightShoe.position.y = -0.35;
    rightShoe.position.z = 0.05;
    rightLeg.add(rightShoe);

    // 左手臂
    const armGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);  // 手臂尺寸
    const leftArm = new THREE.Mesh(armGeometry, headMaterial);  // 使用与头部相同的肤色材质
    leftArm.position.set(-0.4, 0.3, 0);
    playerGroup.add(leftArm);

    // 右手臂（持枪的手）
    const rightArm = new THREE.Mesh(armGeometry, headMaterial);
    rightArm.position.set(0.4, 0.3, 0);
    playerGroup.add(rightArm);

    // 添加手枪到右手
    const gunGroup = new THREE.Group();

    // 枪身
    const gunBodyGeometry = new THREE.BoxGeometry(0.4, 0.15, 0.15);
    const gunMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const gunBody = new THREE.Mesh(gunBodyGeometry, gunMaterial);
    gunGroup.add(gunBody);

    // 枪管
    const barrelGeometry = new THREE.BoxGeometry(0.3, 0.12, 0.12);
    const barrel = new THREE.Mesh(barrelGeometry, gunMaterial);
    barrel.position.x = 0.3;  // 枪管向前延伸
    gunGroup.add(barrel);

    // 握把
    const gripGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.15);
    const grip = new THREE.Mesh(gripGeometry, gunMaterial);
    grip.position.y = -0.2;  // 握把向下延伸
    gunGroup.add(grip);

    // 将手枪添加到右手位置
    gunGroup.position.set(0.6, 0.3, 0.2);
    rightArm.add(gunGroup);

    player = playerGroup;
    scene.add(player);

    // 创建恐龙（更详细的恐龙形态）
    const dinosaurGroup = new THREE.Group();

    // 身体躯干
    const dinoBodyGeometry = new THREE.BoxGeometry(1.5, 1.125, 2.25);  // 原尺寸的0.75倍 (2*0.75=1.5, 1.5*0.75=1.125, 3*0.75=2.25)
    const dinosaurMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 }); // 深绿色
    const dinoBody = new THREE.Mesh(dinoBodyGeometry, dinosaurMaterial);
    dinoBody.position.y = 1;
    dinosaurGroup.add(dinoBody);

    // 头部
    const dinoHeadGeometry = new THREE.BoxGeometry(0.8, 0.8, 1.2);
    const dinoHead = new THREE.Mesh(dinoHeadGeometry, dinosaurMaterial);
    dinoHead.position.set(0, 1.8, 1.8);
    dinosaurGroup.add(dinoHead);

    // 眼睛
    const dinoEyeGeometry = new THREE.SphereGeometry(0.15);  // 增大眼睛尺寸
    const dinoEyeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 1,    // 增加发光强度
        shininess: 100           // 增加光泽度
    }); 

    const dinoLeftEye = new THREE.Mesh(dinoEyeGeometry, dinoEyeMaterial);
    dinoLeftEye.position.set(-0.2, 1.9, 2.4);  // 调整z轴位置，使眼睛更突出
    dinosaurGroup.add(dinoLeftEye);

    const dinoRightEye = new THREE.Mesh(dinoEyeGeometry, dinoEyeMaterial);
    dinoRightEye.position.set(0.2, 1.9, 2.4);  // 调整z轴位置，使眼睛更突出
    dinosaurGroup.add(dinoRightEye);

    // 嘴巴（上颌）
    const dinoUpperJawGeometry = new THREE.BoxGeometry(0.6, 0.3, 1.0);
    const dinoUpperJaw = new THREE.Mesh(dinoUpperJawGeometry, dinosaurMaterial);
    dinoUpperJaw.position.set(0, 1.7, 2.5);
    dinosaurGroup.add(dinoUpperJaw);

    // 嘴巴（下颌）
    const dinoLowerJawGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.9);
    const dinoLowerJaw = new THREE.Mesh(dinoLowerJawGeometry, dinosaurMaterial);
    dinoLowerJaw.position.set(0, 1.5, 2.5);
    dinosaurGroup.add(dinoLowerJaw);

    // 牙齿
    const dinoTeethGeometry = new THREE.ConeGeometry(0.08, 0.2, 4);  // 增大牙齿尺寸
    const dinoTeethMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        shininess: 100,  // 增加光泽度
        emissive: 0xaaaaaa,  // 添加发光效果
        emissiveIntensity: 0.2
    });

    // 上排牙齿
    for(let i = 0; i < 6; i++) {
        const tooth = new THREE.Mesh(dinoTeethGeometry, dinoTeethMaterial);
        tooth.rotation.x = Math.PI;  // 朝下
        tooth.position.set(-0.25 + i * 0.1, 1.55, 2.9);  // 调整位置，使牙齿更突出
        dinosaurGroup.add(tooth);
    }

    // 添加下排牙齿
    for(let i = 0; i < 6; i++) {
        const tooth = new THREE.Mesh(dinoTeethGeometry, dinoTeethMaterial);
        tooth.position.set(-0.25 + i * 0.1, 1.45, 2.9);  // 调整位置
        dinosaurGroup.add(tooth);
    }

    // 前爪（两只）
    const dinoClawGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.4);
    const dinoLeftClaw = new THREE.Mesh(dinoClawGeometry, dinosaurMaterial);
    dinoLeftClaw.position.set(-1.2, 1.0, 0.8);
    dinosaurGroup.add(dinoLeftClaw);

    // 左前爪尖端
    const dinoClawTipGeometry = new THREE.ConeGeometry(0.1, 0.3, 4);
    const dinoClawTipMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
    const leftClawTip1 = new THREE.Mesh(dinoClawTipGeometry, dinoClawTipMaterial);
    leftClawTip1.rotation.x = -Math.PI / 2;
    leftClawTip1.position.set(0, -0.5, 0.1);
    dinoLeftClaw.add(leftClawTip1);

    const dinoRightClaw = new THREE.Mesh(dinoClawGeometry, dinosaurMaterial);
    dinoRightClaw.position.set(1.2, 1.0, 0.8);
    dinosaurGroup.add(dinoRightClaw);

    // 右前爪尖端
    const rightClawTip1 = new THREE.Mesh(dinoClawTipGeometry, dinoClawTipMaterial);
    rightClawTip1.rotation.x = -Math.PI / 2;
    rightClawTip1.position.set(0, -0.5, 0.1);
    dinoRightClaw.add(rightClawTip1);

    // 后腿（两只）
    const dinoLegGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.8);
    const dinoLeftLeg = new THREE.Mesh(dinoLegGeometry, dinosaurMaterial);
    dinoLeftLeg.position.set(-0.8, 0.2, -0.8);
    dinosaurGroup.add(dinoLeftLeg);

    // 左后爪
    const leftFootClaw = new THREE.Mesh(dinoClawTipGeometry, dinoClawTipMaterial);
    leftFootClaw.rotation.x = -Math.PI / 2;
    leftFootClaw.scale.set(1.5, 1.5, 1.5);
    leftFootClaw.position.set(0, -0.7, 0.2);
    dinoLeftLeg.add(leftFootClaw);

    const dinoRightLeg = new THREE.Mesh(dinoLegGeometry, dinosaurMaterial);
    dinoRightLeg.position.set(0.8, 0.2, -0.8);
    dinosaurGroup.add(dinoRightLeg);

    // 尾巴（由多个部分组成，逐渐变细）
    const tailSegments = 5;  // 保持5段尾巴
    let previousSegment = dinoBody;  // 从身体开始
    let segmentWidth = 1.0;   // 减小初始宽度（原来是1.5）
    let segmentHeight = 0.8;  // 减小初始高度（原来是1.2）
    let segmentDepth = 0.6;   // 减小初始深度（原来是0.8）

    for(let i = 0; i < tailSegments; i++) {
        const tailGeometry = new THREE.BoxGeometry(
            segmentWidth,     
            segmentHeight,    
            segmentDepth      
        );
        const tailSegment = new THREE.Mesh(tailGeometry, dinosaurMaterial);
        
        // 设置每段尾巴的位置
        tailSegment.position.set(
            0,                    
            previousSegment === dinoBody ? 1 : 0,  
            -(i * segmentDepth + 1.5)             
        );
        
        // 稍微向上倾斜
        tailSegment.rotation.x = -Math.PI / 12;
        
        // 将尾巴段添加到前一个段或恐龙身体上
        if(previousSegment === dinoBody) {
            dinosaurGroup.add(tailSegment);
        } else {
            previousSegment.add(tailSegment);
        }
        
        // 更新参数为下一段
        previousSegment = tailSegment;
        segmentWidth *= 0.7;    // 增加收缩率（原来是0.8）
        segmentHeight *= 0.7;   // 增加收缩率（原来是0.8）
        segmentDepth *= 0.8;    // 增加收缩率（原来是0.9）
    }

    dinosaur = dinosaurGroup;
    scene.add(dinosaur);

    // 添加光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // 修改键盘事件监听
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // 开始生成食物和材料
    spawnFood();
    spawnMaterial();
    spawnGrenade(); // 初始生成一个手雷
    spawnCoin();  // 添加金币生成
    setInterval(spawnFood, 30000);     // 每30秒生成食物
    setInterval(spawnMaterial, 300000); // 每300秒生成材料
    setInterval(spawnGrenade, 100000);  // 修改为每100秒生成手雷
    setInterval(spawnCoin, 30000);  // 每30秒生成一个金币

    // 开始恐龙的移动
    moveDinosaur();

    // 在最后添加初始UI更新
    updateUI();
    
    // 开始动画循环
    animate();

    // 初始化音频
    gunshotSound = document.getElementById('gunshot');
    explosionSound = document.getElementById('explosion');
    
    // 设置音量
    gunshotSound.volume = 0.3;
    explosionSound.volume = 0.4;

    // 添加障碍物
    createObstacles();

    // 添加水塘
    createStreams();

    // 修改玩家初始位置（在左侧随机位置）
    player.position.set(
        -20,  // x坐标固定在最左侧
        0,    // y坐标在地面上
        Math.random() * 40 - 20  // z坐标随机（-20到20之间）
    );
    scene.add(player);

    // 修改恐龙初始位置（在右侧随机位置）
    dinosaur.position.set(
        20,   // x坐标固定在最右侧
        0,    // y坐标在地面上
        Math.random() * 40 - 20  // z坐标随机（-20到20之间）
    );
    scene.add(dinosaur);
}

// 按键按下
function onKeyDown(event) {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
    }
}

// 按键释放
function onKeyUp(event) {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
}

// 射击功能
function shoot() {
    if (!canShoot) return;
    
    // 播放射击音效
    gunshotSound.currentTime = 0;
    gunshotSound.play().catch(error => console.log("音频播放失败:", error));
    
    // 获取右手臂和手枪
    const rightArm = player.children.find(child => child.position.x === 0.4);
    const gunGroup = rightArm.children[0];
    
    // 修改子弹大小和材质
    const bulletGeometry = new THREE.SphereGeometry(0.1);  // 子弹尺寸从0.2改回0.1
    const bulletMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff0000,     // 红色
        emissive: 0xff0000,  // 发光效果
        emissiveIntensity: 0.5,  // 发光强度
        shininess: 100       // 光泽
    });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    
    // 设置子弹初始位置（从枪口射出）
    const gunTip = new THREE.Vector3();
    gunTip.copy(player.position);
    gunTip.y += 0.8;  // 调整高度到手枪位置
    gunTip.z += 0.4;  // 调整前后位置，与手枪位置对齐
    bullet.position.copy(gunTip);
    
    // 设置子弹速度（朝向恐龙）
    const direction = new THREE.Vector3();
    direction.subVectors(dinosaur.position, bullet.position).normalize();
    bullet.velocity = direction.multiplyScalar(bulletSpeed);
    
    scene.add(bullet);
    bullets.push(bullet);
    
    // 添加枪口闪光
    createMuzzleFlash(gunTip);
    
    // 设置射击冷却
    canShoot = false;
    setTimeout(() => {
        canShoot = true;
    }, shootCooldown);
}

// 创建子弹
function createBullet() {
    const bulletGeometry = new THREE.SphereGeometry(0.1);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    
    bullet.position.copy(player.position);
    bullet.position.y += 0.5;
    
    const direction = new THREE.Vector3();
    direction.subVectors(dinosaur.position, player.position).normalize();
    bullet.velocity = direction.multiplyScalar(bulletSpeed);
    
    scene.add(bullet);
    bullets.push(bullet);
}

// 更新子弹位置
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.position.add(bullet.velocity);
        
        // 检查子弹是否击中障碍物（石头）
        scene.children.forEach(object => {
            if (object.isObstacle) {
                const distance = bullet.position.distanceTo(object.position);
                if (distance < 1) {  // 如果子弹击中石头
                    bullet.material.opacity = 0;  // 隐藏子弹但不立即移除
                    setTimeout(() => {
                        scene.remove(bullet);
                        bullets.splice(i, 1);
                    }, 100);  // 100毫秒后移除子弹
                    return;
                }
            }
        });
        
        // 修改子弹击中恐龙的判定
        const distance = bullet.position.distanceTo(dinosaur.position);
        if (distance < 1.5) {
            // 造成1点伤害并更新UI
            dinosaurHealth = Math.max(0, dinosaurHealth - 1);  // 每次只减少1点生命值
            document.getElementById('monsterHealth').textContent = dinosaurHealth;  // 直接更新UI显示
            
            // 子弹消失效果
            bullet.material.opacity = 0;
            setTimeout(() => {
                scene.remove(bullet);
                bullets.splice(i, 1);
            }, 100);
            
            // 恐龙受击效果
            dinosaurCanMove = false;
            setTimeout(() => {
                dinosaurCanMove = true;
            }, 200);
            
            // 检查恐龙是否被击败
            if (dinosaurHealth <= 0) {
                coins += 100;
                alert('恭喜你击败了恐龙！获得100金币！');
                resetGame();
            }
            continue;
        }
        
        // 超出射程的子弹逐渐消失
        if (bullet.position.length() > 10) {  // 超过10单位距离
            bullet.material.opacity -= 0.1;  // 逐渐降低透明度
            if (bullet.material.opacity <= 0) {
                scene.remove(bullet);
                bullets.splice(i, 1);
            }
        }
    }
}

// 恐龙移动
function moveDinosaur() {
    setInterval(() => {
        if (!dinosaurCanMove) return;
        
        const direction = new THREE.Vector3();
        direction.subVectors(player.position, dinosaur.position);
        direction.normalize();
        
        // 检查前方是否有障碍物
        const raycaster = new THREE.Raycaster(
            dinosaur.position,
            direction,
            0,
            3
        );
        const intersects = raycaster.intersectObjects(scene.children);
        
        // 如果前方有障碍物，尝试绕行
        if (intersects.length > 0 && intersects[0].object.isObstacle) {
            // 随机选择左右方向绕行
            const avoidDirection = Math.random() > 0.5 ? 1 : -1;
            direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), avoidDirection * Math.PI / 4);
        }
        
        // 更新恐龙位置
        dinosaur.position.x += direction.x * dinosaurSpeed;
        dinosaur.position.z += direction.z * dinosaurSpeed;
        
        // 更新恐龙朝向
        const angle = Math.atan2(direction.x, direction.z);
        dinosaur.rotation.y = angle;
        
        // 张嘴动画
        const lowerJaw = dinosaur.children.find(child => 
            child.position.y === 1.5 && child.position.z === 2.5);
        if(lowerJaw) {
            lowerJaw.position.y = 1.5 + Math.sin(Date.now() * 0.005) * 0.1;
        }
        
        // 检查是否接触到玩家
        const distance = dinosaur.position.distanceTo(player.position);
        if (distance < 2) {
            health = Math.max(0, health - 1);
            updateUI();
            if (health <= 0) {
                alert('游戏结束！');
                resetGame();
            }
        }
        
        // 添加发射火球的判断
        if (canShootFireball) {
            shootFireball();
        }
    }, 100);
}

// 更新相机
function updateCamera() {
    camera.position.x = player.position.x;
    camera.position.z = player.position.z + 10;
    camera.lookAt(player.position);
}

// 修改生成食物函数
function spawnFood() {
    const foodGeometry = new THREE.SphereGeometry(0.3);
    const foodMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });  // 改为红色
    const food = new THREE.Mesh(foodGeometry, foodMaterial);
    food.position.set(
        Math.random() * 40 - 20,
        0,
        Math.random() * 40 - 20
    );
    food.isFood = true;
    scene.add(food);
}

// 生成材料
function spawnMaterial() {
    const materialGeometry = new THREE.SphereGeometry(0.3);
    const materialMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });  // 蓝色球体
    const material = new THREE.Mesh(materialGeometry, materialMaterial);
    material.position.set(
        Math.random() * 40 - 20,
        0,
        Math.random() * 40 - 20
    );
    material.isMaterial = true;
    scene.add(material);
}

// 修改生成手榴弹函数
function spawnGrenade() {
    const grenadeItemGeometry = new THREE.SphereGeometry(0.2);
    const grenadeItemMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x000000,  // 黑色球体
        shininess: 30
    });
    const grenadeItem = new THREE.Mesh(grenadeItemGeometry, grenadeItemMaterial);
    grenadeItem.position.set(
        Math.random() * 40 - 20,
        0.5,  // 将y坐标设置为0.5，使其漂浮在地面上
        Math.random() * 40 - 20
    );
    grenadeItem.isGrenadeItem = true;
    scene.add(grenadeItem);
}

// 添加生成金币函数
function spawnCoin() {
    const coinGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
    const coinMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xFFD700,  // 金色
        metalness: 1,
        roughness: 0.3,
        emissive: 0xFFD700,
        emissiveIntensity: 0.5
    });
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    
    coin.position.set(
        Math.random() * 40 - 20,
        0.5,
        Math.random() * 40 - 20
    );
    
    coin.rotation.x = Math.PI / 2;  // 使金币平放
    coin.isCoin = true;
    scene.add(coin);
}

// 修改碰撞检测函数
function checkCollisions() {
    scene.children.forEach(object => {
        if (object.isFood || object.isMaterial || object.isGrenadeItem || object.isCoin) {
            const distance = player.position.distanceTo(object.position);
            if (distance < 1.5) {
                if (object.isFood) {
                    health = Math.min(maxHealth, health + 1);
                    updateUI();
                    scene.remove(object);
                } else if (object.isMaterial) {
                    attackPower++;
                    updateUI();
                    scene.remove(object);
                } else if (object.isGrenadeItem) {
                    grenadeCount++;
                    coins += 20;     // 拾取手榴弹获得20金币
                    updateUI();
                    scene.remove(object);
                } else if (object.isCoin) {
                    coins += 5;      // 收集金币获得5金币
                    updateUI();
                    scene.remove(object);
                }
            }
        }
    });

    // 添加障碍物碰撞检测
    scene.children.forEach(object => {
        if (object.isObstacle) {
            const distance = player.position.distanceTo(object.position);
            if (distance < 1.5) {
                // 阻止玩家穿过障碍物
                const direction = new THREE.Vector3();
                direction.subVectors(player.position, object.position).normalize();
                player.position.add(direction.multiplyScalar(0.1));
            }
        }
    });
}

// 更新UI
function updateUI() {
    try {
        document.getElementById('health').textContent = health;
        document.getElementById('maxHealth').textContent = maxHealth;
        document.getElementById('attack').textContent = attackPower;
        document.getElementById('monsterHealth').textContent = dinosaurHealth;
        document.getElementById('coins').textContent = coins;
        document.getElementById('grenades').textContent = grenadeCount;
    } catch (error) {
        console.error('UI更新失败:', error);
    }
}

// 重置游戏
function resetGame() {
    health = 5;
    dinosaurHealth = 100;
    attackPower = 1;
    
    // 重置位置时也使用随机位置
    player.position.set(
        -20,
        0,
        Math.random() * 40 - 20
    );
    
    dinosaur.position.set(
        20,
        0,
        Math.random() * 40 - 20
    );
    
    dinosaurCanMove = true;
    updateUI();
    
    // 清理所有火球
    fireballs.forEach(fireball => {
        scene.remove(fireball);
    });
    fireballs = [];
}

// 修改手枪的创建
function createGun() {
    const gunGroup = new THREE.Group();

    // 枪身
    const gunBodyGeometry = new THREE.BoxGeometry(0.4, 0.15, 0.15);
    const gunMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const gunBody = new THREE.Mesh(gunBodyGeometry, gunMaterial);
    gunGroup.add(gunBody);

    // 枪管
    const barrelGeometry = new THREE.BoxGeometry(0.3, 0.12, 0.12);
    const barrel = new THREE.Mesh(barrelGeometry, gunMaterial);
    barrel.position.x = 0.3;  // 枪管向前延伸
    gunGroup.add(barrel);

    // 握把
    const gripGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.15);
    const grip = new THREE.Mesh(gripGeometry, gunMaterial);
    grip.position.y = -0.2;  // 握把向下延伸
    gunGroup.add(grip);

    return gunGroup;
}

// 修改手枪的位置和朝向更新函数
function updatePlayerAim() {
    // 更新玩家朝向（始终面对恐龙）
    const directionToMonster = new THREE.Vector3();
    directionToMonster.subVectors(dinosaur.position, player.position);
    const angle = Math.atan2(directionToMonster.x, directionToMonster.z);
    player.rotation.y = angle;
    
    // 更新右手臂和手枪朝向
    const rightArm = player.children.find(child => child.position.x === 0.4);
    if (rightArm) {
        // 右手臂抬起90度
        rightArm.rotation.x = -Math.PI / 2;  // -90度，垂直向上
        rightArm.rotation.y = 0;     // 保持与身体同向
        
        // 更新手枪位置和朝向
        const gunGroup = rightArm.children[0];
        if (gunGroup) {
            // 手枪位置设置
            gunGroup.position.set(
                0,      // x: 在手臂端点
                -0.3,   // y: 向下偏移0.3单位
                0.2     // z: 向前偏移0.2单位
            );
            
            // 手枪旋转设置 - 调整以使枪口朝向怪兽
            gunGroup.rotation.set(
                Math.PI,     // x: 180度，翻转手枪
                Math.PI / 2, // y: 90度，使枪口朝右
                0           // z: 0度，保持水平
            );
        }
    }
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    // 处理移动（添加边界检查）
    let newX = player.position.x;
    let newZ = player.position.z;
    
    // 根据是否在溪水中调整移动速度
    const currentMoveSpeed = checkInStream() ? moveSpeed * 0.5 : moveSpeed;
    
    if (keys.ArrowLeft) {
        newX -= currentMoveSpeed;
    }
    if (keys.ArrowRight) {
        newX += currentMoveSpeed;
    }
    if (keys.ArrowUp) {
        newZ -= currentMoveSpeed;
    }
    if (keys.ArrowDown) {
        newZ += currentMoveSpeed;
    }
    
    // 检查边界
    if (newX >= -groundLimit && newX <= groundLimit) {
        player.position.x = newX;
    }
    if (newZ >= -groundLimit && newZ <= groundLimit) {
        player.position.z = newZ;
    }
    
    // 处理射击
    if (keys[' ']) {
        shoot();
    }
    
    // 处理跳跃
    if ((keys.z || keys.Z) && !isJumping) {
        jump();
    }
    
    // 处理手雷投掷
    if ((keys.g || keys.G) && canThrowGrenade && grenadeCount > 0) {
        throwGrenade();
    }
    
    // 处理商城开启
    if (keys.b || keys.B) {
        toggleShop();
        keys.b = false;  // 防止持续触发
        keys.B = false;
    }
    
    // 更新相机
    updateCamera();
    
    // 更新跳跃和重力效果
    if (isJumping) {
        player.position.y += jumpVelocity;  // 更新玩家高度
        jumpVelocity -= gravity;   // 重力影响，减小向上速度
        
        // 检查是否落地
        if (player.position.y <= 0) {
            player.position.y = 0;  // 确保不会低于地面
            isJumping = false;
            jumpVelocity = 0;
        }
    }
    
    updatePlayerAim();  // 更新瞄准
    
    updateBullets();
    checkCollisions();
    
    // 添加肢体摆动
    dinosaur.children.forEach((child, index) => {
        // 前爪摆动（通过position判断是前爪）
        if (child.position.y === 1.0 && (child.position.x === -1.2 || child.position.x === 1.2)) {
            child.rotation.x = Math.sin(Date.now() * 0.005) * 0.3;  // 前后摆动
        }
        
        // 后腿摆动（通过position判断是后腿）
        if (child.position.y === 0.2 && (child.position.x === -0.8 || child.position.x === 0.8)) {
            child.rotation.x = Math.sin(Date.now() * 0.005 + Math.PI) * 0.3;  // 与前爪相反的摆动
        }
        
        // 尾巴摆动（已有代码）
        if (child.geometry && child.geometry.parameters.width < 1.5) {
            child.rotation.y = Math.sin(Date.now() * 0.003 + index * 0.5) * 0.2;
            child.rotation.x = -Math.PI / 12 + Math.sin(Date.now() * 0.003 + index * 0.5) * 0.1;
        }
    });
    
    // 添加腿部摆动动画
    const leftLeg = player.children.find(child => child.position.x === -0.15);  // 左腿
    const rightLeg = player.children.find(child => child.position.x === 0.15);  // 右腿
    
    // 只在移动时添加摆动效果
    if (keys.ArrowLeft || keys.ArrowRight || keys.ArrowUp || keys.ArrowDown) {
        // 使用时间创建摆动效果
        const swingAngle = Math.sin(Date.now() * 0.01) * 0.4;  // 摆动幅度0.4弧度
        
        // 左右腿交替摆动（使用相反的角度）
        if (leftLeg) leftLeg.rotation.x = swingAngle;
        if (rightLeg) rightLeg.rotation.x = -swingAngle;
        
        // 添加手臂轻微摆动
        const leftArm = player.children.find(child => child.position.x === -0.4);  // 左手臂
        const rightArm = player.children.find(child => child.position.x === 0.4);  // 右手臂（持枪的手）
        
        if (leftArm) leftArm.rotation.x = -swingAngle * 0.5;  // 手臂摆动幅度减半
        // 右手臂保持瞄准姿势，不参与摆动
    } else {
        // 停止移动时恢复原位
        if (leftLeg) leftLeg.rotation.x = 0;
        if (rightLeg) rightLeg.rotation.x = 0;
        const leftArm = player.children.find(child => child.position.x === -0.4);
        if (leftArm) leftArm.rotation.x = 0;
    }
    
    // 添加手榴弹更新
    updateGrenades();
    
    // 添加火球更新
    updateFireballs();
    
    renderer.render(scene, camera);
}

// 确保在页面加载完成后再初始化
document.addEventListener('DOMContentLoaded', () => {
    try {
        init();
        console.log('游戏初始化成功');
    } catch (error) {
        console.error('游戏初始化失败:', error);
    }
});

// 窗口大小调整
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 商城控制
function toggleShop() {
    const shop = document.getElementById('shop');
    if (shop.style.display === 'none') {
        shop.style.display = 'block';
        document.getElementById('shopCoins').textContent = coins;  // 显示当前金币数
    } else {
        shop.style.display = 'none';
    }
}

// 购买物品
function buyItem(itemType) {
    switch(itemType) {
        case 'health':
            if (coins >= 50) {  // 购买生命值需要50金币
                health = Math.min(health + 10, maxHealth);
                coins -= 50;
                updateUI();
                document.getElementById('shopCoins').textContent = coins;  // 更新商城中的金币显示
                alert('购买成功！生命值+10');
            } else {
                alert('金币不足！');
            }
            break;
        case 'attack':
            if (coins >= 100) {  // 购买攻击力需要100金币
                attackPower += 5;  // 每次升级增加5点攻击力（原来是2）
                coins -= 100;
                updateUI();
                document.getElementById('shopCoins').textContent = coins;
                alert('购买成功！攻击力+5');
            } else {
                alert('金币不足！');
            }
            break;
        case 'maxHealth':
            if (coins >= 200) {  // 购买最大生命值需要200金币
                maxHealth += 10;
                health = Math.min(health + 10, maxHealth);
                coins -= 200;
                updateUI();
                document.getElementById('shopCoins').textContent = coins;
                alert('购买成功！最大生命值+10');
            } else {
                alert('金币不足！');
            }
            break;
        case 'grenadeUpgrade':
            if (coins >= 150) {  // 购买手榴弹升级需要150金币
                grenadeDamage += 5;
                coins -= 150;
                updateUI();
                document.getElementById('shopCoins').textContent = coins;
                alert('购买成功！手雷伤害+5');
            } else {
                alert('金币不足！');
            }
            break;
    }
}

// 修改跳跃功能
function jump() {
    if (!isJumping) {
        isJumping = true;
        jumpVelocity = 0.4;  // 初始跳跃速度从0.6改为0.4
    }
}

// 修改枪口闪光效果
function createMuzzleFlash(position) {
    const flashGeometry = new THREE.SphereGeometry(0.1);
    const flashMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 1
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.copy(position);
    scene.add(flash);
    
    let opacity = 1;
    function fadeOut() {
        opacity -= 0.2;
        if (opacity <= 0) {
            scene.remove(flash);
            return;
        }
        flash.material.opacity = opacity;
        requestAnimationFrame(fadeOut);
    }
    fadeOut();
}

// 修改投掷手榴弹函数，移除提示
function throwGrenade() {
    if (grenadeCount <= 0 || !canThrowGrenade) return;  // 添加canThrowGrenade检查
    
    grenadeCount--;
    updateUI();
    canThrowGrenade = false;
    
    const grenade = new THREE.Mesh(
        new THREE.SphereGeometry(0.15),
        new THREE.MeshPhongMaterial({ color: 0x333333 })
    );
    
    // 从玩家手中投出
    grenade.position.copy(player.position);
    grenade.position.y += 1;  // 从玩家手的高度投出
    
    // 计算投掷方向（朝向恐龙）
    const direction = new THREE.Vector3();
    direction.subVectors(dinosaur.position, grenade.position).normalize();
    grenade.velocity = direction.multiplyScalar(grenadeSpeed);
    grenade.verticalVelocity = 0.3;  // 初始向上速度
    
    scene.add(grenade);
    grenades.push(grenade);
    
    // 设置冷却时间
    setTimeout(() => {
        canThrowGrenade = true;
    }, grenadeCooldown);
}

// 添加手雷更新函数
function updateGrenades() {
    for (let i = grenades.length - 1; i >= 0; i--) {
        const grenade = grenades[i];
        
        // 更新位置（抛物线运动）
        grenade.position.add(grenade.velocity);
        grenade.position.y += grenade.verticalVelocity;
        grenade.verticalVelocity -= 0.015; // 重力效果
        
        // 检查是否击中地面
        if (grenade.position.y <= 0) {
            // 播放爆炸音效
            explosionSound.currentTime = 0;
            explosionSound.play().catch(error => console.log("音频播放失败:", error));
            
            // 创建爆炸效果
            createExplosion(grenade.position);
            
            // 检查是否在爆炸范围内
            const distanceToDinosaur = grenade.position.distanceTo(dinosaur.position);
            if (distanceToDinosaur < 3) { // 爆炸范围3个单位
                dinosaurHealth -= grenadeDamage;
                updateUI();
                
                // 恐龙受击停顿
                dinosaurCanMove = false;
                setTimeout(() => {
                    dinosaurCanMove = true;
                }, 500);
                
                if (dinosaurHealth <= 0) {
                    coins += 100;  // 击败恐龙获得100金币
                    alert('恭喜你击败了恐龙！获得100金币！');
                    resetGame();
                }
            }
            
            // 移除手雷
            scene.remove(grenade);
            grenades.splice(i, 1);
        }
    }
}

// 添加爆炸效果函数
function createExplosion(position) {
    // 爆炸光环
    const ringGeometry = new THREE.RingGeometry(0.1, 2, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8800,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.position.y = 0.1;
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);
    
    // 爆炸动画
    let scale = 1;
    function animateExplosion() {
        if (scale >= 2) {
            scene.remove(ring);
            return;
        }
        scale += 0.1;
        ring.scale.set(scale, scale, scale);
        ring.material.opacity -= 0.05;
        requestAnimationFrame(animateExplosion);
    }
    animateExplosion();
}

// 修改创建障碍物函数，将石头数量从6个增加到12个
function createObstacles() {
    // 创建石头
    const rockGeometry = new THREE.DodecahedronGeometry(1);
    const rockMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x808080,  // 灰色
        roughness: 0.8
    });

    // 创建多个石头，数量从6增加到12
    for(let i = 0; i < 12; i++) {
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        let x, z;
        do {
            x = Math.random() * 40 - 20;
            z = Math.random() * 40 - 20;
        } while (
            (Math.abs(x) < 3 && Math.abs(z) < 3) || // 避开玩家出生点
            (Math.abs(x - 10) < 3 && Math.abs(z) < 3) // 避开恐龙出生点
        );
        
        rock.position.set(x, 0, z);  // y设为0，使石头底部与地面接触
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.scale.set(
            0.8 + Math.random() * 0.4,
            0.8 + Math.random() * 0.4,
            0.8 + Math.random() * 0.4
        );
        rock.isObstacle = true;
        scene.add(rock);
    }
}

// 修改创建水塘函数
function createStreams() {
    // 水塘材质 - 修改颜色和透明度
    const pondMaterial = new THREE.MeshPhongMaterial({
        color: 0x87CEEB,  // 天蓝色
        transparent: false,  // 不透明
        shininess: 100
    });

    // 创建4个随机形状的水塘
    for(let i = 0; i < 4; i++) {
        // 创建不规则多边形形状（5-8个顶点）
        const vertices = [];
        const numPoints = Math.floor(Math.random() * 4) + 5; // 5到8个顶点
        const radius = 2 + Math.random() * 3; // 基础半径2-5之间

        // 生成不规则多边形的顶点
        for(let j = 0; j < numPoints; j++) {
            const angle = (j / numPoints) * Math.PI * 2;
            const randomRadius = radius * (0.8 + Math.random() * 0.4); // 在基础半径的80%-120%之间随机
            const x = Math.cos(angle) * randomRadius;
            const y = Math.sin(angle) * randomRadius;
            vertices.push(new THREE.Vector2(x, y));
        }

        // 创建水塘形状
        const shape = new THREE.Shape(vertices);
        const geometry = new THREE.ShapeGeometry(shape);
        const pond = new THREE.Mesh(geometry, pondMaterial);

        // 随机位置（避开玩家和恐龙出生点）
        let x, z;
        do {
            x = Math.random() * 40 - 20;
            z = Math.random() * 40 - 20;
        } while (
            (Math.abs(x) < 5 && Math.abs(z) < 5) || // 避开玩家出生点
            (Math.abs(x - 10) < 5 && Math.abs(z) < 5) // 避开恐龙出生点
        );

        // 设置水塘位置和旋转
        pond.position.set(x, -1.9, z); // 略微下沉到地面以下
        pond.rotation.x = -Math.PI / 2; // 使水塘平躺
        pond.rotation.z = Math.random() * Math.PI * 2; // 随机旋转

        pond.isStream = true; // 保持原有的标记名称以兼容现有代码
        scene.add(pond);
    }

    // 修改水面动画效果（由于不透明，移除透明度动画）
    function animateWater() {
        // 只保留水面反光效果
        pondMaterial.emissive.setHex(0x87CEEB);
        pondMaterial.emissiveIntensity = 0.2 + Math.sin(Date.now() * 0.002) * 0.1;
        requestAnimationFrame(animateWater);
    }
    animateWater();
}

// 修改检查是否在水中的函数
function checkInStream() {
    let inStream = false;
    scene.children.forEach(object => {
        if (object.isStream) {
            // 获取水塘的世界坐标
            const pondWorldPosition = new THREE.Vector3();
            object.getWorldPosition(pondWorldPosition);
            
            // 计算玩家到水塘中心的距离
            const distance = new THREE.Vector2(
                player.position.x - pondWorldPosition.x,
                player.position.z - pondWorldPosition.z
            ).length();
            
            // 如果玩家在水塘的大致范围内（使用3作为平均半径）
            if (distance < 3) {
                inStream = true;
            }
        }
    });
    return inStream;
}

// 添加火球发射函数
function shootFireball() {
    if (!canShootFireball) return;
    
    // 创建火球
    const fireballGeometry = new THREE.SphereGeometry(0.3);  // 火球比子弹大
    const fireballMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff4400,
        emissive: 0xff4400,
        emissiveIntensity: 0.8,
        shininess: 100
    });
    const fireball = new THREE.Mesh(fireballGeometry, fireballMaterial);
    
    // 从恐龙嘴部发射
    fireball.position.copy(dinosaur.position);
    fireball.position.y += 1.7;  // 调整到恐龙嘴部高度
    fireball.position.z += 2.5;  // 从嘴部前端发射
    
    // 计算方向（朝向玩家）
    const direction = new THREE.Vector3();
    direction.subVectors(player.position, fireball.position).normalize();
    fireball.velocity = direction.multiplyScalar(fireballSpeed);
    
    scene.add(fireball);
    fireballs.push(fireball);
    
    // 设置冷却
    canShootFireball = false;
    setTimeout(() => {
        canShootFireball = true;
    }, fireballCooldown);
}

// 添加火球更新函数
function updateFireballs() {
    for (let i = fireballs.length - 1; i >= 0; i--) {
        const fireball = fireballs[i];
        fireball.position.add(fireball.velocity);
        
        // 检查是否击中玩家
        const distance = fireball.position.distanceTo(player.position);
        if (distance < 1) {
            // 造成伤害
            health = Math.max(0, health - 1);
            updateUI();
            
            // 移除火球
            scene.remove(fireball);
            fireballs.splice(i, 1);
            
            // 检查玩家是否死亡
            if (health <= 0) {
                alert('游戏结束！');
                resetGame();
            }
            continue;
        }
        
        // 检查是否击中障碍物
        scene.children.forEach(object => {
            if (object.isObstacle) {
                const distance = fireball.position.distanceTo(object.position);
                if (distance < 1) {
                    scene.remove(fireball);
                    fireballs.splice(i, 1);
                }
            }
        });
        
        // 移除超出范围的火球
        if (fireball.position.length() > 50) {
            scene.remove(fireball);
            fireballs.splice(i, 1);
        }
    }
} 