import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { api } from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { auth } from "../auth/auth";
import {loginRes} from "../metadata/metadata.ts";

const Login: React.FC = () => {
	const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !password) {
			setError("Please enter email and password");
			return;
		}
		setError("");
		try {
			const res = await api.post("/auth/login", { email, password });
			auth.setUser(res.data);
			navigate("/");
		} catch (err: any) {
			setError(err?.response?.data?.message || "Login failed");
			// auth.setUser(loginRes); // Need to Remove
			// navigate("/");
		}
	};

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        fontFamily: `"Segoe UI", SegoeUI, Arial, sans-serif`,
        backgroundColor: "#f2f2f2",
      }}
    >
      {!isMobile && (
        <Box
          sx={{
            flex: 1.35,
            backgroundColor: "#ffffff",
            overflow: "hidden",
          }}
        >
          <img
            src="https://sso.altimetrik.com/adfs/portal/illustration/illustration.jpg"
            alt="illustration"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
      )}

      <Box
        sx={{
          flex: 0.65,
          backgroundColor: "#efefef",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: isMobile ? "24px" : "72px",
          paddingRight: isMobile ? "24px" : "72px",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          {/* TITLE */}
          <Typography
            sx={{
              fontSize: "28px",
              fontWeight: 300,
              color: "#222",
              mb: "50px",
			  fontFamily:'Segoe UI Light'
            }}
          >
            Altimetrik Corp
          </Typography>

          {/* SUBTITLE */}
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 300,
              color: "#222",
              mb: "16px",
			  fontFamily:'Segoe UI Light'
            }}
          >
            Sign in
          </Typography>

          {/* FORM */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              placeholder="Login ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              autoComplete="username"
              sx={{
                mb: "12px",
                "& .MuiOutlinedInput-root": {
                  height: "42px",
                  backgroundColor: "#ffffff",
                  fontSize: "13px",

                  "& fieldset": {
                    borderColor: "#c8c8c8",
                  },

                  "&:hover fieldset": {
                    borderColor: "#000",
                  },

                  "&.Mui-focused fieldset": {
                    borderColor: "#000",
                    borderWidth: "1px",
                  },
                },
              }}
            />

            <TextField
              fullWidth
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              autoComplete="current-password"
              sx={{
                mb: "14px",
                "& .MuiOutlinedInput-root": {
                  height: "42px",
                  backgroundColor: "#dfe6ef",
                  fontSize: "13px",

                  "& fieldset": {
                    borderColor: "#c8c8c8",
                  },

                  "&:hover fieldset": {
                    borderColor: "#000",
                  },

                  "&.Mui-focused fieldset": {
                    borderColor: "#000",
                    borderWidth: "1px",
                  },
                },
              }}
            />

            {error && (
              <Typography sx={{ color: "red", fontSize: "14px", mb: 2 }}>
                {error}
              </Typography>
            )}
            
            <Button
              fullWidth
              type="submit"
              disableElevation
              variant="contained"
              sx={{
                marginTop: "16px",
                height: "52px",
                fontSize: "16px",
                fontWeight: 400,
                textTransform: "none",
				fontFamily:'Segoe UI',
                backgroundColor: "#f37021",
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: "#e26012",
                },
              }}
            >
              Sign in
            </Button>
          </Box>
          
          <Typography
            sx={{
              mt: "80px",
              fontSize: "12px",
              color: "#696969",
			  fontFamily:'Segoe UI'
            }}
          >
            © 2018 Microsoft
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
