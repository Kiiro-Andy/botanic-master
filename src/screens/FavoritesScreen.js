import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	FlatList,
	Image,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
	Alert,
} from "react-native";
import { auth } from "../../services/firebase";
import { getFavorites, removeFavorite } from "../../services/favoritesService";
import { onAuthStateChanged } from "firebase/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFavorites } from "../../services/FavoriteContext";

export default function FavoritesScreen({ navigation }) {
	const [favorites, setFavorites] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		const fetchFavorites = async (uid) => {
			try {
				const favs = await getFavorites(uid); // Trae datos guardados en Firestore
				if (mounted) {
					setFavorites(favs || []);
					setLoading(false);
				}
			} catch (e) {
				console.error("Error cargando favoritos:", e);
				if (mounted) {
					setFavorites([]);
					setLoading(false);
				}
			}
		};

		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				fetchFavorites(user.uid);
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

	const { toggleFavorite } = useFavorites();

	const handleRemove = (plant) => {
		Alert.alert(
			"Quitar favorito",
			"¿Seguro que quieres eliminar esta planta de tus favoritos?",
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Eliminar",
					style: "destructive",
					onPress: async () => {
						try {
							await toggleFavorite(plant);
							setFavorites((prev) => prev.filter((p) => p.id !== plant.id));
						} catch (e) {
							console.error("Error al eliminar favorito:", e);
						}
					},
				},
			]
		);
	};

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#4CAF50" />
			</View>
		);
	}

	if (favorites.length === 0) {
		return (
			<View style={styles.centered}>
				<Text style={styles.noFavText}>
					No tienes plantas favoritas todavía 🌱
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Mis Plantas Favoritas ❤️</Text>
			<FlatList
				data={favorites}
				keyExtractor={(item) =>
					item?.id?.toString() || Math.random().toString()
				}
				contentContainerStyle={{ paddingBottom: 30 }}
				renderItem={({ item }) =>
					item ? (
						<TouchableOpacity
							style={styles.card}
							onPress={() =>
								navigation.navigate("PlantDetail", { plant: item })
							}
						>
							{item.image_url && (
								<Image source={{ uri: item.image_url }} style={styles.thumb} />
							)}
							<View style={{ flex: 1 }}>
								<Text style={styles.plantName}>
									{item.common_name || item.scientific_name || "Sin nombre"}
								</Text>
							</View>
							<TouchableOpacity onPress={() => handleRemove(item)}>
								<MaterialCommunityIcons
									name="heart-off"
									size={24}
									color="#d9534f"
								/>
							</TouchableOpacity>
						</TouchableOpacity>
					) : null
				}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20, backgroundColor: "#f9fafb" },
	centered: { flex: 1, justifyContent: "center", alignItems: "center" },
	noFavText: { fontSize: 18, color: "#555" },
	title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
	card: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		padding: 12,
		marginBottom: 12,
		borderRadius: 10,
		elevation: 2,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	thumb: { width: 60, height: 60, marginRight: 10, borderRadius: 10 },
	plantName: { fontSize: 16, fontWeight: "500" },
});
