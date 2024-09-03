function setupTutorial(scene, engine, createCamera) {
  const advancedTexture =
    BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  const instructionText = new BABYLON.GUI.TextBlock();
  instructionText.text = "Обучение";
  instructionText.color = "white";
  instructionText.fontSize = 36;
  advancedTexture.addControl(instructionText);

  let tutorialStep = 0;

  const startNextStep = () => {
    switch (tutorialStep) {
      case 1:
        instructionText.text = "Чтобы ходить, используйте клавиши WASD";
        setTimeout(() => {
          instructionText.text = "";
          tutorialStep++;
          startNextStep();
        }, 3000);
        break;
      case 2:
        instructionText.text = 'Чтобы открыть инвентарь, нажмите "L"';
        break;
      case 3:
        instructionText.text =
          "Чтобы взять в руки предмет, нажмите цифру ячейки";
        break;
      case 4:
        instructionText.text = "Обучение пройдено";

        // Добавляем таймер перехода на уровень 2 через 5 секунд
        setTimeout(() => {
          engine.stopRenderLoop(); // Остановить текущий рендеринг

          const level2Scene = setupLevel2(engine, createCamera); // Настроить уровень 2 и передать createCamera

          // Устанавливаем рендеринг уровня 2 после создания камеры
          engine.runRenderLoop(() => {
            level2Scene.render();
          });

          // Вызов setupInventory для настройки инвентаря на уровне 2
          setupInventory(level2Scene, level2Scene.activeCamera);
        }, 5000); // 5 секунд
        break;
    }
  };

  tutorialStep = 1;
  startNextStep();

  window.addEventListener("keydown", function (event) {
    if (tutorialStep === 2 && (event.key === "l" || event.key === "L")) {
      instructionText.text = "";
      tutorialStep++;
      startNextStep();
    }
  });

  window.addEventListener("keydown", function (event) {
    const selectedKey = event.key;
    if (tutorialStep === 3 && ["1", "2", "3", "4"].includes(selectedKey)) {
      instructionText.text = "";
      tutorialStep++;
      startNextStep();
    }
  });
}
