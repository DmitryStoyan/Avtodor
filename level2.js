function setupLevel2(engine, createCamera) {
  const scene = new BABYLON.Scene(engine);

  // Создание черного фона и текста "Уровень 2"
  const advancedTexture =
    BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  const blackBackground = new BABYLON.GUI.Rectangle();
  blackBackground.width = "100%";
  blackBackground.height = "100%";
  blackBackground.background = "black";
  advancedTexture.addControl(blackBackground);

  const levelText = new BABYLON.GUI.TextBlock();
  levelText.text = "Уровень 2";
  levelText.color = "white";
  levelText.fontSize = 48;
  advancedTexture.addControl(levelText);

  // Используем существующую функцию для создания камеры
  const camera = createCamera(scene);

  // Создание текстового блока для тумбочки
  const shelfInstruction = new BABYLON.GUI.TextBlock();
  shelfInstruction.text = "Нажмите 'E', чтобы взять документы";
  shelfInstruction.color = "white";
  shelfInstruction.fontSize = 24;
  shelfInstruction.isVisible = false;

  // Устанавливаем позицию текста ниже
  shelfInstruction.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  shelfInstruction.verticalAlignment =
    BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  shelfInstruction.top = "-100px";

  advancedTexture.addControl(shelfInstruction);

  const center = new BABYLON.Vector3(0, 0, 0); // Центр сцены
  const scale = 1; // Масштаб

  // Добавляем текстовый блок для отображения сообщения, что документы уже в инвентаре
  const documentAlreadyTakenText = new BABYLON.GUI.TextBlock();
  documentAlreadyTakenText.text = "Документы уже у вас в инвентаре";
  documentAlreadyTakenText.color = "white";
  documentAlreadyTakenText.fontSize = 24;
  documentAlreadyTakenText.isVisible = false;
  documentAlreadyTakenText.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  documentAlreadyTakenText.verticalAlignment =
    BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  documentAlreadyTakenText.top = "-150px";
  advancedTexture.addControl(documentAlreadyTakenText);

  let documentsTaken = false; // Флаг для проверки, были ли взяты документы

  // Задержка перед началом уровня 2
  setTimeout(() => {
    // Удаление черного фона и текста
    advancedTexture.removeControl(blackBackground);
    advancedTexture.removeControl(levelText);

    // Настройки сцены уровня 2
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(1, 1, 0),
      scene
    );
    light.intensity = 0.7;

    // Создание земли
    const ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 100, height: 100 },
      scene
    );

    // Применение текстуры к земле
    const groundMaterial = new BABYLON.StandardMaterial(
      "groundMaterial",
      scene
    );
    groundMaterial.diffuseTexture = new BABYLON.Texture("./ground.jpg", scene); // Путь к текстуре земли
    ground.material = groundMaterial;
    ground.checkCollisions = true; // Земля учитывает столкновения

    // Загрузка модели карты второго уровня
    BABYLON.SceneLoader.Append("", "trailer_park.glb", scene, function (scene) {
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

    // Загрузка модели тумбочки
    BABYLON.SceneLoader.ImportMesh(
      "",
      "./",
      "file_shelf.glb",
      scene,
      function (shelfMeshes) {
        const shelf = shelfMeshes[0];
        shelf.position = new BABYLON.Vector3(center.x + 10, 0, center.z);
        shelf.scaling = new BABYLON.Vector3(scale, scale, scale);
        shelf.checkCollisions = true; // Тумбочка учитывает столкновения

        scene.registerBeforeRender(() => {
          const distance = BABYLON.Vector3.Distance(
            camera.position,
            shelf.position
          );
          if (distance < 10) {
            shelfInstruction.isVisible = true;
          } else {
            shelfInstruction.isVisible = false;
          }
        });

        window.addEventListener("keydown", function (event) {
          if (event.key.toLowerCase() === "e" && shelfInstruction.isVisible) {
            if (!documentsTaken) {
              console.log("Документы взяты");

              const documents = {
                name: "Документы",
                model: "book.glb",
                scaling: new BABYLON.Vector3(0.2, 0.2, 0.2),
                position: new BABYLON.Vector3(0.7, -0.4, 1.3),
                rotation: new BABYLON.Vector3(0, Math.PI / 2, 0),
              };

              window.updateInventory(5, documents);
              documentsTaken = true; // Устанавливаем флаг, что документы взяты
              shelfInstruction.text = "Документы взяты!";
              setTimeout(() => (shelfInstruction.isVisible = false), 2000);
            } else {
              // Если документы уже взяты, показываем сообщение на 2 секунды
              documentAlreadyTakenText.isVisible = true;
              setTimeout(() => {
                documentAlreadyTakenText.isVisible = false;
              }, 2000);
            }
          }
        });
      }
    );

    // Загрузка модели NPC (геодезист)
    BABYLON.SceneLoader.ImportMesh(
      "",
      "./",
      "geodesist.glb",
      scene,
      function (npcMeshes) {
        const npc = npcMeshes[0];
        npc.position = new BABYLON.Vector3(0, 0, 0);
        npc.checkCollisions = true; // NPC учитывает столкновения
      }
    );

    // Добавление звонка и логики управления
    const ringtoneSound = new BABYLON.Sound(
      "ringtone",
      "./rington.mp3",
      scene,
      null,
      {
        loop: true,
        autoplay: true,
      }
    );

    const messageSound = new BABYLON.Sound(
      "message",
      "./message1.wav",
      scene,
      null,
      {
        loop: false,
        autoplay: false,
      }
    );

    let callAnswered = false;

    const phoneInstruction = new BABYLON.GUI.TextBlock();
    phoneInstruction.text = "Чтобы ответить на звонок, достаньте телефон";
    phoneInstruction.color = "white";
    phoneInstruction.fontSize = 24;
    advancedTexture.addControl(phoneInstruction);

    window.addEventListener("keydown", function (event) {
      // Проверка, если телефон был выбран и игрок достал его
      if (
        window.selectedItem &&
        window.selectedItem.name === "Телефон" &&
        !callAnswered
      ) {
        phoneInstruction.text = "Нажмите 'F', чтобы ответить на звонок";
      }

      if (
        event.key.toLowerCase() === "f" &&
        window.selectedItem &&
        window.selectedItem.name === "Телефон" &&
        !callAnswered
      ) {
        ringtoneSound.stop();
        messageSound.play();
        phoneInstruction.text = "";
        callAnswered = true;
        advancedTexture.removeControl(phoneInstruction);

        messageSound.onEndedObservable.addOnce(() => {
          const nextInstruction = new BABYLON.GUI.TextBlock();
          nextInstruction.text =
            "Вас ждут на объекте, подойдите к прорабу за документами.";
          nextInstruction.color = "white";
          nextInstruction.fontSize = 24;
          advancedTexture.addControl(nextInstruction);

          // Устанавливаем таймер на 5 секунд для удаления текста
          setTimeout(() => {
            advancedTexture.removeControl(nextInstruction);
          }, 5000); // 5000 миллисекунд = 5 секунд
        });
      }
    });
  }, 2000); // Конец задержки перед началом уровня 2

  return scene;
}
