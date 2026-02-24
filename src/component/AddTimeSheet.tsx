import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  FormControlLabel,
  IconButton,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Alert,
  Snackbar,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  max as dfMax,
  min as dfMin,
  isBefore,
} from "date-fns";
import { getWeeksLabelForMonth } from "../utils/dateUtils";
import type { WeekRow } from "../types/timesheetTypes";
import { type ComplianceAnswers } from "./modal/ComplianceModal";
import { api } from "../api/axiosInstance";
import axios from "axios";
import { auth } from "../auth/auth";

function YesNoQuestionCompact({
  label,
  value,
  onChange,
  error,
  helperText,
  disabled,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}) {
  return (
    <Box
      sx={{
        p: 1.25,
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        bgcolor: "background.paper",
        "&:last-of-type": { borderRight: "none" },
      }}
    >
      <FormControl error={!!error} sx={{ minWidth: 0 }}>
        <FormLabel sx={{ mb: 0.5 }}>
          <Typography fontWeight={600} fontSize={13}>
            {label}
          </Typography>
        </FormLabel>

        <RadioGroup
          row
          value={value === null ? "" : value ? "yes" : "no"}
          onChange={(e) => onChange(e.target.value === "yes")}
          sx={{ gap: 1, "& .MuiFormControlLabel-root": { mr: 1 } }}
        >
          <FormControlLabel
            value="yes"
            control={<Radio size="small" />}
            label="Yes"
            disabled={disabled}
          />
          <FormControlLabel
            value="no"
            control={<Radio size="small" />}
            label="No"
            disabled={disabled}
          />
        </RadioGroup>

        {error && helperText ? (
          <Typography variant="caption" color="error" sx={{ mt: 0.25 }}>
            {helperText}
          </Typography>
        ) : null}
      </FormControl>
    </Box>
  );
}

const defaultValues: ComplianceAnswers = {
  ptsSavedTillMonth: false,
  cofyUpdated: false,
  citiTrainingCompleted: false,
};

type SubmitBody = {
  employeeId: string;
  month: string; // yyyy-MM
  pts: boolean | null;
  cofy: boolean | null;
  citiTraining: boolean | null;
  complianceSubmit: boolean;
  timeSheet: { weekStartDate: string; weekEndDate: string; totalHours: number }[];
};

type GetResponse = {
  employeeId: string;
  employeeName: string;
  timeSheet: { weekStartDate: string; weekEndDate: string; totalHours: number }[];
  pts: boolean | null;
  cofy: boolean | null;
  citiTraining: boolean | null;
  complianceSubmit: boolean | null;
};

function toHours(v: string): number {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : NaN;
}

function getAxiosErrMsg(err: unknown, fallback: string) {
  if (!axios.isAxiosError(err)) return fallback;
  const data: any = err.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return String(data.message);
  return err.message || fallback;
}

async function postCitiCompliance(body: SubmitBody) {
  const res = await api.post("/public/weekly-timesheets/save", body);
  return res.data;
}

function clampWeekToMonth(month: Date, w: WeekRow) {
  const ms = startOfMonth(month);
  const me = endOfMonth(month);
  const start = dfMax([w.weekStart, ms]);
  const end = dfMin([w.weekEnd, me]);
  return { start, end };
}

async function fetchWeeklyTimesheet(employeeId: string, monthKey: string): Promise<GetResponse> {
  const res = await api.get(`/public/weekly-timesheets`, {
    params: { userId: employeeId, month: monthKey },
  });
  return res.data as GetResponse;
}

