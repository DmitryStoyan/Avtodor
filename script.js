window.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);

  // Создаем сцену
  const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // Камера и управление
    const camera = new BABYLON.UniversalCamera(
      "camera",
      new BABYLON.Vector3(0, 1.8, -10),
      scene
    );
    camera.attachControl(canvas, true);
    camera.keysUp.push(87);
    camera.keysDown.push(83);
    camera.keysLeft.push(65);
    camera.keysRight.push(68);

    // Свет
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(1, 1, 0),
      scene
    );
    light.intensity = 0.7;

    // Земля с травой
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

    // Создаем инвентарь (список предметов) с заданием размера и позиции
    const inventoryItems = {
      1: {
        name: "Телефон",
        model: "phone.glb",
        scaling: new BABYLON.Vector3(0.2, 0.2, 0.2),
        position: new BABYLON.Vector3(0.7, -0.4, 1),
        rotation: new BABYLON.Vector3(0, Math.PI, 0), // Поворот на 180 градусов по оси Y
      },
      2: {
        name: "Фонарик",
        model: "flashlight.glb",
        scaling: new BABYLON.Vector3(0.2, 0.2, 0.2),
        position: new BABYLON.Vector3(0.7, -0.4, 1),
      },
      3: {
        name: "Бутылка воды",
        model: "water.glb",
        scaling: new BABYLON.Vector3(0.06, 0.06, 0.06),
        position: new BABYLON.Vector3(0.7, -0.4, 1.3),
      },
      4: {
        name: "Бутерброд",
        model: "sandwich.glb",
        scaling: new BABYLON.Vector3(0.2, 0.2, 0.2),
        position: new BABYLON.Vector3(0.7, -0.4, 2),
      },
    };

    // Текущий выбранный предмет
    let selectedItem = null;

    // Создание GUI для инвентаря
    const advancedTexture =
      BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const inventoryPanel = new BABYLON.GUI.StackPanel();
    inventoryPanel.width = "220px";
    inventoryPanel.isVertical = true;
    inventoryPanel.horizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    inventoryPanel.verticalAlignment =
      BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    inventoryPanel.isVisible = false; // Инвентарь скрыт по умолчанию
    advancedTexture.addControl(inventoryPanel);

    const inventoryHeader = new BABYLON.GUI.TextBlock();
    inventoryHeader.text = "Инвентарь";
    inventoryHeader.height = "40px";
    inventoryHeader.color = "white";
    inventoryHeader.fontSize = 24;
    inventoryPanel.addControl(inventoryHeader);

    const inventorySlots = {}; // Слоты для предметов

    // Добавляем опцию "Убрать все из рук"
    const removeItemSlot = new BABYLON.GUI.TextBlock();
    removeItemSlot.text = "0: Убрать все из рук";
    removeItemSlot.height = "30px";
    removeItemSlot.color = "white";
    removeItemSlot.fontSize = 20;
    removeItemSlot.textHorizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    removeItemSlot.paddingLeft = "10px";
    inventoryPanel.addControl(removeItemSlot);

    // Заполнение инвентаря
    for (let key in inventoryItems) {
      const item = inventoryItems[key];
      const itemSlot = new BABYLON.GUI.TextBlock();
      itemSlot.text = `${key}: ${item.name}`;
      itemSlot.height = "30px";
      itemSlot.color = "white";
      itemSlot.fontSize = 20;
      itemSlot.textHorizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      itemSlot.paddingLeft = "10px";
      inventoryPanel.addControl(itemSlot);
      inventorySlots[key] = itemSlot;
    }

    // Обработчик для открытия/закрытия инвентаря
    window.addEventListener("keydown", function (event) {
      if (event.key === "l" || event.key === "L") {
        inventoryPanel.isVisible = !inventoryPanel.isVisible;
      }
    });

    // Обработчик для выбора предмета или удаления предмета из рук
    window.addEventListener("keydown", function (event) {
      const selectedKey = event.key;

      // Если нажата клавиша 0, убираем все из рук
      if (selectedKey === "0") {
        selectedItem = null;
        console.log("Вы убрали все из рук.");

        // Удаление старого предмета в руке (если был)
        const oldItem = scene.getMeshByName("selectedItem");
        if (oldItem) {
          oldItem.dispose();
        }
      }

      // Если выбрана цифра 1-4, берем предмет в руку
      if (inventoryItems[selectedKey]) {
        selectedItem = inventoryItems[selectedKey];
        console.log(`Вы выбрали: ${selectedItem.name}`);

        // Удаление старого предмета в руке (если был)
        const oldItem = scene.getMeshByName("selectedItem");
        if (oldItem) {
          oldItem.dispose();
        }

        // Загрузка выбранного предмета в руку с заданными масштабом и позицией
        BABYLON.SceneLoader.ImportMesh(
          "",
          "./",
          selectedItem.model,
          scene,
          function (meshes) {
            const itemMesh = meshes[0];
            itemMesh.name = "selectedItem";
            itemMesh.parent = camera; // Привязываем предмет к камере
            itemMesh.scaling = selectedItem.scaling; // Применяем масштаб
            itemMesh.position = selectedItem.position; // Применяем позицию
            if (selectedItem.rotation) {
              itemMesh.rotation = selectedItem.rotation; // Применяем вращение
            }
          }
        );
      }
    });

    return scene;
  };

  // Сцена 1
  const scene = createScene();

  // Черный экран с надписью "Сцена 1"
  const blackScreen = new BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
    "UI"
  );
  const rectangle = new BABYLON.GUI.Rectangle();
  rectangle.width = "100%";
  rectangle.height = "100%";
  rectangle.color = "black";
  rectangle.background = "black";
  blackScreen.addControl(rectangle);

  const text = new BABYLON.GUI.TextBlock();
  text.text = "Сцена 1";
  text.color = "white";
  text.fontSize = 48;
  blackScreen.addControl(text);

  // Убираем черный экран через 2 секунды
  setTimeout(() => {
    blackScreen.removeControl(rectangle);
    blackScreen.removeControl(text);
  }, 2000);

  // Запуск рендеринга
  engine.runRenderLoop(function () {
    scene.render();
  });

  // Подгонка рендеринга под размеры окна
  window.addEventListener("resize", function () {
    engine.resize();
  });
});
