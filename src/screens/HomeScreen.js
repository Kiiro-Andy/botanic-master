import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	Image,
	TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import { getWeather } from "../../services/weather";
import { getPlantsByHumidity } from "../../services/trefle";

import { auth } from "../../services/firebase";
import { signOut } from "firebase/auth";
import { Button } from "react-native";
import { notifyWeatherPlant } from "../../services/notificationsService";
import { handleNotificationResponse } from "../../services/notificationsService";

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
					return;
				}

				const coords = await Location.getCurrentPositionAsync({});
				const clima = await getWeather(
					coords.coords.latitude,
					coords.coords.longitude
				);
				setWeather(clima);

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
			{/* Mostrar usuario logueado */}
			{auth.currentUser && (
				<Text style={styles.userText}>Usuario: {auth.currentUser.email}</Text>
			)}

			{/* Botones de acción */}
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					marginBottom: 10,
				}}
			>
				<Button
					title="Mis Favoritos"
					onPress={() => navigation.navigate("Favorites")}
				/>
				<Button title="Cerrar Sesión" onPress={handleLogout} color="#d9534f" />
			</View>
			{errorMsg ? (
				<Text>{errorMsg}</Text>
			) : weather ? (
				<Text>
					Temperatura: {weather.main.temp}°C, Humedad: {weather.main.humidity}%
				</Text>
			) : (
				<Text>Cargando clima...</Text>
			)}

			{plants.length === 0 ? (
				<Text style={{ marginTop: 10 }}>Cargando plantas...</Text>
			) : (
				<FlatList
					data={plants}
					keyExtractor={(item, index) =>
						item.id ? item.id.toString() : index.toString()
					}
					renderItem={({ item }) => (
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
					)}
				/>
			)}
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
		elevation: 3,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 5,
		borderRadius: 10,
		backgroundColor: "#fff",
		marginBottom: 12,
	},
	thumb: { width: 50, height: 50, marginRight: 10, borderRadius: 5 },
});
