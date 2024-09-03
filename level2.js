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

    // Загрузка модели NPC (геодезист)
    BABYLON.SceneLoader.ImportMesh(
      "",
      "./",
      "geodesist.glb",
      scene,
      function (meshes) {
        const npc = meshes[0];
        npc.position = new BABYLON.Vector3(0, 0, 0); // Начальная позиция NPC
      }
    );

    // --- Добавление звонка и логики управления ---

    // Создание аудио объектов для рингтона и сообщения
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

    let callAnswered = false; // Флаг, указывающий, что звонок уже принят

    // Отображение инструкции на экране
    const phoneInstruction = new BABYLON.GUI.TextBlock();
    phoneInstruction.text = "Чтобы ответить на звонок, достаньте телефон";
    phoneInstruction.color = "white";
    phoneInstruction.fontSize = 24;
    advancedTexture.addControl(phoneInstruction);

    // Обработчик событий для отслеживания выбора телефона и нажатия клавиши F
    window.addEventListener("keydown", function (event) {
      if (
        event.key.toLowerCase() === "f" &&
        window.selectedItem &&
        window.selectedItem.name === "Телефон" &&
        !callAnswered
      ) {
        // Остановить рингтон и воспроизвести сообщение
        ringtoneSound.stop();
        messageSound.play();
        phoneInstruction.text = ""; // Убрать инструкцию
        callAnswered = true; // Установить флаг принятого звонка

        // Удалить надпись "Нажмите F, чтобы ответить на звонок"
        advancedTexture.removeControl(phoneInstruction);

        // Отобразить новое сообщение после окончания воспроизведения
        messageSound.onEndedObservable.addOnce(() => {
          const nextInstruction = new BABYLON.GUI.TextBlock();
          nextInstruction.text =
            "Вас ждут на объекте, подойдите к прорабу за документами.";
          nextInstruction.color = "white";
          nextInstruction.fontSize = 24;
          advancedTexture.addControl(nextInstruction);
        });
      }
    });

    // Обработчик для отслеживания выбора телефона
    window.addEventListener("keydown", function (event) {
      if (
        window.selectedItem &&
        window.selectedItem.name === "Телефон" &&
        !callAnswered
      ) {
        // Телефон выбран, показываем следующую инструкцию
        phoneInstruction.text = "Нажмите F, чтобы ответить на звонок";
      }
    });
  }, 2000); // 2 секунды задержки для черного экрана

  return scene;
}
