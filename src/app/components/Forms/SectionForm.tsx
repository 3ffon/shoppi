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
import { useDictionary } from "../../[lang]/Providers/DictionaryProvider";
import { SectionInterface } from "../../lib/interfaces";
import { generateId } from "../../lib/utils";
import React from "react";

interface SectionFormProps {
    section: SectionInterface | undefined;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    addSectionOpen: boolean;
    setAddSectionOpen: (open: boolean) => void;
}

export default function SectionForm({ ...props }: SectionFormProps) {
    const {
        // section,
        onSubmit,
    } = props;

    const theme = useTheme();
    const { dictionary } = useDictionary();
    // const isEdit = section !== undefined;


    const [openSectionForm, toggleSectionFormOpen] = React.useState(false);
    const [newSection, setNewSection] = React.useState<SectionInterface>({
        id: generateId(),
        name: "",
    });

    // const handleSectionFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     toggleSectionFormOpen(false);
    // }

    return (
        <Modal open={openSectionForm} onClose={() => toggleSectionFormOpen(false)}>
            <Box
                className={`${style.item_add_form} ${theme.palette.mode}`}
                component="form"
                onSubmit={onSubmit}

            >
                <Typography variant="h5" component="h2" gutterBottom>{dictionary.section_new_title}</Typography>
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
                        value={newSection.name}
                        onChange={(event) =>
                            setNewSection({
                                ...newSection,
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
                        onClick={() => toggleSectionFormOpen(false)}
                        sx={{ flex: 1 }}
                    >{dictionary.cancel_btn}</Button>
                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ flex: 3 }}
                    >{dictionary.create_btn}
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}