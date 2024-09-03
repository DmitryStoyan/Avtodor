window.selectedItem = null;

function setupInventory(scene, camera) {
  const inventoryItems = {
    1: {
      name: "Телефон",
      model: "phone.glb",
      scaling: new BABYLON.Vector3(0.2, 0.2, 0.2),
      position: new BABYLON.Vector3(0.7, -0.4, 1),
      rotation: new BABYLON.Vector3(0, Math.PI, 0),
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

  const advancedTexture =
    BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  const inventoryPanel = new BABYLON.GUI.StackPanel();
  inventoryPanel.width = "220px";
  inventoryPanel.isVertical = true;
  inventoryPanel.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  inventoryPanel.verticalAlignment =
    BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  inventoryPanel.isVisible = false;
  inventoryPanel.name = "inventoryPanel"; // Установка имени для получения доступа позже
  advancedTexture.addControl(inventoryPanel);

  const inventoryHeader = new BABYLON.GUI.TextBlock();
  inventoryHeader.text = "Инвентарь";
  inventoryHeader.height = "40px";
  inventoryHeader.color = "white";
  inventoryHeader.fontSize = 24;
  inventoryPanel.addControl(inventoryHeader);

  const removeItemSlot = new BABYLON.GUI.TextBlock();
  removeItemSlot.text = "0: Убрать все из рук";
  removeItemSlot.height = "30px";
  removeItemSlot.color = "white";
  removeItemSlot.fontSize = 20;
  removeItemSlot.textHorizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  removeItemSlot.paddingLeft = "10px";
  inventoryPanel.addControl(removeItemSlot);

  const inventorySlots = {};

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

  window.addEventListener("keydown", function (event) {
    if (event.key === "l" || event.key === "L") {
      inventoryPanel.isVisible = !inventoryPanel.isVisible;
    }

    // Проверка, открыт ли инвентарь
    if (!inventoryPanel.isVisible) {
      return; // Если инвентарь закрыт, выходим из функции
    }

    const selectedKey = event.key;

    if (selectedKey === "0") {
      window.selectedItem = null;
      console.log("Вы убрали все из рук.");

      const oldItem = scene.getMeshByName("selectedItem");
      if (oldItem) {
        oldItem.dispose();
      }
      return;
    }

    if (inventoryItems[selectedKey]) {
      window.selectedItem = inventoryItems[selectedKey];
      console.log(`Вы выбрали: ${window.selectedItem.name}`);

      const oldItem = scene.getMeshByName("selectedItem");
      if (oldItem) {
        oldItem.dispose();
      }

      BABYLON.SceneLoader.ImportMesh(
        "",
        "./",
        window.selectedItem.model,
        scene,
        function (meshes) {
          const itemMesh = meshes[0];
          itemMesh.name = "selectedItem";
          itemMesh.parent = camera;
          itemMesh.scaling = window.selectedItem.scaling;
          itemMesh.position = window.selectedItem.position;
          if (window.selectedItem.rotation) {
            itemMesh.rotation = window.selectedItem.rotation;
          }
        }
      );
    }
  });

  // Сброс инвентаря
  function resetInventory() {
    console.log("Инвентарь сброшен");
    window.selectedItem = null; // Сбрасываем выбранный предмет

    const inventoryPanel = advancedTexture.getControlByName("inventoryPanel");
    if (inventoryPanel) {
      inventoryPanel.isVisible = false;
    }

    // Удаляем текущий предмет из рук
    const oldItem = scene.getMeshByName("selectedItem");
    if (oldItem) {
      oldItem.dispose();
    }
  }

  // Экспортируем функцию сброса инвентаря
  window.resetInventory = resetInventory;
}
