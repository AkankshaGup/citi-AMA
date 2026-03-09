import React from "react";
import {
  Grid,
  TextField,
  Paper,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { addMonths, subMonths, format } from "date-fns";
import UserDashboardHeader from "./timesheet/UserDashboardHeader";
import { auth } from "../auth/auth";
import {
  useGetMonthlyReview,
  usePostMonthlyReview,
} from "../hooks/useMonthlyReview";

const FIELDS = [
  {
    key: "whatWentWell",
    label: "What Went Well?",
    placeholder: "Describe what worked well during this period.",
  },
  {
    key: "improvementsNeeded",
    label: "What Could Have Gone Better?",
    placeholder: "Mention areas for improvement.",
  },
  {
    key: "blockersChallenges",
    label: "Blockers / Challenges",
    placeholder: "List any blockers or challenges faced.",
  },
  {
    key: "thingsToTry",
    label: "Things to Try",
    placeholder: "Ideas or experiments to try next.",
  },
];

const KeyAchievements: React.FC = () => {
 
   const {userId} = auth.getUser();// ideally get from logged-in user

  const [month, setMonth] = React.useState<Date>(new Date());

  const formattedMonth = format(month, "yyyy-MM-dd");

  // 🔹 GET API
  const { data } = useGetMonthlyReview(
    userId,
    formattedMonth
  );

  // 🔹 POST API
  const { mutate, isPending } = usePostMonthlyReview();

  const [formData, setFormData] = React.useState({
    whatWentWell: "",
    improvementsNeeded: "",
    blockersChallenges: "",
    thingsToTry: "",
    clientAppreciation: "",
  });

  // ✅ Populate form when GET returns data
  React.useEffect(() => {
    if (data) {
      setFormData({
        whatWentWell: data.whatWentWell || "",
        improvementsNeeded: data.improvementsNeeded || "",
        blockersChallenges: data.blockersChallenges || "",
        thingsToTry: data.thingsToTry || "",
        clientAppreciation: data.clientAppreciation || "",
      });
    }
  }, [data]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePrev = () => setMonth((m) => subMonths(m, 1));
  const handleNext = () => setMonth((m) => addMonths(m, 1));

  const handleSave = () => {
    mutate({
      employeeId:userId,
      month: formattedMonth,
      ...formData,
      keyAchievements: formData.clientAppreciation,
    });
  };

  const renderField = (
    key: string,
    label: string,
    placeholder: string,
    fullWidth = false
  ) => (
    <Grid size={{ xs: 12, md: fullWidth ? 12 : 6 }} key={key}>
      <Typography variant="body2" fontWeight={500} mb={0.5}>
        {label}
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={2}
        placeholder={placeholder}
        value={(formData as any)[key]}
        onChange={(e) => handleChange(key, e.target.value)}
      />
    </Grid>
  );

  return (
    <Paper
      elevation={3}
      sx={{ maxWidth: 1200, mx: "auto", mt: 2, p: 2 }}
    >
      <Box>
        <UserDashboardHeader
          handlePrev={handlePrev}
          handleNext={handleNext}
          month={month}
          title="Monthly Deliverables & Achievements"
        />

        <Grid container spacing={2}>
          {FIELDS.map(({ key, label, placeholder }) =>
            renderField(key, label, placeholder)
          )}

          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" fontWeight={500} mb={0.5}>
              Client Appreciation / Key Achievement
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={2}
              placeholder={`• Who gave the appreciation?\n• What was the appreciation?\n• Key achievement or impact`}
              helperText="Include who appreciated, what was appreciated, and the key achievement"
              value={formData.clientAppreciation}
              onChange={(e) =>
                handleChange("clientAppreciation", e.target.value)
              }
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 2, textAlign: "right" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </Box>
    </Paper>
  );
};

export default KeyAchievements;