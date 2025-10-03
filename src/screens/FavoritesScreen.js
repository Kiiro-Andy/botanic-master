import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	FlatList,
	Image,
	TouchableOpacity,
	StyleSheet, ActivityIndicator
} from "react-native";
import { auth } from "../../services/firebase";
import { getFavorites } from "../../services/favoritesService";
import { onAuthStateChanged } from "firebase/auth";
import { getPlantDetails } from "../../services/trefle";

export default function FavoritesScreen({ navigation }) {
	const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		const fetchFavoritesDetails = async (uid) => {
      try {
        const favs = await getFavorites(uid); // solo ids
        if (!favs || favs.length === 0) {
          if (mounted) {
            setFavorites([]);
            setLoading(false);
          }
          return;
        }

        const favDetails = await Promise.all(
          favs.map(async (f) => {
            try {
              const detail = await getPlantDetails(f.id);
              return detail || null;
            } catch (err) {
              console.warn("Error cargando favorito:", f.id, err);
              return null;
            }
          })
        );

        if (mounted) {
          setFavorites(favDetails.filter(Boolean)); // eliminamos nulls
          setLoading(false);
        }
      } catch (e) {
        console.error("fetchFavorites error:", e);
        if (mounted) {
          setFavorites([]);
          setLoading(false);
        }
      }
    };

		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				fetchFavoritesDetails(user.uid);
      } else {
        setFavorites([]);
        setLoading(false);
      }
    });

		return () => {
			mounted = false;
      unsubscribe();
		};
	}, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

	if (favorites.length === 0) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>No tienes plantas favoritas todavía 🌱</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Mis Plantas Favoritas ❤️</Text>
			<FlatList
        data={favorites}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : index.toString()
        }
        renderItem={({ item }) =>
          item ? (
            <TouchableOpacity
              style={styles.item}
              onPress={() =>
                navigation.navigate("PlantDetail", { plant: item })
              }
            >
              {item.image_url && (
                <Image source={{ uri: item.image_url }} style={styles.thumb} />
              )}
              <Text>
                {item.common_name || item.scientific_name || "Sin nombre"}
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20, marginTop: 20 },
	title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
	item: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
		backgroundColor: "#fff",
		marginBottom: 12,
		borderRadius: 10,
		elevation: 2,
	},
	thumb: { width: 50, height: 50, marginRight: 10, borderRadius: 5 },
});
