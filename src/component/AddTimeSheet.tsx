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
    addMonths, subMonths, format, startOfMonth, endOfMonth, max as dfMax,
    min as dfMin,
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
}: {
    label: string;
    value: boolean | null;
    onChange: (v: boolean) => void;
    error?: boolean;
    helperText?: string;
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
                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
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

// NEW: GET API for prefill
async function fetchWeeklyTimesheet(employeeId: string, monthKey: string): Promise<GetResponse> {
    const res = await api.get(`/public/weekly-timesheets`, {
        params: { userId: employeeId, month: monthKey },
    });

    return res.data as GetResponse;
}

export default function AddTimeSheet() {
    const user = auth.getUser();
    const employeeId = user.userId;

    const [month, setMonth] = React.useState<Date>(new Date());
    const monthKey = format(month, "yyyy-MM");

    const weeks = React.useMemo(() => getWeeksLabelForMonth(month) as WeekRow[], [month]);

    const [values, setValues] = React.useState<Record<string, string>>({});
    const [complianceValues, setComplianceValues] = React.useState<ComplianceAnswers>(defaultValues);

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
        setWeekErrors((prev) => {
            const next = { ...prev };
            delete next[weekKey];
            return next;
        });
    };

    // NEW: load & prefill on month change
    React.useEffect(() => {
        let alive = true;

        const run = async () => {
            setLoading(true);
            setErrorMsg(null);
            setShowErrors(false);

            // clear current ui first (seamless month switch)
            setValues({});
            setComplianceValues(defaultValues);

            try {
                const resp = await fetchWeeklyTimesheet(employeeId, monthKey);
                console.log("Fetched timesheet data:", resp);
                if (!alive) return;

                // 1) prefill week values based on weekStartDate+weekEndDate match
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

                // 2) prefill compliance values (API gives null/boolean)
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
        // important: depend on monthKey + weeks (weeks changes when month changes)
    }, [employeeId, monthKey, weeks]);

    const validate = () => {
        const nextWeekErrors: Record<string, string> = {};
        const nextComplianceErrors: typeof complianceErrors = {};

        for (const w of weeks) {
            const raw = values[w.key] ?? "";
            if (!raw.trim()) {
                nextWeekErrors[w.key] = "This field is required.";
                continue;
            }
            const n = toHours(raw);
            if (!Number.isFinite(n)) {
                nextWeekErrors[w.key] = "Enter a valid number (e.g., 40 or 40.5).";
                continue;
            }
            if (n < 0) {
                nextWeekErrors[w.key] = "Hours cannot be negative.";
                continue;
            }
        }

        if (complianceValues.ptsSavedTillMonth === null) nextComplianceErrors.ptsSavedTillMonth = "Select Yes/No.";
        if (complianceValues.cofyUpdated === null) nextComplianceErrors.cofyUpdated = "Select Yes/No.";
        if (complianceValues.citiTrainingCompleted === null) nextComplianceErrors.citiTrainingCompleted = "Select Yes/No.";

        setWeekErrors(nextWeekErrors);
        setComplianceErrors(nextComplianceErrors);

        return Object.keys(nextWeekErrors).length === 0 && Object.keys(nextComplianceErrors).length === 0;
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
        setErrorMsg(null);
        setSuccessMsg(null);
        setShowErrors(true);

        if (!validate()) {
            setErrorMsg("Please complete the required fields.");
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
        setErrorMsg(null);
        setSuccessMsg(null);
        setShowErrors(true);

        if (!validate()) {
            setErrorMsg("Please complete the required fields.");
            return;
        }

        try {
            setSubmitting(true);
            console.log("Submitting body:", buildSubmitBody(true));
            await postCitiCompliance(buildSubmitBody(true));
            setSuccessMsg("Submitted successfully.");
        } catch (e) {
            setErrorMsg(getAxiosErrMsg(e, "Failed to submit."));
        } finally {
            setSubmitting(false);
        }
    };

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
                    <IconButton onClick={handlePrev} disabled={loading || saving || submitting}>
                        <ChevronLeftIcon />
                    </IconButton>

                    <Typography fontWeight={700} sx={{ textAlign: "center", fontSize: "18px", minWidth: 160 }}>
                        {format(month, "MMMM yyyy")}
                    </Typography>

                    <IconButton onClick={handleNext} disabled={loading || saving || submitting}>
                        <ChevronRightIcon />
                    </IconButton>
                </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box px={{ xs: 2, sm: 8 }}>
                {/* Week inputs (one row, presentable backgrounds) */}
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
                            gridAutoColumns: "minmax(140px, 1fr)", // each week cell width
                            minWidth: `${Math.max(weeks.length, 4) * 140}px`, // ensures decent spacing; scroll on small screens
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
                                    "&:last-of-type": { borderRight: "none" },
                                }}
                            >
                                {/* Column Header */}
                                <Typography
                                    fontWeight={700}
                                    fontSize={12}
                                    sx={{
                                        textTransform: "uppercase",
                                        letterSpacing: 0.6,
                                        color: "text.secondary",
                                    }}
                                >
                                    {w.label}
                                </Typography>

                                {/* Input */}
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Hours"
                                    value={values[w.key] ?? ""}
                                    onChange={(e) => onChangeWeek(w.key, e.target.value)}
                                    error={!!weekErrors[w.key]}
                                    helperText={weekErrors[w.key] ?? " "}
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

                {/* Compliance row (3 columns) */}
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
                    />

                    <YesNoQuestionCompact
                        label="CoFY updated?"
                        value={complianceValues.cofyUpdated}
                        onChange={(v) => setComplianceValues((p) => ({ ...p, cofyUpdated: v }))}
                        error={showErrors && !!complianceErrors.cofyUpdated}
                        helperText={complianceErrors.cofyUpdated}
                    />

                    <YesNoQuestionCompact
                        label="Citi training completed?"
                        value={complianceValues.citiTrainingCompleted}
                        onChange={(v) => setComplianceValues((p) => ({ ...p, citiTrainingCompleted: v }))}
                        error={showErrors && !!complianceErrors.citiTrainingCompleted}
                        helperText={complianceErrors.citiTrainingCompleted}
                    />
                </Box>

                {/* Actions */}
                <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                    <Button variant="outlined" onClick={handleSave} disabled={loading || saving || submitting}>
                        Save
                    </Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={loading || saving || submitting}>
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
