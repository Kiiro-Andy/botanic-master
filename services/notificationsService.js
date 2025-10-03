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
      body: plant.common_name || plant.scientific_name,
      data: { plant },
    },
    trigger: null,
  });
}


export async function notifyWeatherPlant(plant) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Planta recomendada para tu clima 🌱",
      body: plant.common_name || plant.scientific_name,
      data: { plant },
    },
    trigger: null, 
  });
}

export function handleNotificationResponse(navigation) {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const plant = response.notification.request.content.data.plant;
    if (plant) {
      navigation.navigate("PlantDetail", { plant });
    }
  });
  return subscription;
}