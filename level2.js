function loadLevel2(scene, camera) {
  // Объявляем глобальные переменные для ящика и машины
  let fileShelf = null;
  let car = null;
  let documentsTaken = false; // Флаг для отслеживания, были ли документы взяты
  let canShowTakeDocumentsText = false; // Флаг для показа текста о документах
  let documentsTakenTextShown = false;

  // Загрузка локации
  BABYLON.SceneLoader.Append(
    "./models/maps/",
    "level2.glb",
    scene,
    function (loadedScene) {
      loadedScene.meshes.forEach((mesh) => {
        mesh.checkCollisions = true;
      });

      // Устанавливаем начальную позицию камеры
      camera.position = new BABYLON.Vector3(-3, 2, -2); // Пример позиции камеры
      camera.setTarget(new BABYLON.Vector3(40, 0, -100)); // Направляем камеру на центр сцены

      // Загрузка ящика
      BABYLON.SceneLoader.ImportMesh(
        "",
        "./models/interior/",
        "file_shelf.glb",
        scene,
        function (meshes) {
          fileShelf = meshes[0]; // Присваиваем первый mesh ящику
          meshes.forEach((mesh) => (mesh.checkCollisions = true));

          // Устанавливаем позицию ящика
          fileShelf.position = new BABYLON.Vector3(4.6, 0, -9.4); // Новая позиция ящика (x, y, z)
          // Поворот ящика
          fileShelf.rotation = new BABYLON.Vector3(
            0,
            BABYLON.Tools.ToRadians(90),
            0
          );
        }
      );

      // Загрузка машины
      BABYLON.SceneLoader.ImportMesh(
        "",
        "./models/interior/",
        "door.glb",
        scene,
        function (meshes) {
          car = meshes[0]; // Присваиваем первый mesh машине
          meshes.forEach((mesh) => (mesh.checkCollisions = false));

          // Устанавливаем позицию машины
          car.position = new BABYLON.Vector3(-13.9, 0, 0); // Новая позиция машины (x, y, z)
          // Устанавливаем размер машины через масштабирование
          car.scaling = new BABYLON.Vector3(2.5, 1.5, 1); // Масштаб (x, y, z)
        }
      );

      // Загрузка стола
      BABYLON.SceneLoader.ImportMesh(
        "",
        "/models/interior/",
        "desk.glb",
        scene,
        function (meshes) {
          desk = meshes[0]; // Присваиваем первый mesh столу
          meshes.forEach((mesh) => (mesh.checkCollisions = true));

          // Устанавливаем позицию стола
          desk.position = new BABYLON.Vector3(4.3, 0, -11.2); // Новая позиция стола
          // Устанавливаем размер стола через масштабирование
          desk.scaling = new BABYLON.Vector3(2.2, 2.2, 2.2); // Масштаб (x, y, z)
          desk.rotation = new BABYLON.Vector3(
            0,
            BABYLON.Tools.ToRadians(270),
            0
          );
        }
      );

      // Загрузка стула
      BABYLON.SceneLoader.ImportMesh(
        "",
        "./models/interior/",
        "office_chair.glb",
        scene,
        function (meshes) {
          chair = meshes[0]; // Присваиваем первый mesh стулу
          meshes.forEach((mesh) => (mesh.checkCollisions = false));

          // Устанавливаем позицию стула
          chair.position = new BABYLON.Vector3(3, 0.3, -11); // Новая позиция стула
          // Устанавливаем размер стула через масштабирование
          chair.scaling = new BABYLON.Vector3(1.4, 1.4, 1.4); // Масштаб (x, y, z)
          chair.rotation = new BABYLON.Vector3(
            0,
            BABYLON.Tools.ToRadians(120),
            0
          );
        }
      );
    }
  );

  let isPhoneInHand = false;
  let canTakeDocuments = false;

  // Надпись для вывода текста
  const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
    "UI",
    true,
    scene
  );
  const instructionText = new BABYLON.GUI.TextBlock();
  instructionText.text = "";
  instructionText.color = "white";
  instructionText.fontSize = 40;
  instructionText.verticalAlignment =
    BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  instructionText.top = "-10%";
  advancedTexture.addControl(instructionText);

  // Таймер звонка
  setTimeout(() => {
    const ringtone = new BABYLON.Sound("ringtone", "rington.mp3", scene, null, {
      loop: true,
      autoplay: true,
    });

    instructionText.text = "Достаньте телефон, чтобы ответить на звонок";

    const phonePickupListener = (event) => {
      if (event.code === "Digit1") {
        // Клавиша '1' в любом раскладе
        isPhoneInHand = true;
        instructionText.text = "Нажмите 'F', чтобы ответить на звонок";
      }
    };
    window.addEventListener("keydown", phonePickupListener);

    const answerCallListener = (event) => {
      if (event.code === "KeyF") {
        // Клавиша 'F' в любом раскладе
        if (isPhoneInHand) {
          ringtone.stop();
          instructionText.text = "";

          const messageSound = new BABYLON.Sound(
            "message",
            "message1.wav",
            scene,
            function () {
              // После завершения воспроизведения звука, устанавливаем флаг для показа надписи
              canShowTakeDocumentsText = true;
              instructionText.text = "Возьмите документы в ящике";
            },
            { autoplay: true }
          );

          window.removeEventListener("keydown", phonePickupListener);
          window.removeEventListener("keydown", answerCallListener);
        } else {
          instructionText.text = "Вы должны держать телефон, чтобы ответить";
        }
      }
    };
    window.addEventListener("keydown", answerCallListener);
  }, 5000);

  // Функция-обработчик для клавиши "E"
  function handleKeyDown(event) {
    if (event.code === "KeyE") {
      // Клавиша 'E' в любом раскладе
      if (canTakeDocuments && !documentsTaken) {
        documentsTaken = true; // Устанавливаем флаг, что документы взяты

        // Добавляем документы в инвентарь под номером 5
        const newDocument = {
          name: "Документы",
          model: "./models/inventory/book.glb",
          scaling: new BABYLON.Vector3(0.2, 0.2, 0.2),
          position: new BABYLON.Vector3(0.3, -0.1, 1),
          rotation: new BABYLON.Vector3(0, Math.PI / 2, -7),
        };

        window.updateInventory(5, newDocument);
        console.log("Документы добавлены в инвентарь под номером 5.");
      } else if (documentsTaken && car) {
        const distanceToCar = BABYLON.Vector3.Distance(
          camera.position,
          car.position
        );

        if (distanceToCar < 5) {
          // Логика для посадки в машину при наличии документов
          instructionText.text = "Вы вышли из офиса";
          // Удаляем обработчик для клавиши "E", так как игрок сел в машину
          window.removeEventListener("keydown", handleKeyDown);

          // Переход на уровень 3
          if (window.onCarEntered) {
            window.onCarEntered();
          }
        }
      }
    }
  }

  // Добавляем обработчик события для клавиши "E"
  window.addEventListener("keydown", handleKeyDown);

  // Проверка расстояния до ящика и машины
  scene.registerBeforeRender(function () {
    if (fileShelf && canShowTakeDocumentsText && !documentsTaken) {
      // Проверяем только после завершения звонка
      const distanceToShelf = BABYLON.Vector3.Distance(
        camera.position,
        fileShelf.position
      );

      if (distanceToShelf < 3) {
        instructionText.text = "Нажмите 'E', чтобы взять документы";
        canTakeDocuments = true;
      } else {
        if (!window.selectedItem && !documentsTaken) {
          instructionText.text = "Возьмите документы в ящике";
        }
        canTakeDocuments = false;
      }
    }

    if (car) {
      const distanceToCar = BABYLON.Vector3.Distance(
        camera.position,
        car.position
      );

      if (documentsTaken) {
        if (distanceToCar < 5) {
          instructionText.text = "Нажмите 'E', чтобы выйти из офиса";
          documentsTakenTextShown = false; // Сбрасываем флаг
        } else {
          if (documentsTaken && !documentsTakenTextShown) {
            instructionText.text = "Вы взяли документы. Проверьте инвентарь";
            documentsTakenTextShown = true;

            // Устанавливаем таймер для скрытия сообщения через 3 секунды
            setTimeout(() => {
              instructionText.text = "Подойдите к двери, чтобы покинуть офис";
            }, 3000);
          }
        }
      } else {
        if (distanceToCar < 5) {
          instructionText.text = "Возьмите документы прежде чем покинуть офис";
        }
      }
    }
  });
}
