import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, 
    shouldShowList: true,
    shouldPlaySound: false, 
    shouldSetBadge: false,
  }),
});


export async function registerForNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
    alert("No se otorgaron permisos de notificación");
  }
}


export async function notifyFavoritePlant(plant) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "❤️ Agregaste a favoritos",
      body: plant,
      data: { plantName: plant, type: "favoritePlant" },
    },
    trigger: null,
  });
}


export async function notifyWeatherPlant(plant) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Planta recomendada para tu clima 🌱",
      body: plant,
      data: { plantName: plant, type: "weatherPlant" },
    },
    trigger: null, 
  });
}

export function handleNotificationResponse(navigation) {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const { plantName} = response.notification.request.content.data;
    if (plantName) {
      navigation.navigate("PlantDetail", { plant: { common_name: plantName } });
    }
  });
  return subscription;
}