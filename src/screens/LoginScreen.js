import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Button,
	StyleSheet,
	Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../services/firebase";
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
} from "firebase/auth";

export default function LoginScreen({ navigation }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const getErrorMessage = (errorCode) => {
		switch (errorCode) {
			case "auth/invalid-credential":
				return "Correo o contraseña incorrectos.";
			case "auth/user-not-found":
				return "Usuario no encontrado.";
			case "auth/email-already-in-use":
				return "Este correo ya está registrado.";
			case "auth/invalid-email":
				return "Formato de correo inválido.";
			case "auth/weak-password":
				return "La contraseña debe tener al menos 6 caracteres.";
			case "auth/missing-password":
				return "Debes ingresar una contraseña.";
			default:
				return "Ocurrió un error. Intenta de nuevo.";
		}
	};

	const login = async () => {
		try {
			await signInWithEmailAndPassword(auth, email, password);
			navigation.replace("Home");
		} catch (error) {
			console.log("Error login:", error);
			Alert.alert("Error al ingresar", getErrorMessage(error.code));
		}
	};

	const register = async () => {
		try {
			await createUserWithEmailAndPassword(auth, email, password);
			navigation.replace("Home");
		} catch (error) {
			console.log("Error registro:", error);
			Alert.alert("Error al registrarse", getErrorMessage(error.code));
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>🌿 Bienvenido</Text>
			<Text style={styles.subtitle}>Inicia sesión para continuar</Text>

			<TextInput
				placeholder="Correo electrónico"
				value={email}
				onChangeText={setEmail}
				style={styles.input}
				keyboardType="email-address"
			/>
			<View style={styles.passwordContainer}>
				<TextInput
					placeholder="Contraseña"
					value={password}
					onChangeText={setPassword}
					secureTextEntry={!showPassword}
					style={styles.passwordInput}
				/>
				<TouchableOpacity
					onPress={() => setShowPassword(!showPassword)}
					style={styles.eyeButton}
				>
					<Ionicons
						name={showPassword ? "eye-off" : "eye"}
						size={22}
						color="#6b7280"
					/>
				</TouchableOpacity>
			</View>

			<TouchableOpacity style={styles.buttonPrimary} onPress={login}>
				<Text style={styles.buttonText}>Ingresar</Text>
			</TouchableOpacity>

			<TouchableOpacity style={styles.buttonSecondary} onPress={register}>
				<Text style={styles.buttonText}>Registrarse</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
		backgroundColor: "#f9fafb",
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 5,
		textAlign: "center",
		color: "#2d6a4f",
	},
	subtitle: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 20,
		color: "#6b7280",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 12,
		marginBottom: 15,
		borderRadius: 10,
		backgroundColor: "#fff",
	},
	passwordContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 10,
		backgroundColor: "#fff",
		marginBottom: 15,
		paddingRight: 10,
	},
	passwordInput: { flex: 1, padding: 12 },
	eyeButton: { padding: 5 },
	buttonPrimary: {
		backgroundColor: "#2d6a4f",
		padding: 15,
		borderRadius: 10,
		marginBottom: 10,
		alignItems: "center",
		elevation: 4,
	},
	buttonSecondary: {
		backgroundColor: "#40916c",
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
		elevation: 4,
	},
	buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
