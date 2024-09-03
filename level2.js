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
  shelfInstruction.top = "-100px"; // Отступ от нижней границы экрана, можно настроить

  advancedTexture.addControl(shelfInstruction);

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

    // Загрузка модели офиса
    BABYLON.SceneLoader.ImportMesh(
      "",
      "./",
      "office.glb",
      scene,
      function (officeMeshes) {
        // Найти границы модели
        let min = new BABYLON.Vector3(
          Number.POSITIVE_INFINITY,
          Number.POSITIVE_INFINITY,
          Number.POSITIVE_INFINITY
        );
        let max = new BABYLON.Vector3(
          Number.NEGATIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
          Number.NEGATIVE_INFINITY
        );

        officeMeshes.forEach((mesh) => {
          const boundingInfo = mesh.getBoundingInfo();
          min = BABYLON.Vector3.Minimize(
            min,
            boundingInfo.boundingBox.minimumWorld
          );
          max = BABYLON.Vector3.Maximize(
            max,
            boundingInfo.boundingBox.maximumWorld
          );
        });

        const center = min.add(max).scale(0.5);
        const size = max.subtract(min);

        // Установка камеры в центр модели
        camera.position = new BABYLON.Vector3(
          center.x,
          center.y + size.y / 2,
          center.z + size.z * 1.5
        );
        camera.setTarget(center);

        // Масштабирование модели
        const maxSize = Math.max(size.x, size.y, size.z);
        const scale = 10.0 / maxSize; // Устанавливаем масштаб так, чтобы модель поместилась в сцену
        officeMeshes.forEach((mesh) => {
          mesh.scaling = new BABYLON.Vector3(scale, scale, scale);
        });

        // Убедиться, что камера не входит в геометрию модели
        camera.position.y += size.y / 2; // Поднять камеру немного выше, чтобы увидеть модель
        camera.rotation.x = -0.2; // Немного наклонить камеру вниз, чтобы лучше видеть

        // Загрузка модели тумбочки
        BABYLON.SceneLoader.ImportMesh(
          "",
          "./",
          "file_shelf.glb",
          scene,
          function (shelfMeshes) {
            const shelf = shelfMeshes[0];
            shelf.position = new BABYLON.Vector3(
              center.x + 10,
              center.y,
              center.z
            ); // Разместить тумбочку рядом с офисом
            shelf.scaling = new BABYLON.Vector3(scale, scale, scale);

            // Отображение надписи при приближении к тумбочке
            scene.registerBeforeRender(() => {
              const distance = BABYLON.Vector3.Distance(
                camera.position,
                shelf.position
              );
              if (distance < 10) {
                // Порог для отображения инструкции
                shelfInstruction.isVisible = true;
              } else {
                shelfInstruction.isVisible = false;
              }
            });

            // Обработка нажатия клавиши 'E'
            window.addEventListener("keydown", function (event) {
              if (
                event.key.toLowerCase() === "e" &&
                shelfInstruction.isVisible
              ) {
                // Логика для взаимодействия с тумбочкой
                console.log("Документы взяты");
                // Вы можете добавить здесь дополнительную логику, например, изменить текст на экране или выполнить другие действия
                shelfInstruction.text = "Документы взяты!";
                setTimeout(() => (shelfInstruction.isVisible = false), 2000); // Скрыть сообщение через 2 секунды
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
            npc.position = new BABYLON.Vector3(0, 0, 0); // Начальная позиция NPC
          }
        );
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

    window.addEventListener("keydown", function (event) {
      if (event.key.toLowerCase() === "e" && shelfInstruction.isVisible) {
        console.log("Документы взяты");

        // Добавление документов в инвентарь
        const documents = {
          name: "Документы",
          model: "book.glb",
          scaling: new BABYLON.Vector3(0.2, 0.2, 0.2),
          position: new BABYLON.Vector3(0.7, -0.4, 1.3),
          rotation: new BABYLON.Vector3(0, Math.PI / 2, 0),
        };

        window.updateInventory(5, documents);

        shelfInstruction.text = "Документы взяты!";
        setTimeout(() => (shelfInstruction.isVisible = false), 2000);
      }
    });
  }, 2000);

  return scene;
}
