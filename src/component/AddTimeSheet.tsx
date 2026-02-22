import * as React from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Divider,
    Stack,
    FormControlLabel,
    IconButton,
    FormControl,
    FormLabel,
    RadioGroup,
    Radio,
    Alert,
    Snackbar,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { addMonths, subMonths, format } from "date-fns";
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
}: {
    label: string;
    value: boolean | null;
    onChange: (v: boolean) => void;
    error?: boolean;
    helperText?: string;
}) {
    return (
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
                <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            </RadioGroup>

            {error && helperText ? (
                <Typography variant="caption" color="error" sx={{ mt: 0.25 }}>
                    {helperText}
                </Typography>
            ) : null}
        </FormControl>
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
    pts: boolean;
    cofy: boolean;
    citiTraining: boolean;
    complianceSubmit: boolean;
    timeSheet: { weekStartDate: string; weekEndDate: string; totalHours: number }[];
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

// POST API (same endpoint as earlier)
async function postCitiCompliance(body: SubmitBody) {
    const res = await api.post("/public/timesheets/save", body);
    return res.data;
}

export default function AddTimeSheet() {
    const user = auth.getUser();
    const employeeId = user.userId; // submit payload
    const [month, setMonth] = React.useState<Date>(new Date());
    const [complianceValues, setComplianceValues] = React.useState<ComplianceAnswers>(defaultValues);

    const monthKey = format(month, "yyyy-MM");
    const weeks = React.useMemo(() => getWeeksLabelForMonth(month) as WeekRow[], [month]);

    const [values, setValues] = React.useState<Record<string, string>>({});

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

    const handlePrev = () => setMonth((m) => subMonths(m, 1));
    const handleNext = () => setMonth((m) => addMonths(m, 1));

    const onChangeWeek = (weekKey: string, v: string) => {
        setValues((prev) => ({ ...prev, [weekKey]: v }));
        setWeekErrors((prev) => {
            const next = { ...prev };
            delete next[weekKey];
            return next;
        });
    };

    const validate = () => {
        const nextWeekErrors: Record<string, string> = {};
        const nextComplianceErrors: typeof complianceErrors = {};

        for (const w of weeks) {
            const raw = values[w.key] ?? "";
            if (!raw.trim()) {
                nextWeekErrors[w.key] = "Please enter total hours for this week (e.g., 40).";
                continue;
            }
            const n = toHours(raw);
            if (!Number.isFinite(n)) {
                nextWeekErrors[w.key] = "Hours must be a valid number (e.g., 40 or 40.5).";
                continue;
            }
            if (n < 0) {
                nextWeekErrors[w.key] = "Hours cannot be negative.";
                continue;
            }
        }

        if (complianceValues.ptsSavedTillMonth === null) nextComplianceErrors.ptsSavedTillMonth = "Please select Yes or No.";
        if (complianceValues.cofyUpdated === null) nextComplianceErrors.cofyUpdated = "Please select Yes or No.";
        if (complianceValues.citiTrainingCompleted === null)
            nextComplianceErrors.citiTrainingCompleted = "Please select Yes or No.";

        setWeekErrors(nextWeekErrors);
        setComplianceErrors(nextComplianceErrors);

        return Object.keys(nextWeekErrors).length === 0 && Object.keys(nextComplianceErrors).length === 0;
    };

    // body builder now supports complianceSubmit (Save=false, Submit=true)
    const buildSubmitBody = (complianceSubmit: boolean): SubmitBody => {
        return {
            employeeId: employeeId,
            month: monthKey,
            pts: Boolean(complianceValues.ptsSavedTillMonth),
            cofy: Boolean(complianceValues.cofyUpdated),
            citiTraining: Boolean(complianceValues.citiTrainingCompleted),
            complianceSubmit,
            timeSheet: weeks.map((w) => ({
                weekStartDate: format(w.weekStart, "yyyy-MM-dd"),
                weekEndDate: format(w.weekEnd, "yyyy-MM-dd"),
                totalHours: Number(toHours(values[w.key] ?? "").toFixed(2)),
            })),
        };
    };

    const handleSave = async () => {
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!validate()) {
            setErrorMsg("Please complete the highlighted fields before saving.");
            return;
        }

        try {
            setSaving(true);
            await postCitiCompliance(buildSubmitBody(false)); // Save => complianceSubmit=false
            setSuccessMsg("Saved successfully.");
        } catch (e) {
            setErrorMsg(getAxiosErrMsg(e, "Failed to save."));
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async () => {
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!validate()) {
            setErrorMsg("Please complete the highlighted fields before submitting.");
            return;
        }

        try {
            setSubmitting(true);
            await postCitiCompliance(buildSubmitBody(true)); // Submit => complianceSubmit=true
            setSuccessMsg("Submitted successfully.");
        } catch (e) {
            setErrorMsg(getAxiosErrMsg(e, "Failed to submit."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ maxWidth: 900, mx: "auto", mt: 4, p: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                    Citi Compliance
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1, gap: 2 }}>
                    <IconButton onClick={handlePrev} disabled={saving || submitting}>
                        <ChevronLeftIcon />
                    </IconButton>

                    <Typography fontWeight={700} sx={{ textAlign: "center", fontSize: "18px", minWidth: 160 }}>
                        {format(month, "MMMM yyyy")}
                    </Typography>

                    <IconButton onClick={handleNext} disabled={saving || submitting}>
                        <ChevronRightIcon />
                    </IconButton>
                </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box px={{ xs: 2, sm: 8 }}>
                {/* Week inputs */}
                <Stack spacing={2}>
                    {weeks.map((w) => (
                        <Box
                            key={w.key}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "90px 1fr" },
                                gap: 2,
                                alignItems: "center",
                            }}
                        >
                            <Typography fontWeight={500} fontSize={13} color="text.secondary">
                                {w.label}
                            </Typography>

                            <TextField
                                size="small"
                                fullWidth
                                placeholder="Total hours (e.g., 40)"
                                value={values[w.key] ?? ""}
                                onChange={(e) => onChangeWeek(w.key, e.target.value)}
                                error={!!weekErrors[w.key]}
                                helperText={weekErrors[w.key] ?? " "}
                            />
                        </Box>
                    ))}
                </Stack>

                {/* Compliance row (3 columns) */}
                <Box
                    sx={{
                        mt: 4,
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
                        error={!!complianceErrors.ptsSavedTillMonth}
                        helperText={complianceErrors.ptsSavedTillMonth}
                    />

                    <YesNoQuestionCompact
                        label="CoFY updated?"
                        value={complianceValues.cofyUpdated}
                        onChange={(v) => setComplianceValues((p) => ({ ...p, cofyUpdated: v }))}
                        error={!!complianceErrors.cofyUpdated}
                        helperText={complianceErrors.cofyUpdated}
                    />

                    <YesNoQuestionCompact
                        label="Citi training completed?"
                        value={complianceValues.citiTrainingCompleted}
                        onChange={(v) => setComplianceValues((p) => ({ ...p, citiTrainingCompleted: v }))}
                        error={!!complianceErrors.citiTrainingCompleted}
                        helperText={complianceErrors.citiTrainingCompleted}
                    />
                </Box>

                {/* Actions */}
                <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                    <Button variant="outlined" onClick={handleSave} disabled={saving || submitting}>
                        {saving ? "Saving..." : "Save"}
                    </Button>

                    <Button variant="contained" onClick={handleSubmit} disabled={saving || submitting}>
                        {submitting ? "Submitting..." : "Submit"}
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
