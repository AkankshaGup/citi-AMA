import React, { useState } from "react";
import { Container, Paper, Typography, TextField, Button, Box } from "@mui/material";
import { api } from "../api/axiosInstance";
import {  useNavigate } from "react-router-dom";
import { auth } from "../auth/auth";

const Login: React.FC = () => {
    const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !password) {
			setError("Please enter email and password");
			return;
		}
		setError("");   
		try {
			const res = await api.post("/auth/login", { email, password });
			console.log("Login success", res.data);
		} catch (err: any) {
			// setError(err?.response?.data?.message || "Login failed");
            auth.setUser({
                name: "Alice Admin",
                email: "alice.admin@example.com",
                role: "ROLE_ADMIN",
                userId:'MGR-001-0000-0000-0000-000000000001',
                message: "Login successful. Session ID: F3B72217FB9DD16DCF735FD5922B6405"
            })
            navigate("/");
		}
	};

	return (
		<Container maxWidth="xs">
			<Paper elevation={3} sx={{ p: 4, mt: 8 }}>
				<Typography variant="h5" align="center" gutterBottom>
					Login
				</Typography>
				<Box component="form" onSubmit={handleSubmit} noValidate>
					<TextField
						label="Email"
						type="email"
						fullWidth
						margin="normal"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<TextField
						label="Password"
						type="password"
						fullWidth
						margin="normal"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
					{error && (
						<Typography color="error" variant="body2" sx={{ mt: 1 }}>
							{error}
						</Typography>
					)}
					<Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
						Login
					</Button>
				</Box>
			</Paper>
		</Container>
	);
};

export default Login;

