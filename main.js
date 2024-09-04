window.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);

  // Функция создания камеры
  const createCamera = (scene) => {
    const camera = new BABYLON.UniversalCamera(
      "UniversalCamera",
      new BABYLON.Vector3(0, 2, -10),
      scene
    );
    camera.attachControl(canvas, true);

    camera.minZ = 0.1;
    camera.speed = 0.2;

    camera.keysUp.push(87); // W
    camera.keysDown.push(83); // S
    camera.keysLeft.push(65); // A
    camera.keysRight.push(68); // D

    return camera;
  };

  // Функция создания сцены
  const createScene = () => {
    const scene = new BABYLON.Scene(engine);

    // Используем функцию создания камеры
    const camera = createCamera(scene);

    // Создание света
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(1, 1, 0),
      scene
    );
    light.intensity = 0.7;

    // Загрузка модели карты
    BABYLON.SceneLoader.Append("", "ground.glb", scene, function (scene) {
      // Включение коллизий для камеры и сцены
      scene.gravity = new BABYLON.Vector3(0, -0.9, 0);
      scene.collisionsEnabled = true;

      camera.checkCollisions = true;
      camera.applyGravity = true;

      // Применение коллизий ко всем мешам в сцене
      scene.meshes.forEach((mesh) => {
        mesh.checkCollisions = true;
      });
    });

    // Загрузка модели персонажа
    BABYLON.SceneLoader.ImportMesh(
      "",
      "./",
      "bot.glb",
      scene,
      function (meshes) {
        const bot = meshes[0];
        bot.position = new BABYLON.Vector3(0, 0, 5);
        bot.checkCollisions = true; // Персонаж учитывает столкновения
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
  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });
});