export default function AddTimeSheet() {
  const user = auth.getUser();
  const employeeId = user.userId;

  const currentMonthStart = React.useMemo(() => startOfMonth(new Date()), []);

  const [month, setMonth] = React.useState<Date>(new Date());
  const monthKey = format(month, "yyyy-MM");

  const isPrevMonth = React.useMemo(
    () => isBefore(startOfMonth(month), currentMonthStart),
    [month, currentMonthStart]
  );

  const weeks = React.useMemo(() => getWeeksLabelForMonth(month) as WeekRow[], [month]);

  const [values, setValues] = React.useState<Record<string, string>>({});
  const [complianceValues, setComplianceValues] =
    React.useState<ComplianceAnswers>(defaultValues);

  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [weekErrors, setWeekErrors] = React.useState<Record<string, string>>({});
  const [complianceErrors, setComplianceErrors] = React.useState<{
    ptsSavedTillMonth?: string;
    cofyUpdated?: string;
    citiTrainingCompleted?: string;
  }>({});

  const [showErrors, setShowErrors] = React.useState(false);

  const handlePrev = () => setMonth((m) => subMonths(m, 1));
  const handleNext = () => setMonth((m) => addMonths(m, 1));

  const onChangeWeek = (weekKey: string, v: string) => {
    setValues((prev) => ({ ...prev, [weekKey]: v }));

    // hide error while typing
    setWeekErrors((prev) => {
      const next = { ...prev };
      delete next[weekKey];
      return next;
    });
  };

  // load & prefill on month change
  React.useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);
      setErrorMsg(null);
      setShowErrors(false);

      setValues({});
      setComplianceValues(defaultValues);

      try {
        const resp = await fetchWeeklyTimesheet(employeeId, monthKey);
        if (!alive) return;

        const nextValues: Record<string, string> = {};
        for (const w of weeks) {
          const { start, end } = clampWeekToMonth(month, w);

          const match = resp.timeSheet?.find(
            (t) =>
              t.weekStartDate === format(start, "yyyy-MM-dd") &&
              t.weekEndDate === format(end, "yyyy-MM-dd")
          );
          if (match) nextValues[w.key] = String(match.totalHours ?? "");
        }
        setValues(nextValues);

        setComplianceValues({
          ptsSavedTillMonth: resp.pts ?? false,
          cofyUpdated: resp.cofy ?? false,
          citiTrainingCompleted: resp.citiTraining ?? false,
        });
      } catch (e) {
        if (!alive) return;
        setErrorMsg(getAxiosErrMsg(e, "Failed to load compliance data."));
      } finally {
        if (alive) setLoading(false);
      }
    };

    void run();

    return () => {
      alive = false;
    };
  }, [employeeId, monthKey, weeks, month]);

  const validate = (isSave: boolean) => {
    const nextWeekErrors: Record<string, string> = {};
    const nextComplianceErrors: typeof complianceErrors = {};

    const filledWeeks = weeks.filter((w) => (values[w.key] ?? "").trim() !== "");

    // Save: at least 1 filled
    if (isSave && filledWeeks.length === 0) {
      if (weeks[0]) nextWeekErrors[weeks[0].key] = "This field is required.";
      setWeekErrors(nextWeekErrors);
      setComplianceErrors(nextComplianceErrors);
      return false;
    }

    for (const w of weeks) {
      const raw = (values[w.key] ?? "").trim();

      // Submit: all required
      if (!isSave && !raw) {
        nextWeekErrors[w.key] = "This field is required.";
        continue;
      }

      // Save: validate only filled
      if (isSave && !raw) continue;

      const n = toHours(raw);
      if (!Number.isFinite(n)) {
        nextWeekErrors[w.key] = "Enter a valid number.";
        continue;
      }
      if (n < 0) {
        nextWeekErrors[w.key] = "Hours cannot be negative.";
        continue;
      }
    }

    // Compliance only on submit
    if (!isSave) {
      if (complianceValues.ptsSavedTillMonth === null)
        nextComplianceErrors.ptsSavedTillMonth = "Select Yes/No.";
      if (complianceValues.cofyUpdated === null)
        nextComplianceErrors.cofyUpdated = "Select Yes/No.";
      if (complianceValues.citiTrainingCompleted === null)
        nextComplianceErrors.citiTrainingCompleted = "Select Yes/No.";
    }

    setWeekErrors(nextWeekErrors);
    setComplianceErrors(nextComplianceErrors);

    return (
      Object.keys(nextWeekErrors).length === 0 &&
      Object.keys(nextComplianceErrors).length === 0
    );
  };

  const buildSubmitBody = (complianceSubmit: boolean): SubmitBody => ({
    employeeId,
    month: monthKey,
    pts: complianceValues.ptsSavedTillMonth,
    cofy: complianceValues.cofyUpdated,
    citiTraining: complianceValues.citiTrainingCompleted,
    complianceSubmit,
    timeSheet: weeks.map((w) => {
      const { start, end } = clampWeekToMonth(month, w);

      return {
        weekStartDate: format(start, "yyyy-MM-dd"),
        weekEndDate: format(end, "yyyy-MM-dd"),
        totalHours: Number(toHours(values[w.key] ?? "").toFixed(2)),
      };
    }),
  });

  const handleSave = async () => {
    if (isPrevMonth) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setShowErrors(true);

    if (!validate(true)) {
      setErrorMsg("Enter hours for at least one week to save.");
      return;
    }

    try {
      setSaving(true);
      await postCitiCompliance(buildSubmitBody(false));
      setSuccessMsg("Saved successfully.");
    } catch (e) {
      setErrorMsg(getAxiosErrMsg(e, "Failed to save."));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (isPrevMonth) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setShowErrors(true);

    if (!validate(false)) {
      setErrorMsg("Please complete the required fields.");
      return;
    }

    try {
      setSubmitting(true);
      await postCitiCompliance(buildSubmitBody(true));
      setSuccessMsg("Submitted successfully.");
    } catch (e) {
      setErrorMsg(getAxiosErrMsg(e, "Failed to submit."));
    } finally {
      setSubmitting(false);
    }
  };

  const uiDisabled = isPrevMonth || loading || saving || submitting;

  return (
    <Paper elevation={3} sx={{ maxWidth: 900, mx: "auto", mt: 4, p: 3, position: "relative" }}>
      {/* loader overlay */}
      <Backdrop
        open={loading || saving || submitting}
        sx={{
          position: "absolute",
          zIndex: (t) => t.zIndex.drawer + 1,
          color: "#fff",
          borderRadius: 2,
        }}
      >
        <CircularProgress />
      </Backdrop>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Citi Compliance
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1, gap: 2 }}>
          {/* Prev disabled in prev month */}
          <IconButton onClick={handlePrev} disabled={uiDisabled}>
            <ChevronLeftIcon />
          </IconButton>

          <Typography fontWeight={700} sx={{ textAlign: "center", fontSize: "18px", minWidth: 160 }}>
            {format(month, "MMMM yyyy")}
          </Typography>

          {/* Next should stay enabled (unless loading) */}
          <IconButton onClick={handleNext} disabled={loading || saving || submitting}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box px={{ xs: 2, sm: 8 }}>
        {/* Week inputs (one row) */}
        <Box
          sx={{
            mt: 1,
            borderRadius: 2,
            overflowX: "auto",
            bgcolor: "grey.50",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridAutoFlow: "column",
              gridAutoColumns: "minmax(140px, 1fr)",
              minWidth: `${Math.max(weeks.length, 4) * 140}px`,
            }}
          >
            {weeks.map((w) => (
              <Box
                key={w.key}
                sx={{
                  p: 1.25,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.75,
                  bgcolor: "background.paper",
                }}
              >
                <Typography
                  fontWeight={700}
                  fontSize={12}
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    color: "text.secondary",
                  }}
                >
                  PTS {w.label}
                </Typography>

                <TextField
                  size="small"
                  fullWidth
                  placeholder="Hours"
                  value={values[w.key] ?? ""}
                  onChange={(e) => onChangeWeek(w.key, e.target.value)}
                  disabled={uiDisabled}
                  error={showErrors && !!weekErrors[w.key]}
                  helperText={showErrors ? (weekErrors[w.key] ?? " ") : " "}
                  FormHelperTextProps={{
                    sx: {
                      margin: 0,
                      mt: 0,
                      ml: 0,
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "grey.50",
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Compliance row */}
        <Box
          sx={{
            mt: 0,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <YesNoQuestionCompact
            label="PTS saved till month?"
            value={complianceValues.ptsSavedTillMonth}
            onChange={(v) => setComplianceValues((p) => ({ ...p, ptsSavedTillMonth: v }))}
            error={showErrors && !!complianceErrors.ptsSavedTillMonth}
            helperText={complianceErrors.ptsSavedTillMonth}
            disabled={uiDisabled}
          />

          <YesNoQuestionCompact
            label="CoFY updated?"
            value={complianceValues.cofyUpdated}
            onChange={(v) => setComplianceValues((p) => ({ ...p, cofyUpdated: v }))}
            error={showErrors && !!complianceErrors.cofyUpdated}
            helperText={complianceErrors.cofyUpdated}
            disabled={uiDisabled}
          />

          <YesNoQuestionCompact
            label="Citi training completed?"
            value={complianceValues.citiTrainingCompleted}
            onChange={(v) => setComplianceValues((p) => ({ ...p, citiTrainingCompleted: v }))}
            error={showErrors && !!complianceErrors.citiTrainingCompleted}
            helperText={complianceErrors.citiTrainingCompleted}
            disabled={uiDisabled}
          />
        </Box>

        {/* Actions */}
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button variant="outlined" onClick={handleSave} disabled={uiDisabled}>
            Save
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={uiDisabled}>
            Submit
          </Button>
        </Box>
      </Box>

      {/* Success banner */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      </Snackbar>

      {/* Error banner */}
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={5000}
        onClose={() => setErrorMsg(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}