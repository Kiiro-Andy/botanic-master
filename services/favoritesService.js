import { db } from "./firebase.js";
import { doc, setDoc, deleteDoc, getDocs, collection } from "firebase/firestore";

export const addFavorite = async (userId, plant) => {
    try {
    await setDoc(doc(db, "favorites", userId, "plants", plant.id.toString()), plant);
  } catch (error) {
    console.error("Error al agregar favorito:", error);
  }
};

export const removeFavorite = async (userId, plantId) => {
      try {
    await deleteDoc(doc(db, "favorites", userId, "plants", plantId.toString()));
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
  }
};

export const getFavorites = async (userId) => {
  try {
    const snapshot = await getDocs(collection(db, "favorites", userId, "plants"));
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return [];
  }
};

