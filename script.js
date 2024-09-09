function setupInventory(scene, camera) {
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
  inventoryPanel.name = "inventoryPanel";
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

  // Use globalInventoryItems instead of inventoryItems
  for (let key in globalInventoryItems) {
    const item = globalInventoryItems[key];
    const itemSlot = new BABYLON.GUI.TextBlock();
    itemSlot.text = `${key}: ${item.name}`;
    itemSlot.height = "30px";
    itemSlot.color = "white";
    itemSlot.fontSize = 20;
    itemSlot.textHorizontalAlignment =
      BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    itemSlot.paddingLeft = "10px";
    itemSlot.name = key; // Добавляем имя для удаления
    inventoryPanel.addControl(itemSlot);
    inventorySlots[key] = itemSlot;
  }

  window.addEventListener("keydown", function (event) {
    if (event.code === "KeyL") {
      inventoryPanel.isVisible = !inventoryPanel.isVisible;
      console.log(globalInventoryItems); // Use globalInventoryItems here
    }

    if (!inventoryPanel.isVisible) {
      return;
    }

    // Используем event.code для работы с клавишами вне зависимости от раскладки
    const selectedKey = event.code;

    if (selectedKey === "Digit0") {
      window.selectedItem = null;
      console.log("Вы убрали все из рук.");

      const oldItem = scene.getMeshByName("selectedItem");
      if (oldItem) {
        oldItem.dispose();
      }
      return;
    }

    // Use globalInventoryItems instead of inventoryItems
    const itemIndex = selectedKey.replace("Digit", ""); // Получаем индекс из кода (например, из 'Digit1' -> 1)
    if (globalInventoryItems[itemIndex]) {
      window.selectedItem = globalInventoryItems[itemIndex];
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

  // Функция для обновления инвентаря
  window.updateInventory = function (newItemKey, newItem) {
    if (!newItem) {
      // Удаляем предмет из инвентаря
      delete globalInventoryItems[newItemKey];
      const itemSlot = inventorySlots[newItemKey];
      if (itemSlot) {
        inventoryPanel.removeControl(itemSlot); // Удаляем слот из инвентаря в UI
        delete inventorySlots[newItemKey];
      }
      console.log("Предмет удалён из инвентаря", newItemKey);
    } else {
      // Добавление нового предмета
      globalInventoryItems[newItemKey] = newItem;
      const itemSlot = new BABYLON.GUI.TextBlock();
      itemSlot.text = `${newItemKey}: ${newItem.name}`;
      itemSlot.height = "30px";
      itemSlot.color = "white";
      itemSlot.fontSize = 20;
      itemSlot.textHorizontalAlignment =
        BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      itemSlot.paddingLeft = "10px";
      inventoryPanel.addControl(itemSlot);
      inventorySlots[newItemKey] = itemSlot;
      console.log("Инвентарь обновлен", globalInventoryItems);
    }
  };

  // Функция для удаления предмета из инвентаря
  window.removeInventoryItem = function (itemKey) {
    delete globalInventoryItems[itemKey]; // Удаляем предмет из глобального инвентаря
    const itemSlot = inventorySlots[itemKey]; // Получаем слот предмета в инвентаре
    if (itemSlot) {
      itemSlot.dispose(); // Удаляем слот из UI
      delete inventorySlots[itemKey]; // Удаляем слот из списка слотов
    }
    console.log(`Предмет ${itemKey} удален из инвентаря.`);
  };
}
