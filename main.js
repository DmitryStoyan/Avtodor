let globalInventoryItems = {
  1: {
    name: "Телефон",
    model: "./models/inventory/iphone_16.glb",
    scaling: new BABYLON.Vector3(0.8, 0.8, -0.8),
    position: new BABYLON.Vector3(0.8, -0.25, 1),
    rotation: new BABYLON.Vector3(0, Math.PI, 0),
  },
  2: {
    name: "Фонарик",
    model: "./models/inventory/flashlight.glb",
    scaling: new BABYLON.Vector3(0.1, 0.1, 0.1),
    position: new BABYLON.Vector3(0.55, -0.3, 1),
  },
  3: {
    name: "Бутылка воды",
    model: "./models/inventory/water.glb",
    scaling: new BABYLON.Vector3(0.06, 0.06, 0.06),
    position: new BABYLON.Vector3(0.7, -0.4, 1.3),
  },
  4: {
    name: " Молоток",
    model: "./models/inventory/hammer.glb",
    scaling: new BABYLON.Vector3(0.05, 0.05, 0.05),
    position: new BABYLON.Vector3(0.6, -0.4, 1),
    rotation: new BABYLON.Vector3(0, 30, 0),
  },
}; // Глобальный инвентарь

window.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);

  let currentScene = null;
  let currentLevel = 1;
  let stepSound = null; // Переменная для хранения звука шагов

  const createCamera = (scene) => {
    const camera = new BABYLON.UniversalCamera(
      "UniversalCamera",
      new BABYLON.Vector3(0, 2, -10),
      scene
    );

    // Привязываем управление камерой к canvas
    camera.attachControl(canvas, true);

    // Отключаем нажатие кнопки мыши для вращения камеры, чтобы вращать её при движении мыши
    camera.inputs.remove(camera.inputs.attached.mouse); // Удаляем стандартное управление мышью
    const customMouseInput = new BABYLON.FreeCameraMouseInput();

    // Настройка чувствительности камеры
    customMouseInput.angularSensibility = 2000;

    // Привязываем камере новый обработчик движения мыши
    camera.inputs.add(customMouseInput);

    // Настройка управления для передвижения
    camera.minZ = 0.1;
    camera.speed = 0.2;

    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);

    // Управление с помощью клавиш WASD
    camera.keysUp.push(87); // W
    camera.keysDown.push(83); // S
    camera.keysLeft.push(65); // A
    camera.keysRight.push(68); // D

    // Управление на русской раскладке
    camera.keysUp.push(1042); // Ц
    camera.keysDown.push(1067); // Ы
    camera.keysLeft.push(1060); // Ф
    camera.keysRight.push(1042); // В

    return camera;
  };

  let previousPosition = new BABYLON.Vector3(0, 0, 0); // Предыдущая позиция для отслеживания движения

  const loadLevel = (level) => {
    if (currentScene) {
      currentScene.dispose();
    }

    const scene = new BABYLON.Scene(engine);
    currentScene = scene;

    const camera = createCamera(scene);
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(1, 1, 0),
      scene
    );
    light.intensity = 0.7;

    scene.collisionsEnabled = true;
    scene.gravity = new BABYLON.Vector3(0, -0.98, 0);

    setupInventory(scene, camera);

    // Создаём звук шагов после инициализации сцены
    stepSound = new BABYLON.Sound("step", "./step.wav", scene, null, {
      loop: false,
      autoplay: false,
      volume: 0.5,
    });

    scene.registerBeforeRender(() => {
      const distance = BABYLON.Vector3.Distance(
        camera.position,
        previousPosition
      );

      if (distance > 0.01) {
        if (!stepSound.isPlaying) {
          stepSound.play();
        }
      } else {
        if (stepSound.isPlaying) {
          stepSound.stop();
        }
      }

      previousPosition.copyFrom(camera.position);
    });

    switch (level) {
      case 1:
        loadLevel1(scene, camera, () => loadLevel(2)); // Переход на второй уровень после первого
        break;
      case 2:
        loadLevel2(scene, camera);
        // Передаем функцию перехода на уровень 3
        window.onCarEntered = () => {
          globalInventoryItems = { ...globalInventoryItems }; // Сохраняем инвентарь
          loadLevel(3); // Переход на уровень 3
        };
        break;
      case 3:
        loadLevel3(scene, camera);
        break;
    }

    return scene;
  };

  let scene = loadLevel(currentLevel);

  engine.runRenderLoop(() => {
    if (currentScene) {
      currentScene.render();
    }
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });
});
