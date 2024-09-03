window.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);

  // Функция для создания и настройки камеры
  const createCamera = function (scene) {
    const camera = new BABYLON.UniversalCamera(
      "camera",
      new BABYLON.Vector3(0, 1.8, -10),
      scene
    );
    camera.attachControl(canvas, true);
    camera.keysUp.push(87); // W
    camera.keysDown.push(83); // S
    camera.keysLeft.push(65); // A
    camera.keysRight.push(68); // D
    return camera;
  };

  // Создаем сцену
  const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // Создание и настройка камеры
    const camera = createCamera(scene);

    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(1, 1, 0),
      scene
    );
    light.intensity = 0.7;

    const ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 100, height: 100 },
      scene
    );
    const groundMaterial = new BABYLON.StandardMaterial(
      "groundMaterial",
      scene
    );
    groundMaterial.diffuseTexture = new BABYLON.Texture(
      "https://www.babylonjs-playground.com/textures/grass.jpg",
      scene
    );
    ground.material = groundMaterial;

    // Загрузка модели персонажа
    BABYLON.SceneLoader.ImportMesh(
      "",
      "./",
      "bot.glb",
      scene,
      function (meshes) {
        const bot = meshes[0];
        bot.position = new BABYLON.Vector3(0, 0, 5);
      }
    );

    // Подключаем инвентарь из script.js
    setupInventory(scene, camera);

    // Подключаем обучение из level1.js
    setupTutorial(scene, engine, createCamera);

    return scene;
  };

  const scene = createScene();

  // Запуск рендеринга
  engine.runRenderLoop(function () {
    scene.render();
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });
});
