function loadLevel1(scene, camera, onProceedToNextLevel) {
  // Создаем черный экран для начала обучения
  const blackScreen = new BABYLON.GUI.Rectangle();
  blackScreen.width = "100%";
  blackScreen.height = "100%";
  blackScreen.background = "black";

  const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
    "UI",
    true,
    scene
  );

  advancedTexture.addControl(blackScreen);

  // Создаем текст для начала обучения
  const trainingText = new BABYLON.GUI.TextBlock();
  trainingText.text = "Обучение";
  trainingText.color = "white";
  trainingText.fontSize = 36;
  blackScreen.addControl(trainingText);

  // Удаляем черный экран через 2 секунды
  setTimeout(() => {
    blackScreen.dispose(); // Убираем черный экран
    startLevel(scene, camera, advancedTexture, onProceedToNextLevel); // Начало уровня
  }, 2000);
}

function startLevel(scene, camera, advancedTexture, onProceedToNextLevel) {
  // Инструкция: "Для перемещения используйте клавиши WASD"
  const instructionText = new BABYLON.GUI.TextBlock();
  instructionText.text =
    "Для перемещения используйте клавиши WASD или стрелки на клавиатуре";
  instructionText.color = "white";
  instructionText.fontSize = 38;
  instructionText.verticalAlignment =
    BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  instructionText.top = "0%";
  advancedTexture.addControl(instructionText);

  // Через 5 секунд сменяем текст на "Чтобы открыть инвентарь, нажмите 'L'"
  setTimeout(() => {
    instructionText.text = "Чтобы открыть/закрыть инвентарь, нажмите 'L'";
  }, 5000);

  // Функция для проверки нажатия WASD независимо от раскладки
  function isMovementKey(event) {
    const key = event.key.toLowerCase();
    return (
      event.code === "KeyW" || // W
      event.code === "KeyA" || // A
      event.code === "KeyS" || // S
      event.code === "KeyD" || // D
      key === "стрелка вверх" ||
      key === "стрелка влево" || // Стрелки на русском
      key === "стрелка вниз" ||
      key === "стрелка вправо" // Стрелки на русском
    );
  }

  // Функция для проверки нажатия клавиши 'L'
  function isInventoryKey(event) {
    return event.code === "KeyL"; // Работает независимо от раскладки
  }

  // Слушаем нажатие клавиши 'L'
  window.addEventListener("keydown", function onInventoryOpen(event) {
    if (isInventoryKey(event)) {
      instructionText.text =
        "Чтобы выбрать предмет из инвентаря, используйте цифры на клавиатуре";

      // После нажатия 'L' удаляем этот обработчик, чтобы он больше не срабатывал
      window.removeEventListener("keydown", onInventoryOpen);

      // Слушаем нажатие цифр на клавиатуре (выбор предмета)
      window.addEventListener("keydown", function onSelectItem(event) {
        if (event.key >= "1" && event.key <= "9") {
          instructionText.text = "Обучение пройдено";

          // Создаем вторую надпись ниже основной
          const additionalText = new BABYLON.GUI.TextBlock();
          additionalText.text = "Для начала прохождения уровней нажмите кнопку";
          additionalText.color = "white";
          additionalText.fontSize = 24;
          additionalText.verticalAlignment =
            BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
          additionalText.top = "20%"; // Расположение ниже первой надписи
          advancedTexture.addControl(additionalText);

          // Добавляем кнопку "Начать тренажер"
          const startButton = BABYLON.GUI.Button.CreateSimpleButton(
            "startButton",
            "Начать тренажер"
          );
          startButton.width = "200px";
          startButton.height = "60px";
          startButton.color = "white";
          startButton.background = "green";
          startButton.verticalAlignment =
            BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
          startButton.top = "-10%";
          advancedTexture.addControl(startButton);

          // Обработчик нажатия кнопки для перехода на следующий уровень
          startButton.onPointerUpObservable.add(() => {
            if (onProceedToNextLevel) {
              onProceedToNextLevel(); // Переход на второй уровень
            }
          });

          // Удаляем обработчик после выбора предмета
          window.removeEventListener("keydown", onSelectItem);
        }
      });
    }
  });

  // Загрузка карты уровня
  BABYLON.SceneLoader.Append(
    "./models/maps/",
    "level1.glb",
    scene,
    function (loadedScene) {
      loadedScene.meshes.forEach((mesh) => {
        mesh.checkCollisions = true; // Включаем коллизии для всех мешей
      });

      // Устанавливаем начальную позицию камеры
      camera.position = new BABYLON.Vector3(0, 1.2, -10); // Пример позиции камеры
      camera.setTarget(BABYLON.Vector3.Zero()); // Направляем камеру на центр сцены
    }
  );
}
