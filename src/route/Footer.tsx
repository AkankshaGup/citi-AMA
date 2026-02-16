import { Box, Typography, Link } from "@mui/material";
import altilogo from "../assets/altilogo.png";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: "linear-gradient(90deg, #0B4DBA 0%, #0A3FA3 100%)",
        color: "#fff",
        px: 4,
        py: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Box
          component="img"
          src={altilogo}
          alt="Altimetrik"
          sx={{ height: 28 }}
        />
        <Typography variant="body2">
          © 2026 Altimetrik Corp.
        </Typography>
      </Box>

      {/* Right Section */}
      <Box display="flex" gap={3}>
        <Link href="#" underline="none" color="inherit">
          Privacy Policy
        </Link>
        <Link href="#" underline="none" color="inherit">
          Cookies
        </Link>
        <Link href="#" underline="none" color="inherit">
          Transparency in Coverage Rule
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;
