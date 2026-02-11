import * as React from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Divider,
    Stack,
} from "@mui/material";

import {
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addWeeks,
    format,
    isAfter,
    isBefore,
} from "date-fns";

type WeekRow = {
    key: string; // yyyy-MM-dd of weekStart (stable)
    label: string;
    weekStart: Date;
    weekEnd: Date;
};

function getWeeksForMonth(monthDate: Date): WeekRow[] {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    let cursor = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const last = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const weeks: WeekRow[] = [];
    let idx = 1;

    while (!isAfter(cursor, last)) {
        const ws = cursor;
        const we = endOfWeek(ws, { weekStartsOn: 1 });

        // keep only weeks that intersect the month
        const intersects = !(isBefore(we, monthStart) || isAfter(ws, monthEnd));

        if (intersects) {
            const key = format(ws, "yyyy-MM-dd");
            weeks.push({
                key,
                weekStart: ws,
                weekEnd: we,
                label: `Week ${idx}: ${format(ws, "dd MMM")} - ${format(we, "dd MMM")}`,
            });
            idx += 1;
        }

        cursor = addWeeks(cursor, 1);
    }

    return weeks;
}

export default function AddTimeSheet() {
    const [month, setMonth] = React.useState<Date>(new Date());

    // Values saved per month (so switching months keeps different drafts)
    const monthKey = format(month, "yyyy-MM");
    const storageKey = `weekly-form:${monthKey}`;

    const weeks = React.useMemo(() => getWeeksForMonth(month), [month]);

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

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button type="button" variant="contained" sx={{ px: 4 }} onClick={handlePrev}>
                        Prev
                    </Button>

                    <Typography fontWeight={700} sx={{ minWidth: 160, textAlign: "center" }}>
                        {format(month, "MMMM yyyy")}
                    </Typography>
                    <Button type="button" variant="contained" sx={{ px: 4 }} onClick={handleNext}>
                        Next
                    </Button>
                </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Week inputs */}
            <Stack spacing={2}>
                {weeks.map((w) => (
                    <Box
                        key={w.key}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "240px 1fr" },
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

            {/* Actions */}
            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <Button variant="outlined" onClick={handleSave}>
                    Save
                </Button>

                <Button variant="contained" onClick={handleSubmit}>
                    Submit
                </Button>
            </Box>
        </Paper>
    );
}
