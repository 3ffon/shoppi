import {
    Box,
    Typography,
    TextField,
    FormControl,
    Button,
    Modal
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import style from "./forms.module.css";
import { useLanguage } from "@/app/providers_tmp/LanguageProvider";
import { SectionInterface } from "@/app/lib/interfaces";
import { generateId } from "@/app/lib/utils";
import React, { useEffect } from "react";
import { createSection, updateSection } from "@/app/lib/apiClient";

interface SectionFormProps {
    section: SectionInterface | undefined;
    onSubmit: () => void;
    addSectionOpen: boolean;
    setAddSectionOpen: (open: boolean) => void;
}

export default function SectionForm({ ...props }: SectionFormProps) {
    const {
        section,
        onSubmit,
        addSectionOpen,
        setAddSectionOpen
    } = props;

    const theme = useTheme();
    const { dictionary } = useLanguage();
    const isEdit = section !== undefined;

    const [sectionData, setSectionData] = React.useState<SectionInterface>({
        id: generateId(),
        name: "",
    });

    useEffect(() => {
        // If we're editing, populate the form with section data
        if (section) {
            setSectionData({
                ...section
            });
        } else {
            // Reset form for new section
            setSectionData({
                id: generateId(),
                name: "",
            });
        }
    }, [section]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        try {
            if (isEdit) {
                await updateSection(sectionData);
            } else {
                await createSection(sectionData);
            }
            onSubmit();
            setAddSectionOpen(false);
        } catch (error) {
            console.error("Error saving section:", error);
        }
    };

    return (
        <Modal open={addSectionOpen} onClose={() => setAddSectionOpen(false)}>
            <Box
                className={`${style.item_add_form} ${theme.palette.mode}`}
                component="form"
                onSubmit={handleSubmit}
            >
                <Typography variant="h5" component="h2" gutterBottom>
                    {isEdit ? dictionary.section_edit_title || "Edit Section" : dictionary.section_new_title}
                </Typography>
                <FormControl
                    fullWidth
                    sx={{ mb: 2 }}
                    required
                >
                    <TextField
                        fullWidth
                        required
                        autoFocus
                        id="name"
                        value={sectionData.name}
                        onChange={(event) =>
                            setSectionData({
                                ...sectionData,
                                name: event.target.value,
                            })
                        }
                        label={dictionary.section_label}
                        type="text"
                        variant="outlined"
                    />
                </FormControl>
                <Box display="flex" gap={2}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setAddSectionOpen(false)}
                        sx={{ flex: 1 }}
                    >{dictionary.cancel_btn}</Button>
                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ flex: 3 }}
                    >{isEdit ? dictionary.save_btn || "Save" : dictionary.create_btn}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}