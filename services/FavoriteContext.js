
import React, { createContext, useContext, useState, useEffect } from "react";
import { getFavorites, addFavorite, removeFavorite } from "./favoritesService";
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";

const FavoriteContext = createContext();

export function FavoriteProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const favs = await getFavorites(currentUser.uid);
        setFavorites(favs || []);
      } else {
        setFavorites([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleFavorite = async (plant) => {
    try {
      if (!user) {
        alert("Debes iniciar sesión para guardar favoritos");
        return;
      }

      if (!plant || !plant.id) {
        alert("No se puede agregar: la planta no tiene id");
        return;
      }

      const plantIdStr = plant.id.toString();
      const isFav = favorites.some((p) => p.id?.toString() === plantIdStr);

      if (isFav) {
        await removeFavorite(user.uid, plantIdStr);
        setFavorites((prev) => prev.filter((p) => p.id?.toString() !== plantIdStr));
      } else {
        // addFavorite devuelve lo que realmente se guardó
        const saved = await addFavorite(user.uid, plant);
        setFavorites((prev) => [...prev, saved]);
      }
    } catch (error) {
      console.error("toggleFavorite error:", error);
      alert("Error al actualizar favorito");
    }
  };

  const isFavorite = (plantId) => {
    if (!plantId) return false;
    return favorites.some((p) => p.id?.toString() === plantId.toString());
  };

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoriteContext);
}
