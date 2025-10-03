import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	Image,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { getWeather } from "../../services/weather";
import { getPlantsByHumidity } from "../../services/trefle";
import { auth } from "../../services/firebase";
import { signOut } from "firebase/auth";
import { notifyWeatherPlant } from "../../services/notificationsService";
import { handleNotificationResponse } from "../../services/notificationsService";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
	const [weather, setWeather] = useState(null);
	const [plants, setPlants] = useState([]);
	const [errorMsg, setErrorMsg] = useState("");
	const [loadingWeather, setLoadingWeather] = useState(true);
	const [loadingPlants, setLoadingPlants] = useState(true);
	useEffect(() => {
		const subscription = handleNotificationResponse(navigation);
		return () => subscription.remove();
	}, []);
	useEffect(() => {
		const fetchData = async () => {
			setLoadingWeather(true);
			setLoadingPlants(true);
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== "granted") {
					setErrorMsg("Permiso de ubicación denegado");
					setLoadingWeather(false);
					setLoadingPlants(false);
					return;
				}
				const coords = await Location.getCurrentPositionAsync({});
				const clima = await getWeather(
					coords.coords.latitude,
					coords.coords.longitude
				);
				setWeather(clima);
				setLoadingWeather(false);

				if (clima?.main?.humidity) {
					const hum = clima.main.humidity;
					const data = await getPlantsByHumidity(hum - 20, hum + 20);
					setPlants(data || []);
					if (data && data.length > 0) {
						const recommended = data[0];
						notifyWeatherPlant(recommended);
					}
				}
				setLoadingPlants(false);
			} catch (error) {
				console.error(error);
				setErrorMsg("Error al obtener los datos");
				setLoadingWeather(false);
				setLoadingPlants(false);
			}
		};
		fetchData();
	}, []);
	const handleLogout = async () => {
		try {
			await signOut(auth);
			navigation.replace("Login");
		} catch (error) {
			console.error("Error al cerrar sesión:", error);
		}
	};
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Clima y Plantas</Text>

			{/* Usuario */}
			{auth.currentUser && (
				<View style={styles.userCard}>
					<Feather
						name="user"
						size={20}
						color="#1b4332"
						style={{ marginRight: 8 }}
					/>
					<Text style={styles.userText}>Hola, {auth.currentUser.email}</Text>
				</View>
			)}

			{/* Botones de acción */}
			<View style={styles.actionButtons}>
				<TouchableOpacity
					style={styles.buttonPrimary}
					onPress={() => navigation.navigate("Favorites")}
				>
					<Feather
						name="heart"
						size={20}
						color="#fff"
						style={{ marginRight: 8 }}
					/>
					<Text style={styles.buttonText}>Mis Favoritos</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.buttonSecondary} onPress={handleLogout}>
					<Feather
						name="log-out"
						size={20}
						color="#fff"
						style={{ marginRight: 8 }}
					/>
					<Text style={styles.buttonText}>Cerrar Sesión</Text>
				</TouchableOpacity>
			</View>

			{/* Clima */}
			{loadingWeather ? (
				<ActivityIndicator
					size="large"
					color="#2d6a4f"
					style={{ marginVertical: 20 }}
				/>
			) : errorMsg ? (
				<Text style={styles.errorText}>{errorMsg}</Text>
			) : weather ? (
				<View style={styles.weatherCard}>
					<View style={styles.weatherRow}>
						<MaterialCommunityIcons
							name="thermometer"
							size={20}
							color="#03045e"
						/>
						<Text style={styles.weatherText}>{weather.main.temp}°C</Text>
					</View>
					<View style={styles.weatherRow}>
						<MaterialCommunityIcons
							name="water-percent"
							size={20}
							color="#03045e"
						/>
						<Text style={styles.weatherText}>
							{weather.main.humidity}% Humedad
						</Text>
					</View>
					<View style={styles.weatherRow}>
						<Feather name="map-pin" size={20} color="#03045e" />
						<Text style={styles.weatherText}>{weather.name}</Text>
					</View>
				</View>
			) : null}

			{/* Plantas */}
			{loadingPlants ? (
				<ActivityIndicator
					size="large"
					color="#2d6a4f"
					style={{ marginVertical: 20 }}
				/>
			) : plants.length === 0 ? (
				<Text style={{ marginTop: 10 }}>
					No hay plantas recomendadas aún...
				</Text>
			) : (
				<FlatList
					data={plants}
					keyExtractor={(item, index) =>
						item.id ? item.id.toString() : index.toString()
					}
					contentContainerStyle={{ paddingBottom: 20 }}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={styles.plantCard}
							onPress={() =>
								navigation.navigate("PlantDetail", { plant: item })
							}
						>
							{item.image_url && (
								<Image
									source={{ uri: item.image_url }}
									style={styles.plantImage}
								/>
							)}
							<View style={{ flex: 1, paddingLeft: 10 }}>
								<Text style={styles.plantName}>
									{item.common_name || item.scientific_name || "Sin nombre"}
								</Text>
								<Text style={styles.plantScientific}>
									{item.scientific_name || ""}
								</Text>
							</View>
						</TouchableOpacity>
					)}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f9fafb",
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		textAlign: "center",
		color: "#2d6a4f",
		marginBottom: 15,
	},
	userCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#d8f3dc",
		padding: 12,
		borderRadius: 10,
		marginBottom: 15,
		elevation: 3,
	},
	userText: {
		fontSize: 16,
		color: "#1b4332",
		fontWeight: "600",
	},
	actionButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 15,
	},
	buttonPrimary: {
		flex: 1,
		backgroundColor: "#2d6a4f",
		padding: 12,
		marginRight: 10,
		borderRadius: 10,
		alignItems: "center",
		elevation: 4,
		flexDirection: "row",
		justifyContent: "center",
	},
	buttonSecondary: {
		flex: 1,
		backgroundColor: "#d9534f",
		padding: 12,
		borderRadius: 10,
		alignItems: "center",
		elevation: 4,
		flexDirection: "row",
		justifyContent: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	weatherCard: {
		backgroundColor: "#caf0f8",
		padding: 15,
		borderRadius: 10,
		marginBottom: 15,
		elevation: 3,
	},
	weatherRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 5,
	},
	weatherText: {
		fontSize: 16,
		fontWeight: "500",
		color: "#03045e",
		marginLeft: 8,
	},
	plantCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		borderRadius: 10,
		backgroundColor: "#fff",
		marginBottom: 12,
		elevation: 4,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	plantImage: {
		width: 60,
		height: 60,
		borderRadius: 10,
	},
	plantName: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#2d6a4f",
	},
	plantScientific: {
		fontSize: 14,
		color: "#6b7280",
		fontStyle: "italic",
	},
	errorText: {
		color: "#d9534f",
		textAlign: "center",
		marginBottom: 10,
	},
});
