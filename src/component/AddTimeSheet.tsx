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
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
    addMonths,
    subMonths,
    format,
} from "date-fns";
import { getWeeksLabelForMonth } from "../utils/dateUtils";
import type { WeekRow } from "../types/timesheetTypes";
import { type ComplianceAnswers } from "./modal/ComplianceModal";

function YesNoQuestion({
    label,
    value,
    onChange,
}: {
    label: string;
    value: boolean | null;
    onChange: (v: boolean) => void;
}) {
    return (
        <FormControl>
            <FormLabel sx={{ mb: 1 }}>
                <Typography fontWeight={600}>{label}</Typography>
            </FormLabel>

            <RadioGroup
                row
                value={value === null ? "" : value ? "yes" : "no"}
                onChange={(e) => onChange(e.target.value === "yes")}
            >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
        </FormControl>
    );
}

const defaultValues: ComplianceAnswers = {
    ptsSavedTillMonth: false,
    cofyUpdated: false,
    citiTrainingCompleted: false,
};

export default function AddTimeSheet() {
    const [month, setMonth] = React.useState<Date>(new Date());
    const [complianceValues, setComplianceValues] = React.useState<ComplianceAnswers>(
        defaultValues
    );
    // Values saved per month (so switching months keeps different drafts)
    const monthKey = format(month, "yyyy-MM");
    const storageKey = `weekly-form:${monthKey}`;

    const weeks = React.useMemo(() => getWeeksLabelForMonth(month) as WeekRow[], [month]);

    const [values, setValues] = React.useState<Record<string, string>>({});

    // Load draft when month changes
    React.useEffect(() => {
        const raw = localStorage.getItem(storageKey);
        if (!raw) {
            setValues({});
            return;
        }
        try {
            const parsed = JSON.parse(raw) as { values?: Record<string, string> };
            setValues(parsed.values ?? {});
        } catch {
            setValues({});
        }
    }, [storageKey]);

    const handlePrev = () => setMonth((m) => subMonths(m, 1));
    const handleNext = () => setMonth((m) => addMonths(m, 1));

    const onChangeWeek = (weekKey: string, v: string) => {
        setValues((prev) => ({ ...prev, [weekKey]: v }));
    };

    const buildPayload = () => ({
        month: monthKey,
        weeks: weeks.map((w) => ({
            weekStart: format(w.weekStart, "yyyy-MM-dd"),
            weekEnd: format(w.weekEnd, "yyyy-MM-dd"),
            // if you need UTC timestamps:
            weekStartUtcMs: Date.UTC(
                w.weekStart.getFullYear(),
                w.weekStart.getMonth(),
                w.weekStart.getDate(),
                0,
                0,
                0
            ),
            weekEndUtcMs: Date.UTC(
                w.weekEnd.getFullYear(),
                w.weekEnd.getMonth(),
                w.weekEnd.getDate(),
                23,
                59,
                59,
                999
            ),
            input: values[w.key] ?? "",
        })),
    });

    const handleSave = () => {
        localStorage.setItem(storageKey, JSON.stringify({ values }));
        console.log("Saved draft for", monthKey, values);
    };

    const handleSubmit = () => {
        const payload = buildPayload();
        console.log("SUBMIT payload:", payload);

        // TODO: replace with API call
        // await api.post("/weekly-inputs", payload)
    };

      return (
        <Paper elevation={3} sx={{ maxWidth: 900, mx: "auto", mt: 4, p: 3 }}>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                }}
            >
                <Typography variant="h6" fontWeight={700}>
                    Weekly Inputs
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 2,
                        py: 1,
                        gap: 4
                    }}
                >
                    {/* Previous */}
                    <IconButton onClick={handlePrev}>
                        <ChevronLeftIcon />
                    </IconButton>

                    {/* Month Label */}
                    <Typography
                        fontWeight={700}
                        sx={{
                            textAlign: "center",
                            fontSize: "18px",
                            flex: 1,
                        }}
                    >
                        {format(month, "MMMM yyyy")}
                    </Typography>

                    {/* Next */}
                    <IconButton onClick={handleNext}>
                        <ChevronRightIcon />
                    </IconButton>
                </Box>

            </Box>

            <Divider sx={{ my: 2 }} />
            <Box paddingLeft={10} paddingRight={10} >
                {/* Week inputs */}
                <Stack spacing={2} >
                    {weeks.map((w) => (
                        <Box
                            key={w.key}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "80px 1fr" },
                                gap: 2,
                                alignItems: "center",
                            }}
                        >
                            <Typography fontWeight={300}>{w.label}</Typography>

                            <TextField
                                size="small"
                                fullWidth
                                placeholder="Enter value .."
                                value={values[w.key] ?? ""}
                                onChange={(e) => onChangeWeek(w.key, e.target.value)}
                            />
                        </Box>
                    ))}
                </Stack>

                <Stack spacing={3} marginTop={5}>
                    <YesNoQuestion
                        label="PTS saved till month?"
                        value={complianceValues.ptsSavedTillMonth}
                        onChange={(v) =>
                            setComplianceValues((p) => ({ ...p, ptsSavedTillMonth: v }))
                        }
                    />

                    <YesNoQuestion
                        label="Cofy updated?"
                        value={complianceValues.cofyUpdated}
                        onChange={(v) => setComplianceValues((p) => ({ ...p, cofyUpdated: v }))}
                    />

                    <YesNoQuestion
                        label="Citi training completed?"
                        value={complianceValues.citiTrainingCompleted}
                        onChange={(v) =>
                            setComplianceValues((p) => ({ ...p, citiTrainingCompleted: v }))
                        }
                    />
                </Stack>
                {/* Actions */}
                <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                    <Button variant="outlined" onClick={handleSave}>
                        Save
                    </Button>

                    <Button variant="contained" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Box>

            </Box>
        </Paper>
    );
}
