// ComplianceModal.tsx (React + TS + MUI)
// npm i @mui/material @mui/icons-material @emotion/react @emotion/styled

import * as React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    Stack,
    Divider,
} from "@mui/material";

export type ComplianceAnswers = {
    ptsSavedTillMonth: boolean | null;
    cofyUpdated: boolean | null;
    citiTrainingCompleted: boolean | null;
};

type Props = {
    open: boolean;
    initialValues?: ComplianceAnswers;
    onClose: () => void;
    onApply: (values: ComplianceAnswers) => void;
};

const defaultValues: ComplianceAnswers = {
    ptsSavedTillMonth: null,
    cofyUpdated: null,
    citiTrainingCompleted: null,
};

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

export default function ComplianceModal({
    open,
    initialValues,
    onClose,
    onApply,
}: Props) {
    const [values, setValues] = React.useState<ComplianceAnswers>(
        initialValues ?? defaultValues
    );

    React.useEffect(() => {
        setValues(initialValues ?? defaultValues);
    }, [initialValues, open]);

    const canApply =
        values.ptsSavedTillMonth !== null &&
        values.cofyUpdated !== null &&
        values.citiTrainingCompleted !== null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pr: 1,
                }}
            >
                <Typography variant="h6" fontWeight={700}>
                    Compliance Check
                </Typography>
                <Button variant="contained" onClick={onClose}>
                    Close
                </Button>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 3 }}>
                <Stack spacing={3}>
                    <YesNoQuestion
                        label="PTS saved till month?"
                        value={values.ptsSavedTillMonth}
                        onChange={(v) =>
                            setValues((p) => ({ ...p, ptsSavedTillMonth: v }))
                        }
                    />

                    <YesNoQuestion
                        label="Cofy updated?"
                        value={values.cofyUpdated}
                        onChange={(v) => setValues((p) => ({ ...p, cofyUpdated: v }))}
                    />

                    <YesNoQuestion
                        label="Citi training completed?"
                        value={values.citiTrainingCompleted}
                        onChange={(v) =>
                            setValues((p) => ({ ...p, citiTrainingCompleted: v }))
                        }
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="text">
                    Cancel
                </Button>
                <Button
                    onClick={() => onApply(values)}
                    variant="contained"
                    disabled={!canApply}
                >
                    Apply
                </Button>
            </DialogActions>
        </Dialog>
    );
}
