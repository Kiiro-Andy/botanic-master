import { db } from "./firebase.js";
import { doc, setDoc, deleteDoc, getDocs, collection } from "firebase/firestore";

export const addFavorite = async (userId, plant) => {
  try {
    if (!plant?.id) throw new Error("La planta no tiene id");

    const id = plant.id.toString();
    await setDoc(doc(db, "favorites", userId, "plants", id), { id });

    return { id };
  } catch (error) {
    console.error("Error al agregar favorito:", error);
    throw error;
  }
};

export const removeFavorite = async (userId, plantId) => {
  try {
    await deleteDoc(doc(db, "favorites", userId, "plants", plantId.toString()));
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    throw error;
  }
};

export const getFavorites = async (userId) => {
  try {
    const snapshot = await getDocs(collection(db, "favorites", userId, "plants"));
    return snapshot.docs.map((d) => ({ id: d.id }));
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return [];
  }
};
