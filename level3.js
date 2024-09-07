function loadLevel3(scene, camera) {
  let geodesist = null;
  let tachometer = null;
  let isNearGeodesist = false;
  let documentDelivered = false;
  let isNearTachometer = false;
  let pointsChecked = 0;
  let messageTimeout = null;

  // Загрузка локации
  BABYLON.SceneLoader.Append(
    "./models/maps/",
    "level3.glb",
    scene,
    function (loadedScene) {
      loadedScene.meshes.forEach((mesh) => (mesh.checkCollisions = true));
      camera.position = new BABYLON.Vector3(3, 1.7, -1);
      camera.setTarget(new BABYLON.Vector3(0, 0, 50));
      displayMessage("Передайте документы геодезисту");

      BABYLON.SceneLoader.ImportMesh(
        "",
        "./models/interior/",
        "tachometer.glb",
        scene,
        function (meshes) {
          tachometer = meshes[0];
          meshes.forEach((mesh) => (mesh.checkCollisions = false));
          tachometer.position = new BABYLON.Vector3(5, 0, 9);
        }
      );
    }
  );

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

  function displayMessage(text, duration = 0) {
    instructionText.text = text;
    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }
    if (duration > 0) {
      messageTimeout = setTimeout(() => {
        instructionText.text = "";
      }, duration);
    }
  }

  BABYLON.SceneLoader.ImportMesh(
    "",
    "./models/npc/",
    "bot.glb",
    scene,
    function (meshes) {
      geodesist = meshes[0];
      geodesist.position = new BABYLON.Vector3(1, -0.3, 3);
      geodesist.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8); // Масштаб (x, y, z)
    }
  );

  const points = [
    { x: 10.3, y: 5.2, z: 8.7 },
    { x: 15.1, y: 4.8, z: 12.5 },
    { x: 50.0, y: 20.0, z: 40.0 }, // Точка с сильным отклонением
  ];

  let currentPointIndex = 0;
  let isFixingPoint = false;

  scene.registerBeforeRender(function () {
    if (geodesist) {
      const distanceToGeodesist = BABYLON.Vector3.Distance(
        camera.position,
        geodesist.position
      );
      if (distanceToGeodesist < 3 && !documentDelivered) {
        if (!isNearGeodesist) {
          displayMessage('Нажмите "E", чтобы передать документы');
        }
        isNearGeodesist = true;
      } else {
        if (isNearGeodesist) {
          displayMessage("");
        }
        isNearGeodesist = false;
      }
    }

    if (tachometer) {
      const distanceToTachometer = BABYLON.Vector3.Distance(
        camera.position,
        tachometer.position
      );
      if (distanceToTachometer < 3) {
        if (!isNearTachometer) {
          displayMessage('Нажмите "E", чтобы проверить точки');
        }
        isNearTachometer = true;
      } else {
        if (isNearTachometer) {
          displayMessage("");
        }
        isNearTachometer = false;
      }
    }
  });

  window.addEventListener("keydown", function (event) {
    if (event.code === "KeyE") {
      event.preventDefault();

      // Передача документов геодезисту
      if (isNearGeodesist && !documentDelivered) {
        if (!window.selectedItem || window.selectedItem.name !== "Документы") {
          displayMessage("Возьмите документы из инвентаря", 2000);
        } else {
          documentDelivered = true;
          displayMessage("Вы передали документы", 2000);
          delete globalInventoryItems[5];
          const oldItem = scene.getMeshByName("selectedItem");
          if (oldItem) oldItem.dispose();
          window.selectedItem = null;
          window.updateInventory();
        }
      }

      // Взаимодействие с тахеометром
      if (
        isNearTachometer &&
        !isFixingPoint &&
        currentPointIndex < points.length
      ) {
        const point = points[currentPointIndex];
        if (currentPointIndex === points.length - 1) {
          displayMessage(
            `Точка с сильным отклонением: (${point.x}, ${point.y}, ${point.z}). Нажмите 'R', чтобы исправить.`,
            0
          );
        } else {
          displayMessage(
            `Координаты точки: (${point.x}, ${point.y}, ${point.z})`,
            2000
          );
          currentPointIndex++;
        }
      }
    }

    // Исправление точки с отклонением
    if (event.code === "KeyR") {
      event.preventDefault();

      // Исправление возможно только после проверки всех точек
      if (
        isNearTachometer &&
        currentPointIndex === points.length - 1 &&
        !isFixingPoint
      ) {
        isFixingPoint = true;
        displayMessage("Значение исправлено", 2000);

        // Симуляция исправления отклоненной точки
        setTimeout(() => {
          displayMessage("");
          isFixingPoint = false;
          currentPointIndex++; // Двигаемся вперед после исправления точки
        }, 3000);
      }
    }
  });
}
