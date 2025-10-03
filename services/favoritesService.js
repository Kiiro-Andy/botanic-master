import { db } from "./firebase.js";
import { doc, setDoc, deleteDoc, getDocs, collection } from "firebase/firestore";

export const addFavorite = async (userId, plant) => {
  try {
    if (!plant?.id) throw new Error("La planta no tiene id");

    const id = plant.id.toString();

    const data = {
      id,
      common_name: plant.common_name || "",
      scientific_name: plant.scientific_name || "",
      image_url: plant.image_url || "",
    };

    // Guardar en Firestore bajo el usuario correspondiente
    await setDoc(doc(db, "favorites", userId, "plants", id), data);

    return data;
  } catch (error) {
    console.error("Error al agregar favorito:", error);
    throw error;
  }
};

// Eliminar de favoritos
export const removeFavorite = async (userId, plantId) => {
  try {
    await deleteDoc(doc(db, "favorites", userId, "plants", plantId.toString()));
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    throw error;
  }
};

// Obtener lista de favoritos
export const getFavorites = async (userId) => {
  try {
    const snapshot = await getDocs(collection(db, "favorites", userId, "plants"));

    return snapshot.docs
      .map((d) => d.data())
      .filter((fav) => fav && fav.id);
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return [];
  }
};