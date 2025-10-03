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
		<ScrollView style={styles.container}>
			<Text style={styles.title}>
				{details.common_name || details.scientific_name || "Sin nombre"}
			</Text>
			<TouchableOpacity
				onPress={() => toggleFavorite(plant)}
				style={{ padding: 10 }}
			>
				<Text style={{ fontSize: 18 }}>
					{isFavorite(plant.id)
						? "💔 Quitar de favoritos"
						: "❤️ Agregar a favoritos"}
				</Text>
			</TouchableOpacity>

			{details.image_url && (
				<Image source={{ uri: details.image_url }} style={styles.image} />
			)}

			<View style={styles.section}>
				<Text style={styles.subtitle}>Detalles generales</Text>
				<Text>🌿 Nombre científico: {details.scientific_name || "N/A"}</Text>
				<Text>
					🌳 Familia:{" "}
					{details.family_common_name || details.family?.name || "Desconocida"}
				</Text>
				<Text>🌱 Género: {details.genus?.name || "Desconocido"}</Text>
				<Text>⏳ Ciclo de vida: {details.duration || "N/A"}</Text>
				<Text>
					📏 Altura promedio:{" "}
					{main_species.specifications?.average_height?.cm || "N/A"} cm
				</Text>
			</View>

			<View style={styles.section}>
				<Text style={styles.subtitle}>Cuidados recomendados</Text>
				<Text>
					💧 Riego:{" "}
					{main_species.growth?.atmospheric_humidity != null
						? `Nivel de humedad necesaria: ${
								main_species.growth.atmospheric_humidity
						  }/10 (${interpretLevel(
								main_species.growth.atmospheric_humidity
						  )})`
						: "Mantener suelo húmedo"}
				</Text>
				<Text>
					☀️ Luz:{" "}
					{main_species.growth?.light != null
						? `Nivel de cantidad de sol necesaria: ${
								main_species.growth.light
						  }/10 (${interpretLevel(main_species.growth.light)})`
						: "Soleado o semisombra"}
				</Text>
				<Text>
					🌡️ Temperatura:{" "}
					{main_species.growth?.minimum_temperature?.deg_c &&
					main_species.growth?.maximum_temperature?.deg_c
						? `Entre ${main_species.growth.minimum_temperature.deg_c}°C y ${main_species.growth.maximum_temperature.deg_c}°C`
						: "Ideal entre 15°C y 25°C"}
				</Text>
				<Text>
					🌱 Suelo:{" "}
					{main_species.growth?.soil_nutriments != null
						? `Nivel de nutrientes: ${
								main_species.growth.soil_nutriments
						  }/10 (${interpretLevel(main_species.growth.soil_nutriments)})`
						: "Bien drenado y fértil"}
				</Text>
			</View>

			<View style={styles.section}>
				<Text style={styles.subtitle}>Distribución y floración</Text>
				{details.distribution?.native?.length > 0 && (
					<Text>
						🌍 Nativa de: {details.distribution.native.join(", ")} || "N/A"{" "}
					</Text>
				)}
				{details.flowering_months && (
					<Text>
						🌸 Época de floración: {details.flowering_months} || "N/A"{" "}
					</Text>
				)}
				{details.flower_color && (
					<Text>🎨 Color de flor: {details.flower_color} || "N/A" </Text>
				)}
			</View>

			{location && (
				<View style={styles.mapContainer}>
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
	container: { flex: 1, padding: 20, marginTop: 20, backgroundColor: "#fff" },
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 15,
		textAlign: "center",
	},
	image: { width: "100%", height: 250, borderRadius: 10, marginBottom: 20 },
	section: { marginBottom: 20 },
	subtitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
	mapContainer: { height: 250, marginBottom: 20 },
	map: { flex: 1, borderRadius: 10 },
});
