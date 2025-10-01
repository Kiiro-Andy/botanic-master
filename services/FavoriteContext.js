import React, { createContext, useContext, useState, useEffect } from "react";
import { getFavorites, addFavorite, removeFavorite } from "./favoritesService";
import { auth } from "./firebase.js"; 

const FavoriteContext = createContext();

export function FavoriteProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = auth.currentUser;
      if (user) {
        const favs = await getFavorites(user.uid);
        setFavorites(favs);
      }
    };
    fetchFavorites();
  }, []);

  const toggleFavorite = async (plant) => {
    const user = auth.currentUser;
    if (!user) return;

    const isFav = favorites.some((p) => p.id === plant.id);

    if (isFav) {
      await removeFavorite(user.uid, plant.id);
      setFavorites(favorites.filter((p) => p.id !== plant.id));
    } else {
      await addFavorite(user.uid, plant);
      setFavorites([...favorites, plant]);
    }
  };

  const isFavorite = (plantId) => {
    return favorites.some((p) => p.id === plantId);
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
