import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	Image,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { getPlantDetails } from "../../services/trefle";
import { useFavorites } from "../../services/FavoriteContext";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export default function PlantDetailScreen({ route }) {
	const { plant } = route.params || {};
	const [details, setDetails] = useState(null);
	const [location, setLocation] = useState(null);
	const { toggleFavorite, isFavorite } = useFavorites();

	useEffect(() => {
		// Si no hay plant o no tiene id, no intentamos obtener detalles
		if (!plant || !plant.id) {
			console.warn("PlantDetailScreen: plant inválida:", plant);
			return;
		}

		let mounted = true;

		const fetchDetails = async () => {
			try {
				const data = await getPlantDetails(plant.id);
				if (mounted) setDetails(data || {});
			} catch (e) {
				console.error("Error al obtener detalles de planta:", e);
				if (mounted) setDetails({});
			}
		};

		const fetchLocation = async () => {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") return;
			const coords = await Location.getCurrentPositionAsync({});
			setLocation(coords.coords);
		};

		fetchDetails();
		fetchLocation();

		return () => {
			mounted = false;
		};
	}, [plant]);

	if (!plant) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text style={{ fontSize: 18, color: "red" }}>
					⚠️ No se encontró información de la planta
				</Text>
			</View>
		);
	}

	if (!details || Object.keys(details).length === 0) {
		return (
			<View style={styles.container}>
				<Text>Cargando detalles de la planta...</Text>
			</View>
		);
	}

	const main_species = details.main_species || {};

	const interpretLevel = (value) => {
		if (value == null) return null;
		if (value <= 3) return "Bajo";
		if (value <= 7) return "Medio";
		return "Alto";
	};

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={{ paddingBottom: 30 }}
		>
			<View style={styles.header}>
				<Text style={styles.title}>
					{details.common_name || details.scientific_name || "Sin nombre"}
				</Text>
				<TouchableOpacity onPress={() => toggleFavorite(plant)}>
					<MaterialCommunityIcons
						name={isFavorite(plant.id) ? "heart" : "heart-outline"}
						size={28}
						color={isFavorite(plant.id) ? "#d9534f" : "#2d6a4f"}
					/>
				</TouchableOpacity>
			</View>

			{details.image_url && (
				<Image source={{ uri: details.image_url }} style={styles.image} />
			)}

			<View style={styles.card}>
				<Text style={styles.subtitle}>Detalles generales</Text>
				<Text>
					<Feather name="tag" size={16} /> Nombre científico:{" "}
					{details.scientific_name || "N/A"}
				</Text>
				<Text>
					<Feather name="grid" size={16} /> Familia:{" "}
					{details.family_common_name || details.family?.name || "Desconocida"}
				</Text>
				<Text>
					<Feather name="git-branch" size={16} /> Género:{" "}
					{details.genus?.name || "Desconocido"}
				</Text>
				<Text>
					<Feather name="clock" size={16} /> Ciclo de vida:{" "}
					{details.duration || "N/A"}
				</Text>
				<Text>
					<Feather name="arrow-up" size={16} /> Altura promedio:{" "}
					{main_species.specifications?.average_height?.cm || "N/A"} cm
				</Text>
			</View>

			<View style={styles.card}>
				<Text style={styles.subtitle}>Cuidados recomendados</Text>
				<Text>
					<MaterialCommunityIcons name="water" size={16} /> Riego:{" "}
					{main_species.growth?.atmospheric_humidity != null
						? `${main_species.growth.atmospheric_humidity}/10 (${interpretLevel(
								main_species.growth.atmospheric_humidity
						  )})`
						: "Mantener suelo húmedo"}
				</Text>
				<Text>
					<Feather name="sun" size={16} /> Luz:{" "}
					{main_species.growth?.light != null
						? `${main_species.growth.light}/10 (${interpretLevel(
								main_species.growth.light
						  )})`
						: "Soleado o semisombra"}
				</Text>
				<Text>
					<Feather name="thermometer" size={16} /> Temperatura:{" "}
					{main_species.growth?.minimum_temperature?.deg_c &&
					main_species.growth?.maximum_temperature?.deg_c
						? `Entre ${main_species.growth.minimum_temperature.deg_c}°C y ${main_species.growth.maximum_temperature.deg_c}°C`
						: "Ideal entre 15°C y 25°C"}
				</Text>
				<Text>
					<MaterialCommunityIcons name="grass" size={16} /> Suelo:{" "}
					{main_species.growth?.soil_nutriments != null
						? `${main_species.growth.soil_nutriments}/10 (${interpretLevel(
								main_species.growth.soil_nutriments
						  )})`
						: "Bien drenado y fértil"}
				</Text>
			</View>

			<View style={styles.card}>
				<Text style={styles.subtitle}>Distribución y floración</Text>
				<Text>
					<MaterialCommunityIcons name="pin" size={16} /> Nativa de:{" "}
					{details.distribution?.native?.join(", ") || "N/A"}
				</Text>
				<Text>
					<MaterialCommunityIcons name="flower" size={16} /> Época de floración:{" "}
					{details.flowering_months || "N/A"}
				</Text>
				<Text>
					<MaterialCommunityIcons name="palette" size={16} /> Color de flor:{" "}
					{details.flower_color || "N/A"}
				</Text>
			</View>

			{location && (
				<View style={styles.card}>
					<Text style={styles.subtitle}>Tu ubicación</Text>
					<MapView
						style={styles.map}
						initialRegion={{
							latitude: location.latitude,
							longitude: location.longitude,
							latitudeDelta: 0.05,
							longitudeDelta: 0.05,
						}}
					>
						<Marker
							coordinate={{
								latitude: location.latitude,
								longitude: location.longitude,
							}}
						/>
					</MapView>
				</View>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20, backgroundColor: "#f9fafb" },
	centered: { flex: 1, justifyContent: "center", alignItems: "center" },
	errorText: { color: "#d9534f", fontSize: 18 },
	title: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 10,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 15,
	},
	image: { width: "100%", height: 250, borderRadius: 10, marginBottom: 20 },
	subtitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
	card: {
		backgroundColor: "#fff",
		padding: 15,
		borderRadius: 10,
		marginBottom: 15,
		elevation: 3,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	map: { flex: 1, height: 250, borderRadius: 10 },
});
